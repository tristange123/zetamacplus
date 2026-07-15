'use client'

import {Calculator, ChevronRight, Clock, Rabbit, Skull, SportShoe, X, type LucideIcon} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useEffect, useRef, useState} from 'react';
import {type GameModeTopTests, type ProblemDb, type ProfileDb, type TestDb} from '@/types/dbTypes.js'
import {type MainGameModeName} from '@/types/frontendTypes'

type StatsGameModeName = MainGameModeName | 'daily';

const GAME_MODE_ICONS: Record<StatsGameModeName, LucideIcon> = {
    standard: Calculator,
    rapid: Rabbit,
    sprint: SportShoe,
    hard: Skull,
    daily: Clock,
};

const RANK_CONFIG = [
    {
        key: 'first' as const,
        label: '1.',
        barClassName: 'border-amber-200 bg-gradient-to-r from-amber-200/65 to-stone-100/75',
        textClassName: 'text-stone-800',
    },
    {
        key: 'second' as const,
        label: '2.',
        barClassName: 'border-gray-200 bg-gradient-to-r from-gray-200/70 to-gray-100/75',
        textClassName: 'text-gray-700',
    },
    {
        key: 'third' as const,
        label: '3.',
        barClassName: 'border-orange-200 bg-gradient-to-r from-orange-200/60 to-stone-200/65',
        textClassName: 'text-stone-800',
    },
];

