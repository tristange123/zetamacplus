"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useRouter } from 'next/navigation';
import { type ScoreRank } from '@/types/contextTypes'
import { type GameModeName } from '@/types/frontendTypes'
import { type GameResult } from './useTimedGame'
import {
    ArrowLeft,
    Asterisk,
    Calculator,
    Clock,
    Crown,
    Divide,
    Flame,
    NotebookText,
    Rabbit,
    RotateCcw,
    Skull,
    SportShoe,
    type LucideIcon,
} from 'lucide-react'

const GAME_MODE_ICONS: Record<GameModeName, LucideIcon> = {
    standard: Calculator,
    rapid: Rabbit,
    sprint: SportShoe,
    hard: Skull,
    custom: NotebookText,
    daily: Clock,
    gcd: Divide,
    lcm: Asterisk,
};

const RANK_CROWN_CLASSES: Record<Exclude<ScoreRank, null>, string> = {
    1: "fill-amber-200 text-amber-500",
    2: "fill-gray-200 text-gray-400",
    3: "fill-orange-200 text-orange-600",
};



function formatSolveTime(seconds: number | null): string {
    if (seconds == null) return '—';
    return `${seconds.toFixed(1)}s`;
}

// moving average points per 2 minutes
function PPM(solveTimes: number[], totalTime: number) {
    const res = [{ time: 0, score: 0 }];

    for (let i = 1; i <= totalTime; i++) {
        let rate;
        if (i < 3) {
            rate = solveTimes.filter((x) => {
                return x > 0 && x < i + 3;
            }).length / (i + 3);
        } else if (i > totalTime - 3) {
            rate = solveTimes.filter((x) => {
                return x < totalTime && x > i - 3;
            }).length / (totalTime - i + 3);
        } else {
            rate = solveTimes.filter((x) => {
                return x < i + 3 && x > i - 3;
            }).length / 6;
        }
        res.push({ time: i, score: totalTime * rate });
    }
    return res;
}

function getTimeTicks(totalTime: number) {
    const tickCount = 4;
    return Array.from({ length: tickCount + 1 }, (_, index) => Number(((totalTime / tickCount) * index).toFixed(2)));
}

function exponentialSmoothing(data: Record<string, number>[], alpha = 0.5) {
    if (!data || data.length === 0) return [];

    const smoothed = [{ time: data[0].time, score: data[0].score }];

    for (let i = 1; i < data.length; i++) {
        const smoothedScore = alpha * data[i].score + (1 - alpha) * smoothed[i - 1].score;
        smoothed.push({ time: data[i].time, score: Number(smoothedScore.toFixed(2)) });
    }

    return smoothed;
}

type GameResultsProps = {
    gameMode: GameModeName,
    result: GameResult,
    scoreRank?: ScoreRank,
    dailyStreak?: number | null,
    // Omitted for games that can't be replayed (daily)
    onRestart?: () => void,
}

export default function GameResults({gameMode, result, scoreRank = null, dailyStreak = null, onRestart}: GameResultsProps) {
    const router = useRouter();
    const {score, timeFormat, problems: problemList} = result;

    const solveTimes: number[] = []
    let curr = 0
    for (const problem of problemList){
        if(problem.solveTime){
            curr += problem.solveTime;
            solveTimes.push(curr);
        }
    }

    const rawSolveRates = PPM(solveTimes, timeFormat);
    const solveRatesAlpha02 = exponentialSmoothing(rawSolveRates, 0.2);
    const solveRatesAlpha07 = exponentialSmoothing(rawSolveRates, 1);
    const solveRates = solveRatesAlpha02.map((point, index) => ({
        time: point.time,
        alpha02: point.score,
        alpha07: solveRatesAlpha07[index].score,
    }));
    const timeTicks = getTimeTicks(timeFormat);
    const GameModeIcon = GAME_MODE_ICONS[gameMode];

    const problemRows = problemList.map((problem, index) => {
        return {
            key: problem.orderNumber ?? index,
            number: (problem.orderNumber ?? index) + 1,
            statement: `${problem.statement}${problem.answer}`,
            solveTime: problem.solveTime,
        };
    });

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-3 py-3 md:gap-5 md:py-8">
            <div className="relative w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8">
                <div className="mb-6 flex w-full gap-3 md:gap-4">
                    <div className="flex aspect-square h-20 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm md:h-24">
                        <GameModeIcon
                            className="h-9 w-9 text-gray-600 md:h-11 md:w-11"
                            aria-label={`${gameMode} game mode`}
                        />
                    </div>
                    <div className="relative flex min-w-0 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 shadow-sm">
                        <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                            Score: {score}
                            {scoreRank != null && (
                                <Crown
                                    className={`h-7 w-7 ${RANK_CROWN_CLASSES[scoreRank]}`}
                                    aria-label={`${scoreRank === 1 ? "First" : scoreRank === 2 ? "Second" : "Third"} best score`}
                                />
                            )}
                        </h2>
                        {gameMode === "daily" && dailyStreak !== null && (
                            <span
                                className="absolute right-4 top-3 flex items-center gap-1 text-sm font-semibold text-gray-700"
                                aria-label={`Daily streak: ${dailyStreak} days`}
                            >
                                <Flame
                                    className={`h-4 w-4 ${
                                        dailyStreak > 0 ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                    }`}
                                    aria-hidden="true"
                                />
                                {dailyStreak}
                            </span>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-1 md:p-5">
                    <div className="h-64 w-full md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={solveRates}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="time"
                                    type="number"
                                    domain={[0, timeFormat]}
                                    ticks={timeTicks}
                                    tickFormatter={(time) => `${time}`}
                                    tick={{ fill: '#4b5563', fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} />
                                {solveTimes.map((solveTime, index) => (
                                    <ReferenceLine
                                        key={`${solveTime}-${index}`}
                                        x={solveTime}
                                        stroke="rgba(0, 0, 0, 0.16)"
                                        strokeWidth={1}
                                    />
                                ))}
                                <Tooltip
                                    labelFormatter={(time) => `Time: ${time}`}
                                    formatter={(rate) => [rate, 'Rate']}
                                    contentStyle={{
                                        borderRadius: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        color: '#1f2937',
                                    }}
                                />
                                <Line type="monotone" dataKey="alpha07" stroke="#d1d5db" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="alpha02" stroke="#374151" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-10 flex justify-center gap-10">
                    {onRestart && (<button
                        onClick={onRestart}
                        aria-label="Restart"
                        title="Restart"
                        className="p-1 text-gray-500 transition hover:text-gray-700"
                    >
                        <RotateCcw className="h-6 w-6" aria-hidden="true" />
                    </button>
                    )}
                    <button
                        onClick={() => router.push('/')}
                        aria-label="Back"
                        title="Back"
                        className="p-1 text-gray-500 transition hover:text-gray-700"
                    >
                        <ArrowLeft className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8">
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    {problemList.length === 0 ? (
                        <p className="px-4 py-6 text-center text-base text-gray-500 md:px-5 md:text-lg">No problems solved.</p>
                    ) : (
                        <table className="min-w-[22rem] w-full text-sm md:min-w-0 md:text-lg">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/80">
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">#</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Problem</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Solve Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problemRows.map((row) => (
                                    <tr
                                        key={row.key}
                                        className="border-b border-gray-200 last:border-b-0"
                                    >
                                        <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {row.number}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-800 md:px-5">
                                            {row.statement}
                                        </td>

                                        <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {formatSolveTime(row.solveTime)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </section>
    );
}
