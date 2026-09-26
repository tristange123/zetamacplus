'use client'

import {Calculator, ChevronRight, Clock, Rabbit, Skull, SportShoe, X, type LucideIcon} from 'lucide-react';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useState, type FormEvent} from 'react';
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
        barClassName: 'border-gray-300 bg-gray-100',
        textClassName: 'text-gray-900',
    },
    {
        key: 'second' as const,
        label: '2.',
        barClassName: 'border-gray-200 bg-gray-50',
        textClassName: 'text-gray-700',
    },
    {
        key: 'third' as const,
        label: '3.',
        barClassName: 'border-gray-200 bg-gray-50',
        textClassName: 'text-gray-600',
    },
];

type PastRunsProps = {
    tests: TestDb[],
    selectedTestId: string | null,
    onSelectTest: (test: TestDb) => void
}
function PastRuns({tests, selectedTestId, onSelectTest}: PastRunsProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 md:p-5">
            <div className="mb-4 border-b border-gray-200 pb-3">
                <h2 className="text-lg font-semibold tracking-tight text-gray-900">Past Runs</h2>
            </div>
            <div className="max-h-100 overflow-auto rounded-md border border-gray-200">
                <table className="min-w-[28rem] w-full text-xs md:min-w-0 md:text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-gray-200 bg-gray-100 text-center text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-500">
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
                                        isSelected ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
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
        <aside className="min-w-0 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50/95 p-3 shadow-xl md:sticky md:top-5 md:max-h-[calc(100vh-8rem)]">
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-gray-200 pb-3">
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
    const [username, setUsername] = useState(profile.username);
    const [newUsername, setNewUsername] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    async function updateUsername(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const response = await fetch('/api/profile/username', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username: newUsername}),
            });
            const body = await response.json() as {username?: string, error?: string};

            if (!response.ok || !body.username) {
                setSubmitMessage(body.error ?? 'Could not change username.');
                return;
            }

            setUsername(body.username);
            setNewUsername('');
            setSubmitMessage('Username changed.');
            window.dispatchEvent(new Event('profile-username-changed'));
        }
        catch {
            setSubmitMessage('Could not change username.');
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="h-full rounded-lg border border-gray-200 bg-white p-4 md:p-5">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">Profile</h3>
            <dl className="space-y-2 text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <dt className="text-xs font-medium text-gray-400">Email</dt>
                    <dd className="break-all text-gray-700">{profile.email}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <dt className="text-xs font-medium text-gray-400">Joined</dt>
                    <dd className="text-gray-600">{new Date(profile.timeJoined).toLocaleDateString()}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <dt className="text-xs font-medium text-gray-400">Username</dt>
                    <dd className="break-all font-medium text-gray-800">{username}</dd>
                </div>
            </dl>
            <form className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4" onSubmit={updateUsername}>
                <label htmlFor="new-username" className="sr-only">New username</label>
                <input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(event) => setNewUsername(event.target.value)}
                    placeholder="New username"
                    maxLength={50}
                    required
                    className="min-w-0 max-w-56 flex-1 rounded-md border border-gray-300 px-2.5 py-2 text-xs text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shrink-0 rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
            {submitMessage && (
                <p className="mt-2 text-xs text-gray-600" role="status">{submitMessage}</p>
            )}
        </div>
    );
}
type UserStatsProps = {
    testsAttempted: number,
    testsCompleted: number
}
function UserStats({ testsAttempted, testsCompleted }: UserStatsProps) {
    return (
        <div className="h-full rounded-lg border border-gray-200 bg-white p-4 md:p-5">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">Activity</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-gray-100 px-4 py-5">
                    <p className="text-2xl font-semibold tracking-tight text-gray-900">{testsAttempted ?? 0}</p>
                    <p className="mt-1 text-xs text-gray-500">Tests attempted</p>
                </div>
                <div className="rounded-md bg-gray-100 px-4 py-5">
                    <p className="text-2xl font-semibold tracking-tight text-gray-900">{testsCompleted ?? 0}</p>
                    <p className="mt-1 text-xs text-gray-500">Tests completed</p>
                </div>
            </div>
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
            className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 transition ${
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
        <div className="h-full rounded-lg border border-gray-200 bg-white p-4 md:p-5">
            <h3 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 text-lg font-semibold capitalize text-gray-800">
                <ModeIcon size={20} className="text-gray-500" aria-hidden="true" />
                {title}
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
                <div>
                    <span className="font-semibold">Average Score:</span> {profile?.[`${title}Average`].toFixed(1)}
                </div>
                <div>
                    <span className="font-semibold">Past 10 Average:</span> {lastTenAverage.toFixed(1)}
                </div>
                <div>
                    <span className="font-semibold">Tests Completed:</span> {profile?.[`${title}TotalTests`]}
                </div>
                {title !== 'daily' && (
                    <div>
                        <span className="font-semibold">Problems Solved:</span> {profile[`${title}ProblemsSolved`]}
                    </div>
                )}
            </div>
        </div>
    );
}

type DailyScoreChartProps = {
    tests: TestDb[]
}

function DailyScoreChart({tests}: DailyScoreChartProps) {
    const chartData = [...tests]
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        .map((test) => ({
            id: test.id,
            timestamp: new Date(test.time).getTime(),
            score: test.score,
        }));
    const firstTimestamp = chartData[0]?.timestamp;
    const lastTimestamp = chartData.at(-1)?.timestamp;
    const oneDay = 24 * 60 * 60 * 1000;
    const timeDomain = firstTimestamp === lastTimestamp && firstTimestamp != null
        ? [firstTimestamp - oneDay / 2, firstTimestamp + oneDay / 2]
        : ['dataMin', 'dataMax'];

    return (
        <div className="h-full rounded-lg border border-gray-200 bg-white p-4 md:p-5">
            <div className="mb-4 border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-800">Daily Results</h3>
            </div>

            {chartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
                    No daily runs yet.
                </div>
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{top: 8, right: 12, left: -20, bottom: 8}}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="timestamp"
                                type="number"
                                scale="time"
                                domain={timeDomain}
                                tick={{fill: '#4b5563', fontSize: 12}}
                                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                                minTickGap={28}
                            />
                            <YAxis tick={{fill: '#4b5563', fontSize: 12}} allowDecimals={false} />
                            <Tooltip
                                labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleString()}
                                formatter={(value) => [value, 'Score']}
                                contentStyle={{
                                    borderRadius: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    color: '#1f2937',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#4b5563"
                                strokeWidth={2.5}
                                dot={{fill: '#4b5563', r: 3}}
                                activeDot={{r: 5}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
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
        <section className={`mx-auto min-h-[calc(100vh-9rem)] max-w-6xl gap-6 pb-12 ${
            selectedTest
                ? 'flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)]'
                : 'flex flex-col'
        }`}>
            <div className="flex min-w-0 flex-col gap-6">
                <header className="border-b border-gray-200 pb-5 pt-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Stats</h1>
                </header>

                <div className="rounded-lg bg-gray-200 p-4 md:p-5">
                    <h2 className="mb-4 text-sm font-semibold text-gray-700">Overview</h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Profile profile={profile}/>
                        <UserStats testsAttempted={profile.testsAttempted} testsCompleted={profile.testsCompleted} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-lg bg-gray-200 p-4 md:p-5">
                    <h2 className="mb-4 text-sm font-semibold text-gray-700">Game modes</h2>
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

                <div className="rounded-lg bg-gray-200 p-4 md:p-5">
                    <h2 className="mb-4 text-sm font-semibold text-gray-700">Daily challenge</h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <FormatStats
                            title="daily"
                            profile={profile}
                            topTests={topTestsByMode.daily}
                            selectedTestId={selectedTest?.id ?? null}
                            onSelectTest={toggleProblemPanel}
                        />
                        <DailyScoreChart tests={dailyTests} />
                    </div>
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
