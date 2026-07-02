'use client'

import {useState} from 'react';
import {type MainGameModeName} from '@/types/frontendTypes';

export type LeaderboardRow = {
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

export default function ClientSide({gameModes, leaderboards}: ClientSideProps) {
    const [selectedGameMode, setSelectedGameMode] = useState<MainGameModeName>(gameModes[0] ?? 'standard');
    const rows = leaderboards[selectedGameMode] ?? [];

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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rows.map((row, index) => (
                                <tr key={`${row.username}-${row.time}-${index}`} className="text-center text-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-800">{row.username}</td>
                                    <td className="px-4 py-3 tabular-nums">{row.score}</td>
                                    <td className="px-4 py-3 text-gray-600">{formatTime(row.time)}</td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No leaderboard entries yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
