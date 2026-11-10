import prisma from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import {MAIN_GAME_MODES} from '@/lib/game/gameModeGlobals'
import {type MainGameModeName} from '@/types/frontendTypes'
import ClientSide, {
    type Leaderboard as LeaderboardBoard,
    type LeaderboardData,
    type LeaderboardGameModeName,
    type LeaderboardRow,
    type ProblemsSolvedLeaderboardData,
} from './clientSide'
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Zetamac+ | Leaderboard",
  description: "Top Mental Matheletes for each game mode"
};

export const dynamic = 'force-dynamic';

const LEADERBOARD_SIZE = 100;

// userId stays on the server; it's only used to find the viewer's own placement.
type UserRow = LeaderboardRow & { userId: string };

function sortLeaderboardRows(rows: UserRow[]) {
    return rows.sort((a, b) => {
        if (b.score !== a.score){
            return b.score - a.score;
        }
        return new Date(a.time ?? 0).getTime() - new Date(b.time ?? 0).getTime();
    });
}

function sortProblemsSolvedRows(rows: UserRow[]) {
    return rows.sort((a, b) =>
        b.score - a.score
        || a.username.localeCompare(b.username)
    );
}

function toRow({testId, username, score, time}: UserRow): LeaderboardRow {
    return {testId, username, score, time};
}

/** Top rows plus the total player count, and the viewer's row when they placed outside the top. */
function buildLeaderboard(sortedRows: UserRow[], viewerId: string | null): LeaderboardBoard {
    const viewerIndex = viewerId ? sortedRows.findIndex((row) => row.userId === viewerId) : -1;
    return {
        rows: sortedRows.slice(0, LEADERBOARD_SIZE).map(toRow),
        total: sortedRows.length,
        viewer: viewerIndex >= LEADERBOARD_SIZE
            ? {row: toRow(sortedRows[viewerIndex]), rank: viewerIndex + 1}
            : null,
    };
}

const EMPTY_BOARD: LeaderboardBoard = {rows: [], total: 0, viewer: null};

async function getLeaderboardData() {
    const mainGameModes = Object.keys(MAIN_GAME_MODES) as MainGameModeName[];
    const gameModes: LeaderboardGameModeName[] = [...mainGameModes, 'daily'];
    try{
        const session = await auth.api.getSession({ headers: await headers() });
        const viewerId = session?.user.id ?? null;

        const profiles = await prisma.profile.findMany({
            select: {
                userId: true,
                username: true,
                standard_1: true,
                rapid_1: true,
                hard_1: true,
                sprint_1: true,
                standardProblemsSolved: true,
                rapidProblemsSolved: true,
                hardProblemsSolved: true,
                sprintProblemsSolved: true,
                dailyTest: true,
                dailyScore: true,
            }
        });
        const testIds = profiles.flatMap((profile) => {
            return mainGameModes.flatMap((gameMode) => profile[`${gameMode}_1`] ?? []);
        });
        const tests = await prisma.test.findMany({
            where: {
                id: {
                    in: testIds
                }
            },
            select: {
                id: true,
                score: true,
                time: true,
                gameMode: true
            }
        });

        const dailyLeaderboard = buildLeaderboard(sortLeaderboardRows(profiles.flatMap((profile) => {
            if (!profile.dailyTest || typeof profile.dailyScore !== 'number'){
                return [];
            }
            return [{
                userId: profile.userId,
                testId: profile.dailyTest,
                username: profile.username,
                score: profile.dailyScore,
                time: new Date().toISOString(),
            }];
        })), viewerId);

        const testById = new Map(tests.map((test) => [test.id, test]));
        const leaderboards = mainGameModes.reduce<LeaderboardData>((acc, gameMode) => {
            acc[gameMode] = buildLeaderboard(sortLeaderboardRows(profiles
                .flatMap((profile) => {
                    const testId = profile[`${gameMode}_1`];
                    const test = testId ? testById.get(testId) : undefined;
                    if (!test || test.gameMode !== gameMode){
                        return [];
                    }
                    return [{
                        userId: profile.userId,
                        testId: test.id,
                        username: profile.username,
                        score: test.score,
                        time: test.time.toISOString()
                    }];
                })), viewerId);
            return acc;
        }, {
            standard: EMPTY_BOARD,
            rapid: EMPTY_BOARD,
            sprint: EMPTY_BOARD,
            hard: EMPTY_BOARD,
            daily: dailyLeaderboard,
        });

        const problemsSolvedLeaderboards = mainGameModes.reduce<ProblemsSolvedLeaderboardData>(
            (acc, gameMode) => {
                acc[gameMode] = buildLeaderboard(sortProblemsSolvedRows(
                    profiles.flatMap((profile) => {
                        const problemsSolved = profile[`${gameMode}ProblemsSolved`];
                        if (problemsSolved === 0){
                            return [];
                        }

                        return [{
                            userId: profile.userId,
                            testId: null,
                            username: profile.username,
                            score: problemsSolved,
                            time: null,
                        }];
                    })
                ), viewerId);
                return acc;
            },
            {
                standard: EMPTY_BOARD,
                rapid: EMPTY_BOARD,
                sprint: EMPTY_BOARD,
                hard: EMPTY_BOARD,
            }
        );

        return {gameModes, leaderboards, problemsSolvedLeaderboards};
    }
    catch{
        return null;
    }
}

export default async function Leaderboard (){
    const data = await getLeaderboardData();
    if (!data){
        return <div>Error Loading Leaderboards</div>
    }

    return (
        <ClientSide
            gameModes={data.gameModes}
            leaderboards={data.leaderboards}
            problemsSolvedLeaderboards={data.problemsSolvedLeaderboards}
        />
    )
}