'use client'

import {ChevronRight} from 'lucide-react';
import {useState} from 'react';
import {type ProblemDb} from '@/types/dbTypes';
import {type MainGameModeName} from '@/types/frontendTypes';

export type LeaderboardRow = {
    testId: string,
    username: string,
    score: number,
    time: string
}

export type LeaderboardData = Record<MainGameModeName, LeaderboardRow[]>

type ClientSideProps = {
    gameModes: MainGameModeName[],
    leaderboards: LeaderboardData
}

function formatGameMode(gameMode: MainGameModeName) {
    return gameMode.charAt(0).toUpperCase() + gameMode.slice(1);
}

function formatTime(time: string) {
    return new Date(time).toLocaleString();
}

function formatSolveTime(seconds: number | null): string {
    if (seconds == null) return '—';
    return `${seconds.toFixed(1)}s`;
}

export default function ClientSide({gameModes, leaderboards}: ClientSideProps) {
    const [selectedGameMode, setSelectedGameMode] = useState<MainGameModeName>(gameModes[0] ?? 'standard');
    const [selectedRow, setSelectedRow] = useState<LeaderboardRow | null>(null);
    const [problems, setProblems] = useState<ProblemDb[]>([]);
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [problemError, setProblemError] = useState('');
    const rows = leaderboards[selectedGameMode] ?? [];

    async function toggleProblemSidebar(row: LeaderboardRow) {
        if (selectedRow?.testId === row.testId){
            setSelectedRow(null);
            return;
        }

        setSelectedRow(row);
        setProblems([]);
        setProblemError('');
        setLoadingProblems(true);

        try{
            const response = await fetch(`/api/problem?testId=${encodeURIComponent(row.testId)}`);
            if (!response.ok){
                setProblemError('Could not load problems for this test.');
                return;
            }
            const testProblems: ProblemDb[] = await response.json();
            setProblems(testProblems);
        }
        catch{
            setProblemError('Could not load problems for this test.');
        }
        finally{
            setLoadingProblems(false);
        }
    }

    return (
        <section className="flex min-h-[calc(100vh-9rem)] gap-5">
            <aside className="w-44 shrink-0 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm md:w-56">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Game Modes</h2>
                <nav className="space-y-2">
                    {gameModes.map((gameMode) => {
                        const isSelected = gameMode === selectedGameMode;
                        return (
                            <button
                                key={gameMode}
                                type="button"
                                onClick={() => setSelectedGameMode(gameMode)}
                                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                                    isSelected
                                        ? 'bg-gray-200 text-gray-900 shadow-sm'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {formatGameMode(gameMode)}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <div className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
                            {formatGameMode(selectedGameMode)} Leaderboard
                        </h1>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-100 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Score</th>
                                <th className="px-4 py-3">Time</th>
                                <th className="w-12 px-4 py-3" aria-label="View problems"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rows.map((row, index) => {
                                const isSelected = selectedRow?.testId === row.testId;
                                return (
                                    <tr
                                        key={`${row.username}-${row.time}-${index}`}
                                        className={`text-center text-gray-700 transition hover:bg-gray-50 ${
                                            isSelected ? 'bg-gray-50' : ''
                                        }`}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-800">{row.username}</td>
                                        <td className="px-4 py-3 tabular-nums">{row.score}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatTime(row.time)}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            <button
                                                type="button"
                                                onClick={() => toggleProblemSidebar(row)}
                                                className="mx-auto flex rounded-full p-1 transition hover:bg-gray-100"
                                                aria-label={`${isSelected ? 'Hide' : 'View'} problems for ${row.username}`}
                                            >
                                                <ChevronRight
                                                    className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-180' : ''}`}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No leaderboard entries yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRow && (
                <aside className="w-full max-w-2xl shrink-0 rounded-2xl border border-gray-200 bg-gray-50/95 p-5 shadow-xl lg:w-[28rem]">
                    <div>
                        <div className="mb-4">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-gray-800">
                                    {selectedRow.username} Problems
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedRow.score} pts - {formatGameMode(selectedGameMode)} - {formatTime(selectedRow.time)}
                                </p>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-gray-200 bg-white">
                            {loadingProblems ? (
                                <p className="px-4 py-6 text-center text-base text-gray-500 md:px-5 md:text-lg">Loading problems...</p>
                            ) : problemError ? (
                                <p className="px-4 py-6 text-center text-base text-gray-500 md:px-5 md:text-lg">{problemError}</p>
                            ) : problems.length === 0 ? (
                                <p className="px-4 py-6 text-center text-base text-gray-500 md:px-5 md:text-lg">No problems found.</p>
                            ) : (
                                <table className="w-full text-base md:text-lg">
                                    <thead>
                                        <tr className="border-b border-gray-50 bg-gray-50/80">
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Problem</th>
                                            <th className="px-4 py-3 text-center font-semibold text-gray-700 md:px-5">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {problems.map((problem) => (
                                            <tr
                                                key={problem.id}
                                                className="border-b border-gray-200 last:border-b-0"
                                            >
                                                <td className="px-4 py-3 text-center text-gray-800 md:px-5">
                                                    {problem.statement}{problem.answer}
                                                </td>
                                                <td className="px-4 py-3 text-center tabular-nums text-gray-600 md:px-5">
                                                    {formatSolveTime(problem.solveTime)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </aside>
            )}
        </section>
    );
}
