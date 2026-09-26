'use client'

import {
    Calculator,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Rabbit,
    Skull,
    SportShoe,
    Trophy,
    X,
    type LucideIcon,
} from 'lucide-react';
import {useState} from 'react';
import {type ProblemDb} from '@/types/dbTypes';
import {type MainGameModeName} from '@/types/frontendTypes';

export type LeaderboardGameModeName = MainGameModeName | 'daily';

export type LeaderboardRow = {
    testId: string | null,
    username: string,
    score: number,
    time: string | null
}

export type LeaderboardData = Record<LeaderboardGameModeName, LeaderboardRow[]>
export type ProblemsSolvedLeaderboardData = Record<MainGameModeName, LeaderboardRow[]>
type LeaderboardMetric = 'highScore' | 'problemsSolved';

const GAME_MODE_ICONS: Record<LeaderboardGameModeName, LucideIcon> = {
    standard: Calculator,
    rapid: Rabbit,
    sprint: SportShoe,
    hard: Skull,
    daily: CalendarDays,
};

type ClientSideProps = {
    gameModes: LeaderboardGameModeName[],
    leaderboards: LeaderboardData,
    problemsSolvedLeaderboards: ProblemsSolvedLeaderboardData
}

function formatGameMode(gameMode: LeaderboardGameModeName) {
    return gameMode.charAt(0).toUpperCase() + gameMode.slice(1);
}

function formatTime(time: string) {
    return new Date(time).toLocaleString();
}

function formatLeaderboardTime(time: string | null, gameMode: LeaderboardGameModeName) {
    if (gameMode === 'daily') return 'Today';
    if (time === null) return '—';
    return formatTime(time);
}

function formatSolveTime(seconds: number | null): string {
    if (seconds == null) return '—';
    return `${seconds.toFixed(1)}s`;
}

export default function ClientSide({gameModes, leaderboards, problemsSolvedLeaderboards}: ClientSideProps) {
    const [selectedGameMode, setSelectedGameMode] = useState<LeaderboardGameModeName>(gameModes[0] ?? 'standard');
    const [selectedMetric, setSelectedMetric] = useState<LeaderboardMetric>('highScore');
    const [expandedGameMode, setExpandedGameMode] = useState<MainGameModeName | null>(
        gameModes.find((gameMode): gameMode is MainGameModeName => gameMode !== 'daily') ?? null
    );
    const [selectedRow, setSelectedRow] = useState<LeaderboardRow | null>(null);
    const [problems, setProblems] = useState<ProblemDb[]>([]);
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [problemError, setProblemError] = useState('');
    const rows = selectedMetric === 'problemsSolved' && selectedGameMode !== 'daily'
        ? problemsSolvedLeaderboards[selectedGameMode] ?? []
        : leaderboards[selectedGameMode] ?? [];
    const showTimeColumn = selectedMetric === 'highScore' && selectedGameMode !== 'daily';
    const showDetailsColumn = selectedMetric === 'highScore';
    const GameModeIcon = GAME_MODE_ICONS[selectedGameMode];

    function selectMainGameMode(gameMode: MainGameModeName) {
        setSelectedGameMode(gameMode);
        setSelectedMetric('highScore');
        setExpandedGameMode((expanded) => expanded === gameMode ? null : gameMode);
        setSelectedRow(null);
    }

    function selectMetric(gameMode: MainGameModeName, metric: LeaderboardMetric) {
        setSelectedGameMode(gameMode);
        setSelectedMetric(metric);
        setExpandedGameMode(gameMode);
        setSelectedRow(null);
    }

    function selectDaily() {
        setSelectedGameMode('daily');
        setSelectedMetric('highScore');
        setSelectedRow(null);
    }

    async function toggleProblemSidebar(row: LeaderboardRow) {
        if (!row.testId){
            return;
        }
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
        <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-4 md:flex-row md:gap-5">
            <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm md:w-56">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Game Modes</h2>
                <nav className="space-y-2">
                    {gameModes.map((gameMode) => {
                        const isSelected = gameMode === selectedGameMode;
                        if (gameMode === 'daily'){
                            return (
                                <button
                                    key={gameMode}
                                    type="button"
                                    onClick={selectDaily}
                                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                                        isSelected
                                            ? 'bg-gray-200 text-gray-900 shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {formatGameMode(gameMode)}
                                </button>
                            );
                        }

                        const isExpanded = expandedGameMode === gameMode;
                        return (
                            <div key={gameMode}>
                                <button
                                    type="button"
                                    onClick={() => selectMainGameMode(gameMode)}
                                    aria-expanded={isExpanded}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                                        isSelected
                                            ? 'bg-gray-200 text-gray-900 shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {formatGameMode(gameMode)}
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>
                                {isExpanded && (
                                    <div className="mt-1 space-y-1 pl-3">
                                        <button
                                            type="button"
                                            onClick={() => selectMetric(gameMode, 'highScore')}
                                            className={`w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition ${
                                                isSelected && selectedMetric === 'highScore'
                                                    ? 'bg-gray-200 text-gray-900'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            High Score
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => selectMetric(gameMode, 'problemsSolved')}
                                            className={`w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition ${
                                                isSelected && selectedMetric === 'problemsSolved'
                                                    ? 'bg-gray-200 text-gray-900'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            Problems Solved
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            <div className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50/70 p-3 shadow-sm md:p-5">
                <div className="mb-5 flex items-center justify-between md:mb-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gray-200 p-2.5 text-gray-700">
                            <GameModeIcon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
                            {formatGameMode(selectedGameMode)}
                        </h1>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-100 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th className="w-14 px-2 py-3 sm:w-20 sm:px-4">Rank</th>
                                <th className="px-2 py-3 sm:px-4">Username</th>
                                <th className="px-2 py-3 sm:px-4">
                                    {selectedMetric === 'problemsSolved' ? 'Problems Solved' : 'Score'}
                                </th>
                                {showTimeColumn && <th className="hidden px-4 py-3 sm:table-cell">Time</th>}
                                {showDetailsColumn && (
                                    <th className="w-10 px-2 py-3 sm:w-12 sm:px-4" aria-label="View problems"></th>
                                )}
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
                                        <td className="px-2 py-3 font-semibold tabular-nums text-gray-700 sm:px-4">
                                            {index === 0 ? (
                                                <Trophy className="mx-auto h-5 w-5 text-yellow-500" aria-label="First place" />
                                            ) : (
                                                index + 1
                                            )}
                                        </td>
                                        <td className="break-words px-2 py-3 font-medium text-gray-800 sm:px-4">{row.username}</td>
                                        <td className="px-2 py-3 tabular-nums sm:px-4">{row.score}</td>
                                        {showTimeColumn && (
                                            <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">{formatLeaderboardTime(row.time, selectedGameMode)}</td>
                                        )}
                                        {showDetailsColumn && (
                                            <td className="px-2 py-3 text-gray-500 sm:px-4">
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
                                        )}
                                    </tr>
                                );
                            })}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={3 + Number(showTimeColumn) + Number(showDetailsColumn)} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No leaderboard entries yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRow && (
                <aside className="w-full max-w-2xl shrink-0 rounded-2xl border border-gray-200 bg-gray-50/95 p-4 shadow-xl md:p-5 lg:w-[28rem]">
                    <div>
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-gray-800">
                                    {selectedRow.username} Problems
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedRow.score} pts - {formatGameMode(selectedGameMode)} - {formatLeaderboardTime(selectedRow.time, selectedGameMode)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRow(null)}
                                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                                aria-label="Close problems"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
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
