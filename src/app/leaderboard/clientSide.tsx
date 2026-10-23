'use client'

import {
    ArrowDown,
    ArrowUp,
    Calculator,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Rabbit,
    Search,
    Skull,
    SportShoe,
    Trophy,
    X,
    type LucideIcon,
} from 'lucide-react';
import {useState} from 'react';
import {type ProblemDb} from '@/types/dbTypes';
import {type MainGameModeName} from '@/types/frontendTypes';
import {ColumnMenu, MenuCheckbox, MenuSectionLabel} from '@/components/ColumnMenu';

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
type LeaderboardSort = 'rank' | 'newest' | 'oldest';

type RankedRow = {
    row: LeaderboardRow,
    rank: number,
}

// Rows arrive in rank order, so the rank is captured before any re-sorting.
function sortRankedRows(rows: RankedRow[], sort: LeaderboardSort): RankedRow[] {
    const timeOf = ({row}: RankedRow) => row.time ? new Date(row.time).getTime() : 0;
    return [...rows].sort((a, b) => {
        if (sort === 'newest') return timeOf(b) - timeOf(a) || a.rank - b.rank;
        if (sort === 'oldest') return timeOf(a) - timeOf(b) || a.rank - b.rank;
        return a.rank - b.rank;
    });
}

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

