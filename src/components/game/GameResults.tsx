"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type TrainingCoefficient } from '@/lib/training/bayes'
import { type ScoreRank } from '@/types/contextTypes'
import { type GameModeName } from '@/types/frontendTypes'
import { type GameResult } from './useTimedGame'
import SolveRateChart from './SolveRateChart'

import {
    ArrowLeft,
    Asterisk,
    BrainCircuit,
    Calculator,
    Clock,
    Crown,
    Divide,
    Flame,
    List,
    NotebookText,
    Rabbit,
    RotateCcw,
    Skull,
    SportShoe,
    Dumbbell,
    Variable,
    Shuffle,
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
    linear: Variable,
    chaos: Shuffle,
    training: Dumbbell
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

type GameResultsProps = {
    gameMode: GameModeName,
    result: GameResult,
    scoreRank?: ScoreRank,
    dailyStreak?: number | null,
    // Omitted for games that can't be replayed (daily)
    onRestart?: () => void,
    trainingCoefficients?: TrainingCoefficient[],
    updatedTrainingCoefficients?: TrainingCoefficient[],
}

function coefficientColor(weight: number, minWeight: number, maxWeight: number) {
    const range = maxWeight - minWeight;
    const position = range === 0 ? 0.5 : (weight - minWeight) / range;
    const hue = Math.round(position * 120);
    return {
        backgroundColor: `hsl(${hue} 70% 90%)`,
        borderColor: `hsl(${hue} 55% 68%)`,
        color: `hsl(${hue} 65% 25%)`,
    };
}

function AnimatedCoefficient({
    before,
    after,
    minWeight,
    maxWeight,
}: {
    before: TrainingCoefficient,
    after?: TrainingCoefficient,
    minWeight: number,
    maxWeight: number,
}) {
    const [displayedAfterWeight, setDisplayedAfterWeight] = useState(before.weight);

    useEffect(() => {
        if (!after) return;
        let frame = 0;
        let startedAt: number | undefined;

        function animate(timestamp: number) {
            startedAt ??= timestamp;
            const progress = Math.min((timestamp - startedAt) / 1000, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayedAfterWeight(
                before.weight + (after!.weight - before.weight) * easedProgress,
            );
            if (progress < 1) {
                frame = window.requestAnimationFrame(animate);
            }
        }

        frame = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(frame);
    }, [after, before.weight]);

    return (
        <div
            className="rounded-lg border px-3 py-2"
            style={coefficientColor(displayedAfterWeight, minWeight, maxWeight)}
        >
            <div className="text-sm font-semibold">{before.feature}</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs tabular-nums">
                <div>
                    <div className="opacity-70">Before</div>
                    <div className="text-sm font-semibold">{before.weight.toFixed(3)}</div>
                </div>
                <div>
                    <div className="opacity-70">After</div>
                    <div className="text-sm font-semibold">
                        {after ? displayedAfterWeight.toFixed(3) : "Saving…"}
                    </div>
                </div>
            </div>
            <div className="mt-1 text-[0.7rem] opacity-70">
                SD: {before.sd.toFixed(3)} → {after ? after.sd.toFixed(3) : "…"}
            </div>
        </div>
    );
}

export default function GameResults({
    gameMode,
    result,
    scoreRank = null,
    dailyStreak = null,
    onRestart,
    trainingCoefficients,
    updatedTrainingCoefficients,
}: GameResultsProps) {
    const router = useRouter();
    const [showProblems, setShowProblems] = useState(true);
    const [showCoefficients, setShowCoefficients] = useState(false);
    const {score, timeFormat, problems: problemList} = result;

    const GameModeIcon = GAME_MODE_ICONS[gameMode];
    const coefficientWeights = [
        ...(trainingCoefficients?.map(({weight}) => weight) ?? []),
        ...(updatedTrainingCoefficients?.map(({weight}) => weight) ?? []),
    ];
    const minCoefficient = coefficientWeights.length > 0 ? Math.min(...coefficientWeights) : 0;
    const maxCoefficient = coefficientWeights.length > 0 ? Math.max(...coefficientWeights) : 0;
    const updatedCoefficientByIndex = new Map(
        updatedTrainingCoefficients?.map((coefficient) => [coefficient.index, coefficient]) ?? [],
    );

    const problemRows = problemList.map((problem, index) => {
        return {
            key: problem.orderNumber ?? index,
            number: (problem.orderNumber ?? index) + 1,
            // Linear statements are a full equation, so the answer is shown as x = ...
            statement: problem.operation === 'linear'
                ? `${problem.statement}, x = ${problem.answer}`
                : `${problem.statement}${problem.answer}`,
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
                        <SolveRateChart problems={problemList} timeFormat={timeFormat} />
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
                    <button
                        onClick={() => setShowProblems((shown) => !shown)}
                        aria-label={showProblems ? "Hide problem list" : "Show problem list"}
                        aria-expanded={showProblems}
                        aria-controls="game-results-problems"
                        title={showProblems ? "Hide problem list" : "Show problem list"}
                        className={`p-1 transition ${
                            showProblems ? 'text-gray-800' : 'text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        <List className="h-6 w-6" aria-hidden="true" />
                    </button>
                    {gameMode === "training" && trainingCoefficients && (
                        <button
                            onClick={() => setShowCoefficients((shown) => !shown)}
                            aria-label={showCoefficients ? "Hide Bayesian coefficients" : "Show Bayesian coefficients"}
                            aria-expanded={showCoefficients}
                            aria-controls="training-coefficients"
                            title={showCoefficients ? "Hide Bayesian coefficients" : "Show Bayesian coefficients"}
                            className={`p-1 transition ${
                                showCoefficients ? 'text-gray-800' : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <BrainCircuit className="h-6 w-6" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            {showCoefficients && trainingCoefficients && (
                <div
                    id="training-coefficients"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8"
                >
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
                        Bayesian model coefficients
                    </h3>
                    
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {trainingCoefficients.map((coefficient) => {
                            const updatedCoefficient = updatedCoefficientByIndex.get(coefficient.index);
                            return (
                                <AnimatedCoefficient
                                    key={`${coefficient.index}-${updatedCoefficient?.weight ?? "pending"}`}
                                    before={coefficient}
                                    after={updatedCoefficient}
                                    minWeight={minCoefficient}
                                    maxWeight={maxCoefficient}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {showProblems && (
                <div
                    id="game-results-problems"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8"
                >
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
            )}
        </section>
    );
}
