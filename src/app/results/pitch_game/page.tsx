"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Music } from "lucide-react";
import {
    PITCH_GAME_DURATION,
    PITCH_GAME_RESULTS_KEY,
    type PitchGameResults,
} from "@/lib/game/pitchGame";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function formatSolveTime(seconds: number): string {
    return `${seconds.toFixed(1)}s`;
}

function correctAnswersPerTwoMinutes(answerTimes: number[], totalTime: number) {
    const rates = [{ time: 0, score: 0 }];

    for (let second = 1; second <= totalTime; second++) {
        let rate;
        if (second < 3) {
            rate = answerTimes.filter((time) => time > 0 && time < second + 3).length / (second + 3);
        } else if (second > totalTime - 3) {
            rate = answerTimes.filter((time) => time < totalTime && time > second - 3).length
                / (totalTime - second + 3);
        } else {
            rate = answerTimes.filter((time) => time < second + 3 && time > second - 3).length / 6;
        }
        rates.push({ time: second, score: totalTime * rate });
    }

    return rates;
}

function smooth(data: { time: number; score: number }[], alpha: number) {
    if (data.length === 0) return [];
    const smoothed = [{ ...data[0] }];

    for (let index = 1; index < data.length; index++) {
        const score = alpha * data[index].score + (1 - alpha) * smoothed[index - 1].score;
        smoothed.push({ time: data[index].time, score: Number(score.toFixed(2)) });
    }

    return smoothed;
}

export default function PitchGameResults() {
    const router = useRouter();
    const [results, setResults] = useState<PitchGameResults>({
        score: 0,
        duration: PITCH_GAME_DURATION,
        attempts: [],
    });

    useEffect(() => {
        const storedResults = localStorage.getItem(PITCH_GAME_RESULTS_KEY);
        if (!storedResults) return;

        try {
            const parsed = JSON.parse(storedResults) as PitchGameResults;
            queueMicrotask(() => setResults(parsed));
        } catch {
            localStorage.removeItem(PITCH_GAME_RESULTS_KEY);
        }
    }, []);

    const correctAnswerTimes = results.attempts
        .filter((attempt) => attempt.correct)
        .map((attempt) => attempt.elapsedTime);
    const rawRates = correctAnswersPerTwoMinutes(correctAnswerTimes, results.duration);
    const smoothedRates = smooth(rawRates, 0.2);
    const unsmoothedRates = smooth(rawRates, 1);
    const chartData = smoothedRates.map((point, index) => ({
        time: point.time,
        smoothed: point.score,
        raw: unsmoothedRates[index].score,
    }));
    const timeTicks = Array.from(
        { length: 5 },
        (_, index) => Number(((results.duration / 4) * index).toFixed(2)),
    );

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-3 py-3 md:gap-5 md:py-8">
            <div className="relative w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8">
                <div className="mb-6 flex w-full gap-3 md:gap-4">
                    <div className="flex aspect-square h-20 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm md:h-24">
                        <Music className="h-9 w-9 text-gray-600 md:h-11 md:w-11" aria-label="Pitch game" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 shadow-sm">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                            Score: {results.score}
                        </h1>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-1 md:p-5">
                    <div className="h-64 w-full md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="time"
                                    type="number"
                                    domain={[0, results.duration]}
                                    ticks={timeTicks}
                                    tick={{ fill: "#4b5563", fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
                                {correctAnswerTimes.map((answerTime, index) => (
                                    <ReferenceLine
                                        key={`${answerTime}-${index}`}
                                        x={answerTime}
                                        stroke="rgba(0, 0, 0, 0.16)"
                                        strokeWidth={1}
                                    />
                                ))}
                                <Tooltip
                                    labelFormatter={(time) => `Time: ${time}`}
                                    formatter={(rate) => [rate, "Rate"]}
                                    contentStyle={{
                                        borderRadius: "0.5rem",
                                        border: "1px solid #d1d5db",
                                        color: "#1f2937",
                                    }}
                                />
                                <Line type="monotone" dataKey="raw" stroke="#d1d5db" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="smoothed" stroke="#374151" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.replace("/game/pitch_game")}
                        className="rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                    >
                        Restart
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8">
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    {results.attempts.length === 0 ? (
                        <p className="px-4 py-6 text-center text-base text-gray-500 md:px-5 md:text-lg">
                            No problems answered.
                        </p>
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
                                {results.attempts.map((attempt) => (
                                    <tr
                                        key={attempt.orderNumber}
                                        className="border-b border-gray-200 last:border-b-0"
                                    >
                                        <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {attempt.orderNumber + 1}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-800 md:px-5">
                                            <span className={attempt.correct ? "text-green-700" : "text-red-700"}>
                                                Heard {attempt.expected}; chose {attempt.selected}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                            {formatSolveTime(attempt.solveTime)}
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
