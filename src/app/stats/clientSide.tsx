'use client'

import {ChevronRight} from 'lucide-react';
import {useState} from 'react';
import {type ProblemDb, type ProfileDb, type TestDb} from '@/types/dbTypes.js'
import {type MainGameModeName} from '@/types/frontendTypes'


type PastRunsProps = {
    tests: TestDb[],
    selectedTestId: string | null,
    onSelectTest: (test: TestDb) => void
}
function PastRuns({tests, selectedTestId, onSelectTest}: PastRunsProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Past Runs</h3>
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
    problemError: string
}

function ProblemsPanel({selectedTest, problems, loadingProblems, problemError}: ProblemsPanelProps) {
    return (
        <aside className="sticky top-5 max-h-[calc(100vh-8rem)] min-w-0 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50/95 p-3 shadow-xl">
            <div className="mb-3">
                <h2 className="text-sm font-semibold tracking-tight text-gray-800">
                    Past Run Problems
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                    {selectedTest.score} pts - {selectedTest.gameMode} - {new Date(selectedTest.time).toLocaleString()}
                </p>
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
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Profile</h3>
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
            <h3 className="mb-3 text-sm font-semibold text-gray-700">User Stats</h3>
            <div className="text-sm text-gray-700">Tests Attempted: {testsAttempted ?? 0}</div>
            <div className="mt-1 text-sm text-gray-700">Tests Completed: {testsCompleted ?? 0}</div>
        </div>
    );
}
type FormatStatsProps = {
    title: MainGameModeName,
    profile: ProfileDb,
    scoreByTestId: Map<string, number>
}
function FormatStats({ title, profile, scoreByTestId }: FormatStatsProps) {
    const pastTenTests = profile?.[`${title}PastTenTests`];
    const highestScore = scoreByTestId.get(profile[`${title}_1`] ?? '') ?? 0;
    const secondBestScore = scoreByTestId.get(profile[`${title}_2`] ?? '') ?? 0;
    const thirdBestScore = scoreByTestId.get(profile[`${title}_3`] ?? '') ?? 0;

    const lastTenAverage = pastTenTests?.length
        ? Math.round(
            pastTenTests.reduce((sum: number, score: number) => sum + score, 0) /
            pastTenTests.length
        )
        : 0;

    return (
        <div className="h-full rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
            <div className="space-y-2 text-sm text-gray-700">
                <div>Highest: {highestScore}</div>
                <div>Second Best: {secondBestScore}</div>
                <div>Third Best: {thirdBestScore}</div>
                <div>Average Score: {profile?.[`${title}Average`].toFixed(1)}</div>
                <div>Past 10 Average: {lastTenAverage.toFixed(1)}</div>
                <div>Tests Completed: {profile?.[`${title}TotalTests`]}</div>
            </div>
        </div>
    );
}
type ClientSideProps = {
    profile: ProfileDb,
    tests: TestDb[]
}

export default function ClientSide({profile, tests}: ClientSideProps) {
    const scoreByTestId = new Map(tests.map((test) => [test.id, test.score]));
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
                        <Profile profile = {profile}/>
                        <UserStats testsAttempted={profile.testsAttempted} testsCompleted={profile.testsCompleted} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-100 p-4 md:p-5">
                    <div className="grid min-h-full grid-cols-1 gap-4 md:grid-cols-2">
                        <FormatStats title="standard" profile={profile} scoreByTestId={scoreByTestId} />
                        <FormatStats title="sprint" profile={profile} scoreByTestId={scoreByTestId} />
                        <FormatStats title="rapid" profile={profile} scoreByTestId={scoreByTestId} />
                        <FormatStats title="hard" profile={profile} scoreByTestId={scoreByTestId} />
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
                />
            )}
        </section>
    );
    
}

