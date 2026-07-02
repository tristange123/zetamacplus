'use client'

import {type ProfileDb, type TestDb} from '@/types/dbTypes.js'
import {type MainGameModeName} from '@/types/frontendTypes'


type PastRunsProps = {
    tests: TestDb[]
}
function PastRuns({tests}: PastRunsProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Past Runs</h3>
            <ul className="max-h-32 space-y-2 overflow-y-auto pr-1 text-xs text-gray-600 md:text-sm">
                {tests.map((test) => (
                    <li key={test.id} className="rounded-md bg-gray-100 px-3 py-2">
                        {test.score} pts - {test.gameMode} - {new Date(test.time).toLocaleString()}
                    </li>
                ))}
                {tests.length === 0 && <li className="text-gray-500">No runs yet.</li>}
            </ul>
        </div>
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
    profile: ProfileDb
}
function FormatStats({ title, profile }: FormatStatsProps) {
    const pastTenTests = profile?.[`${title}PastTenTests`];

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
                <div>Highest: {profile?.[`${title}_1`]}</div>
                <div>Second Best: {profile?.[`${title}_2`]}</div>
                <div>Third Best: {profile?.[`${title}_3`]}</div>
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
    
    
    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-5">
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
                    <FormatStats title="standard"  profile = {profile} />
                    <FormatStats title="sprint"  profile = {profile} />
                    <FormatStats title="rapid" profile = {profile} />
                    <FormatStats title="hard" profile = {profile} />
                </div>
            </div>

            <PastRuns tests = {tests}/>
        </section>
    );
    
}