function formatLeaderboardTime(time: string | null, gameMode: LeaderboardGameModeName) {
    if (gameMode === 'daily') return 'Today';
    if (time === null) return '—';
    return new Date(time).toLocaleString();
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
    const [sort, setSort] = useState<LeaderboardSort>('rank');
    const [usernameQuery, setUsernameQuery] = useState('');
    const rows = selectedMetric === 'problemsSolved' && selectedGameMode !== 'daily'
        ? problemsSolvedLeaderboards[selectedGameMode] ?? []
        : leaderboards[selectedGameMode] ?? [];
    const showTimeColumn = selectedMetric === 'highScore' && selectedGameMode !== 'daily';
    const showDetailsColumn = selectedMetric === 'highScore';
    const GameModeIcon = GAME_MODE_ICONS[selectedGameMode];
    const scoreLabel = selectedMetric === 'problemsSolved' ? 'Problems Solved' : 'Score';
    const columnCount = 3 + Number(showTimeColumn) + Number(showDetailsColumn);

    const normalizedQuery = usernameQuery.trim().toLowerCase();
    const rankedRows = rows.map((row, index) => ({row, rank: index + 1}));
    const filteredRows = normalizedQuery
        ? rankedRows.filter(({row}) => row.username.toLowerCase().includes(normalizedQuery))
        : rankedRows;
    const visibleRows = sortRankedRows(filteredRows, sort);
    const isFiltered = normalizedQuery.length > 0;
    const isCustomized = isFiltered || sort !== 'rank';
    const isDateSort = sort === 'newest' || sort === 'oldest';

    function resetTableOptions() {
        setSort('rank');
        setUsernameQuery('');
    }

    // Clicking a checked sort option again falls back to rank order.
    function toggleSort(option: LeaderboardSort) {
        setSort((current) => current === option ? 'rank' : option);
    }

    function selectMainGameMode(gameMode: MainGameModeName) {
        setSelectedGameMode(gameMode);
        setSelectedMetric('highScore');
        setExpandedGameMode((expanded) => expanded === gameMode ? null : gameMode);
        setSelectedRow(null);
        resetTableOptions();
    }

    function selectMetric(gameMode: MainGameModeName, metric: LeaderboardMetric) {
        setSelectedGameMode(gameMode);
        setSelectedMetric(metric);
        setExpandedGameMode(gameMode);
        setSelectedRow(null);
        resetTableOptions();
    }

    function selectDaily() {
        setSelectedGameMode('daily');
        setSelectedMetric('highScore');
        setSelectedRow(null);
        resetTableOptions();
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

                <div className="mb-3 flex min-h-7 items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                        {visibleRows.length} {visibleRows.length === 1 ? 'player' : 'players'}
                        {isFiltered && ` of ${rows.length}`}
                    </p>
                    {isCustomized && (
                        <button
                            type="button"
                            onClick={resetTableOptions}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                        >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            Reset
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-500">
                                <th className="w-14 px-3 py-2.5 sm:w-20 sm:px-4">Rank</th>
                                <th className="px-3 py-1.5 sm:px-4">
                                    <ColumnMenu
                                        label="Username"
                                        active={isFiltered}
                                        indicator={isFiltered && <Search className="h-3 w-3" aria-hidden="true" />}
                                    >
                                        <MenuSectionLabel>Find player</MenuSectionLabel>
                                        <div className="relative px-1 pb-1">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                            <input
                                                type="search"
                                                value={usernameQuery}
                                                onChange={(event) => setUsernameQuery(event.target.value)}
                                                placeholder="Username"
                                                aria-label="Filter by username"
                                                autoFocus
                                                className="w-full rounded-md border border-gray-300 py-1.5 pl-7 pr-2 text-xs text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                            />
                                        </div>
                                    </ColumnMenu>
                                </th>
                                <th className="px-3 py-2.5 sm:px-4">{scoreLabel}</th>
                                {showTimeColumn && (
                                    <th className="hidden px-4 py-1.5 sm:table-cell">
                                        <ColumnMenu
                                            label="Date"
                                            active={isDateSort}
                                            indicator={isDateSort && (
                                                sort === 'oldest'
                                                    ? <ArrowUp className="h-3 w-3" aria-hidden="true" />
                                                    : <ArrowDown className="h-3 w-3" aria-hidden="true" />
                                            )}
                                        >
                                            <MenuSectionLabel>Sort by date</MenuSectionLabel>
                                            <MenuCheckbox checked={sort === 'newest'} onChange={() => toggleSort('newest')} icon={ArrowDown}>
                                                Newest first
                                            </MenuCheckbox>
                                            <MenuCheckbox checked={sort === 'oldest'} onChange={() => toggleSort('oldest')} icon={ArrowUp}>
                                                Oldest first
                                            </MenuCheckbox>
                                        </ColumnMenu>
                                    </th>
                                )}
                                {showDetailsColumn && (
                                    <th className="w-10 px-2 py-2.5 sm:w-12 sm:px-4" aria-label="View problems"></th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleRows.map(({row, rank}) => {
                                const isSelected = row.testId != null && selectedRow?.testId === row.testId;
                                const isClickable = showDetailsColumn && row.testId != null;
                                const runDate = row.time ? new Date(row.time) : null;
                                return (
                                    <tr
                                        key={`${row.username}-${row.time}-${rank}`}
                                        onClick={isClickable ? () => toggleProblemSidebar(row) : undefined}
                                        className={`text-gray-700 transition ${isClickable ? 'cursor-pointer' : ''} ${
                                            isSelected ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className={`border-l-2 px-3 py-2.5 font-semibold tabular-nums text-gray-500 sm:px-4 ${
                                            isSelected ? 'border-gray-800' : 'border-transparent'
                                        }`}>
                                            {rank === 1 ? (
                                                <Trophy className="h-5 w-5 text-yellow-500" aria-label="First place" />
                                            ) : (
                                                rank
                                            )}
                                        </td>
                                        <td className="break-words px-3 py-2.5 font-medium text-gray-800 sm:px-4">{row.username}</td>
                                        <td className="px-3 py-2.5 sm:px-4">
                                            <span className="font-semibold tabular-nums text-gray-900">{row.score}</span>
                                            {selectedMetric === 'highScore' && (
                                                <>{' '}<span className="text-xs text-gray-400">pts</span></>
                                            )}
                                        </td>
                                        {showTimeColumn && (
                                            <td className="hidden px-4 py-2.5 tabular-nums sm:table-cell">
                                                {runDate ? (
                                                    <>
                                                        <span className="text-gray-700">{runDate.toLocaleDateString()}</span>{' '}
                                                        <span className="ml-1.5 text-xs text-gray-400">
                                                            {runDate.toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'})}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        )}
                                        {showDetailsColumn && (
                                            <td className="px-2 py-2.5 text-gray-500 sm:px-4">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleProblemSidebar(row);
                                                    }}
                                                    className="mx-auto flex rounded-full p-1 transition hover:bg-gray-200"
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
                            {visibleRows.length === 0 && (
                                <tr>
                                    <td colSpan={columnCount} className="px-4 py-8 text-center text-sm text-gray-500">
                                        {rows.length === 0 ? 'No leaderboard entries yet.' : 'No players match this search.'}
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
