"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type Problem } from "@/types/frontendTypes";
import { type VersusResultsPayload } from "@/types/versusTypes";
import { authClient } from "@/lib/auth/auth-client";
import {
    Calculator,
    Crown,
    Rabbit,
    Skull,
    SportShoe,
    type LucideIcon,
} from "lucide-react";

const GAME_MODE_ICONS: Record<"standard" | "rapid" | "sprint" | "hard", LucideIcon> = {
    standard: Calculator,
    rapid: Rabbit,
    sprint: SportShoe,
    hard: Skull,
};

const PLAYER_COLORS = ["#374151", "#2563eb"];

function formatSolveTime(seconds: number | null): string {
    if (seconds == null) return "—";
    return `${seconds.toFixed(1)}s`;
}

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

function solveTimesFromProblems(problemList: Problem[]) {
    const solveTimes: number[] = [];
    let curr = 0;
    for (const problem of problemList) {
        if (problem.solveTime) {
            curr += problem.solveTime;
            solveTimes.push(curr);
        }
    }
    return solveTimes;
}

function PlayerProblemTable({ problemList }: { problemList: Problem[] }) {
    const problemRows = problemList.map((problem, index) => ({
        key: problem.orderNumber ?? index,
        number: (problem.orderNumber ?? index) + 1,
        statement: `${problem.statement}${problem.answer}`,
        solveTime: problem.solveTime,
    }));

    return (
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
                            <tr key={row.key} className="border-b border-gray-200 last:border-b-0">
                                <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">{row.number}</td>
                                <td className="px-4 py-3 text-center text-gray-800 md:px-5">{row.statement}</td>
                                <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                    {formatSolveTime(row.solveTime)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default function VersusResultsClient({ gameId }: { gameId: string }) {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [results, setResults] = useState<VersusResultsPayload | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadResults() {
            try {
                const response = await fetch(`/api/versus/results/${gameId}`, { cache: "no-store" });
                if (response.status === 401) {
                    if (!cancelled) setError("Log in to view these results.");
                    return true;
                }
                if (response.status === 404) {
                    if (!cancelled) setError("Results not found.");
                    return true;
                }
                if (!response.ok) {
                    throw new Error("Could not load results.");
                }
                const payload = await response.json() as VersusResultsPayload;
                if (!cancelled) setResults(payload);
                return payload.status === "finished";
            }
            catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Could not load results.");
                }
                return true;
            }
        }

        void loadResults();
        const interval = setInterval(() => {
            void loadResults().then((done) => {
                if (done) clearInterval(interval);
            });
        }, 1000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [gameId]);

    if (error) {
        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Versus Results</h1>
                    <p className="mt-2 text-sm text-gray-600">{error}</p>
                    <div className="mt-5">
                        <button
                            type="button"
                            onClick={() => router.push("/versusMenu")}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (!results || results.players.length < 1) {
        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <p className="text-sm text-gray-500">Loading results...</p>
            </section>
        );
    }

    const timeFormat = results.timeFormat;
    const GameModeIcon = GAME_MODE_ICONS[results.gameMode];
    const currentUserId = session?.user.id;
    const players = results.players;
    const winnerScore = Math.max(...players.map((player) => player.score));
    const tied = players.length > 1 && players.every((player) => player.score === players[0].score);

    const playerSolveTimes = players.map((player) => solveTimesFromProblems(player.problemSet));
    const playerRates = playerSolveTimes.map((times) => exponentialSmoothing(PPM(times, timeFormat), 0.2));
    const chartData = playerRates[0].map((point, index) => {
        const row: Record<string, number> = { time: point.time };
        playerRates.forEach((series, playerIndex) => {
            row[`player${playerIndex}`] = series[index]?.score ?? 0;
        });
        return row;
    });
    const timeTicks = getTimeTicks(timeFormat);

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-3 py-3 md:gap-5 md:py-8">
            <div className="relative w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8">
                <div className="mb-6 flex w-full gap-3 md:gap-4">
                    <div className="flex aspect-square h-20 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm md:h-24">
                        <GameModeIcon
                            className="h-9 w-9 text-gray-600 md:h-11 md:w-11"
                            aria-label={`${results.gameMode} versus mode`}
                        />
                    </div>
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                        {players.map((player, index) => {
                            const isWinner = !tied && player.score === winnerScore && results.status === "finished";
                            const isYou = player.userId === currentUserId;
                            return (
                                <div
                                    key={player.userId}
                                    className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
                                >
                                    <div className="text-center">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            {isYou ? "You" : player.username}
                                        </p>
                                        <h2 className="mt-1 flex items-center justify-center gap-2 text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                                            Score: {player.score}
                                            {isWinner && (
                                                <Crown
                                                    className="h-7 w-7 fill-amber-200 text-amber-500"
                                                    aria-label="Winner"
                                                />
                                            )}
                                        </h2>
                                        {results.status !== "finished" && !player.finished && (
                                            <p className="mt-1 text-xs text-gray-500">Still playing...</p>
                                        )}
                                    </div>
                                    <span
                                        className="sr-only"
                                        style={{ color: PLAYER_COLORS[index] }}
                                    >
                                        {player.username}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {players.map((player, index) => (
                        <span key={player.userId} className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: PLAYER_COLORS[index] }}
                                aria-hidden="true"
                            />
                            {player.username}
                        </span>
                    ))}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-1 md:p-5">
                    <div className="h-64 w-full md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="time"
                                    type="number"
                                    domain={[0, timeFormat]}
                                    ticks={timeTicks}
                                    tickFormatter={(time) => `${time}`}
                                    tick={{ fill: "#4b5563", fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
                                {playerSolveTimes.flatMap((times, playerIndex) => times.map((solveTime, index) => (
                                    <ReferenceLine
                                        key={`${playerIndex}-${solveTime}-${index}`}
                                        x={solveTime}
                                        stroke={PLAYER_COLORS[playerIndex]}
                                        strokeOpacity={0.2}
                                        strokeWidth={1}
                                    />
                                )))}
                                <Tooltip
                                    labelFormatter={(time) => `Time: ${time}`}
                                    formatter={(rate, name) => {
                                        const playerIndex = Number(String(name).replace("player", ""));
                                        return [rate, players[playerIndex]?.username ?? "Rate"];
                                    }}
                                    contentStyle={{
                                        borderRadius: "0.5rem",
                                        border: "1px solid #d1d5db",
                                        color: "#1f2937",
                                    }}
                                />
                                {players.map((player, index) => (
                                    <Line
                                        key={player.userId}
                                        type="monotone"
                                        dataKey={`player${index}`}
                                        stroke={PLAYER_COLORS[index]}
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/versusMenu")}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
                {players.map((player) => (
                    <div key={player.userId} className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-8">
                        <h3 className="mb-3 text-center text-lg font-semibold text-gray-800">
                            {player.username}
                        </h3>
                        <PlayerProblemTable problemList={player.problemSet} />
                    </div>
                ))}
            </div>
        </section>
    );
}