type PastRunsProps = {
    tests: TestDb[],
    selectedTestId: string | null,
    onSelectTest: (test: TestDb) => void
}
function PastRuns({tests, selectedTestId, onSelectTest}: PastRunsProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-2xl font-semibold text-gray-700">Past Runs</h3>
            <div className="max-h-100 overflow-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs md:text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-gray-200 bg-gray-100 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <th className="px-3 py-2">Score</th>
                            <th className="px-3 py-2">Mode</th>
                            <th className="px-3 py-2">Time</th>
                            <th className="w-10 px-3 py-2" aria-label="View problems"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tests.map((test) => {
                            const isSelected = test.id === selectedTestId;
                            return (
                                <tr
                                    key={test.id}
                                    className={`text-center text-gray-700 transition ${
                                        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="px-3 py-2 font-medium text-gray-800">{test.score} pts</td>
                                    <td className="px-3 py-2">{test.gameMode}</td>
                                    <td className="px-3 py-2 text-gray-600">{new Date(test.time).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-gray-500">
                                        <button
                                            type="button"
                                            onClick={() => onSelectTest(test)}
                                            className="mx-auto flex rounded-full p-1 transition hover:bg-gray-200"
                                            aria-label={`${isSelected ? 'Hide' : 'View'} problems for this run`}
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
                        {tests.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-500">
                                    No runs yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatSolveTime(seconds: number | null): string {
    if (seconds == null) return '—';
    return `${seconds.toFixed(1)}s`;
}

type ProblemsPanelProps = {
    selectedTest: TestDb,
    problems: ProblemDb[],
    loadingProblems: boolean,
    problemError: string,
    onClose: () => void
}

function ProblemsPanel({selectedTest, problems, loadingProblems, problemError, onClose}: ProblemsPanelProps) {
    return (
        <aside className="sticky top-5 max-h-[calc(100vh-8rem)] min-w-0 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50/95 p-3 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight text-gray-800">
                        Past Run Problems
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                        {selectedTest.score} pts - {selectedTest.gameMode} - {new Date(selectedTest.time).toLocaleString()}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                    aria-label="Close problems"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="max-h-[calc(100vh-14rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white">
                {loadingProblems ? (
                    <p className="px-3 py-4 text-center text-xs text-gray-500">Loading problems...</p>
                ) : problemError ? (
                    <p className="px-3 py-4 text-center text-xs text-gray-500">{problemError}</p>
                ) : problems.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-gray-500">No problems found.</p>
                ) : (
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/80">
                                <th className="px-3 py-2 text-center font-semibold text-gray-700">Problem</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-700">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((problem) => (
                                <tr
                                    key={problem.id}
                                    className="border-b border-gray-200 last:border-b-0"
                                >
                                    <td className="px-3 py-2 text-center text-gray-800">
                                        {problem.statement}{problem.answer}
                                    </td>
                                    <td className="px-3 py-2 text-center tabular-nums text-gray-600">
                                        {formatSolveTime(problem.solveTime)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </aside>
    );
}

type ProfileProps = {
    profile: ProfileDb
}

function Profile({profile}: ProfileProps) {

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xl font-semibold text-gray-700">Profile</h3>
            <div className="text-sm text-gray-700">{profile.email}</div>
            <div className="mt-1 text-xs text-gray-500 md:text-sm">Date Joined: {new Date(profile.timeJoined).toLocaleString()}</div>
        </div>
    );
}
type UserStatsProps = {
    testsAttempted: number,
    testsCompleted: number
}
function UserStats({ testsAttempted, testsCompleted }: UserStatsProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xl font-semibold text-gray-700">User Stats</h3>
            <div className="text-sm text-gray-700">Tests Attempted: {testsAttempted ?? 0}</div>
            <div className="mt-1 text-sm text-gray-700">Tests Completed: {testsCompleted ?? 0}</div>
        </div>
    );
}

type TopRunBarProps = {
    rankLabel: string,
    barClassName: string,
    textClassName: string,
    test: TestDb | null,
    selectedTestId: string | null,
    onSelectTest: (test: TestDb) => void,
}

function TopRunBar({
    rankLabel,
    barClassName,
    textClassName,
    test,
    selectedTestId,
    onSelectTest,
}: TopRunBarProps) {
    const isSelected = test?.id === selectedTestId;

    return (
        <div
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 shadow-sm ${
                test ? barClassName : 'border-gray-200 bg-gray-100/80'
            }`}
        >
            <div className={`flex min-w-0 flex-1 items-center gap-3 text-sm ${test ? textClassName : 'text-gray-400'}`}>
                <span className="w-5 shrink-0 font-semibold">{rankLabel}</span>
                {test ? (
                    <>
                        <span className="shrink-0 font-semibold">{test.score} pts</span>
                        <span className="min-w-0 truncate text-xs opacity-90 md:text-sm">
                            {new Date(test.time).toLocaleString()}
                        </span>
                    </>
                ) : (
                    <span className="text-xs md:text-sm">No run yet</span>
                )}
            </div>
            {test && (
                <button
                    type="button"
                    onClick={() => onSelectTest(test)}
                    className={`shrink-0 rounded-full p-1 transition ${
                        isSelected ? 'bg-black/10' : 'hover:bg-black/10'
                    }`}
                    aria-label={`${isSelected ? 'Hide' : 'View'} problems for this run`}
                >
                    <ChevronRight
                        className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </button>
            )}
        </div>
    );
}

type FormatStatsProps = {
    title: StatsGameModeName,
    profile: ProfileDb,
    topTests: GameModeTopTests,
    selectedTestId: string | null,
    onSelectTest: (test: TestDb) => void,
}

function FormatStats({ title, profile, topTests, selectedTestId, onSelectTest }: FormatStatsProps) {
    const ModeIcon = GAME_MODE_ICONS[title];
    const pastTenTests = profile?.[`${title}PastTenTests`];

    const lastTenAverage = pastTenTests?.length
        ? Math.round(
            pastTenTests.reduce((sum: number, score: number) => sum + score, 0) /
            pastTenTests.length
        )
        : 0;

    return (
        <div className="h-full rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold capitalize text-gray-800">
                {title}
                <ModeIcon size={20} className="text-gray-500" aria-hidden="true" />
            </h3>

            <div className="space-y-2">
                {RANK_CONFIG.map(({ key, label, barClassName, textClassName }) => (
                    <TopRunBar
                        key={key}
                        rankLabel={label}
                        barClassName={barClassName}
                        textClassName={textClassName}
                        test={topTests[key]}
                        selectedTestId={selectedTestId}
                        onSelectTest={onSelectTest}
                    />
                ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-700">
                <div>Average Score: {profile?.[`${title}Average`].toFixed(1)}</div>
                <div>Past 10 Average: {lastTenAverage.toFixed(1)}</div>
                <div>Tests Completed: {profile?.[`${title}TotalTests`]}</div>
            </div>
        </div>
    );
}

type DailyScoreChartProps = {
    tests: TestDb[]
}

function DailyScoreChart({tests}: DailyScoreChartProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const visibleBars = 20;
    const dailyScoreByDate = [...tests]
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        .reduce<Map<string, {id: string, dateLabel: string, score: number | null}>>((acc, test) => {
            const date = new Date(test.time);
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const existing = acc.get(dateKey);
            if (existing && existing.score != null && existing.score >= test.score) {
                return acc;
            }

            acc.set(dateKey, {
                id: test.id,
                dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
                score: test.score,
            });
            return acc;
        }, new Map());
    const chartData = Array.from(dailyScoreByDate.values());
    const displayData = chartData.length >= visibleBars
        ? chartData
        : [
            ...chartData,
            ...Array.from({length: visibleBars - chartData.length}, (_, index) => ({
                id: `empty-${index}`,
                dateLabel: '',
                score: null,
            })),
        ];
    const chartWidth = `${Math.max(100, (displayData.length / visibleBars) * 100)}%`;

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }, [displayData.length]);

    return (
        <div className="h-full rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Daily Results</h3>
            </div>

            {chartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
                    No daily runs yet.
                </div>
            ) : (
                <div ref={scrollRef} className="overflow-x-auto">
                    <div style={{width: chartWidth}} className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayData} margin={{top: 8, right: 12, left: -20, bottom: 8}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="dateLabel" tick={{fill: '#4b5563', fontSize: 12}} interval={0} />
                                <YAxis tick={{fill: '#4b5563', fontSize: 12}} allowDecimals={false} />
                                <Tooltip
                                    labelFormatter={(_, payload) => {
                                        const data = payload?.[0]?.payload as {dateLabel?: string, id?: string} | undefined;
                                        return data ? `${data.dateLabel}` : 'Daily run';
                                    }}
                                    formatter={(value) => [value, 'Score']}
                                    contentStyle={{
                                        borderRadius: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        color: '#1f2937',
                                    }}
                                />
                                <Bar dataKey="score" fill="#73757ad6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

type ClientSideProps = {
    profile: ProfileDb,
    tests: TestDb[],
    topTestsByMode: Record<StatsGameModeName, GameModeTopTests>,
    dailyTests: TestDb[],
}

export default function ClientSide({profile, tests, topTestsByMode, dailyTests}: ClientSideProps) {
    const [selectedTest, setSelectedTest] = useState<TestDb | null>(null);
    const [problems, setProblems] = useState<ProblemDb[]>([]);
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [problemError, setProblemError] = useState('');

    async function toggleProblemPanel(test: TestDb) {
        if (selectedTest?.id === test.id){
            setSelectedTest(null);
            return;
        }

        setSelectedTest(test);
        setProblems([]);
        setProblemError('');
        setLoadingProblems(true);

        try{
            const response = await fetch(`/api/problem?testId=${encodeURIComponent(test.id)}`);
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
        <section className={`min-h-[calc(100vh-9rem)] gap-5 ${
            selectedTest
                ? 'grid grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)]'
                : 'flex flex-col'
        }`}>
            <div className="flex min-w-0 flex-col gap-5">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold tracking-tight text-gray-800 md:text-2xl">
                        User Stats
                    </h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Profile profile={profile}/>
                        <UserStats testsAttempted={profile.testsAttempted} testsCompleted={profile.testsCompleted} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-100 p-4 md:p-5">
                    <div className="grid min-h-full grid-cols-1 gap-4 md:grid-cols-2">
                        <FormatStats
                            title="standard"
                            profile={profile}
                            topTests={topTestsByMode.standard}
                            selectedTestId={selectedTest?.id ?? null}
                            onSelectTest={toggleProblemPanel}
                        />
                        <FormatStats
                            title="sprint"
                            profile={profile}
                            topTests={topTestsByMode.sprint}
                            selectedTestId={selectedTest?.id ?? null}
                            onSelectTest={toggleProblemPanel}
                        />
                        <FormatStats
                            title="rapid"
                            profile={profile}
                            topTests={topTestsByMode.rapid}
                            selectedTestId={selectedTest?.id ?? null}
                            onSelectTest={toggleProblemPanel}
                        />
                        <FormatStats
                            title="hard"
                            profile={profile}
                            topTests={topTestsByMode.hard}
                            selectedTestId={selectedTest?.id ?? null}
                            onSelectTest={toggleProblemPanel}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-gray-100 p-4 lg:grid-cols-2 md:p-5">
                    <FormatStats
                        title="daily"
                        profile={profile}
                        topTests={topTestsByMode.daily}
                        selectedTestId={selectedTest?.id ?? null}
                        onSelectTest={toggleProblemPanel}
                    />
                    <DailyScoreChart tests={dailyTests} />
                </div>

                <PastRuns
                    tests={tests}
                    selectedTestId={selectedTest?.id ?? null}
                    onSelectTest={toggleProblemPanel}
                />
            </div>

            {selectedTest && (
                <ProblemsPanel
                    selectedTest={selectedTest}
                    problems={problems}
                    loadingProblems={loadingProblems}
                    problemError={problemError}
                    onClose={() => setSelectedTest(null)}
                />
            )}
        </section>
    );
}
