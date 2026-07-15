import prisma from '@/lib/db/prisma'
import {MAIN_GAME_MODES} from '@/lib/game/gameModeGlobals'
import {type MainGameModeName} from '@/types/frontendTypes'
import ClientSide, {type LeaderboardData, type LeaderboardGameModeName, type LeaderboardRow} from './clientSide'

export const dynamic = 'force-dynamic';

function getUtcDayStart(date = new Date()) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function sortLeaderboardRows(rows: LeaderboardRow[]) {
    return rows.sort((a, b) => {
        if (b.score !== a.score){
            return b.score - a.score;
        }
        return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
}

async function getLeaderboardData() {
    const mainGameModes = Object.keys(MAIN_GAME_MODES) as MainGameModeName[];
    const gameModes: LeaderboardGameModeName[] = [...mainGameModes, 'daily'];
    try{
        const profiles = await prisma.profile.findMany({
            select: {
                username: true,
                standard_1: true,
                rapid_1: true,
                hard_1: true,
                sprint_1: true,
            }
        });
        const testIds = profiles.flatMap((profile) => {
            return mainGameModes.flatMap((gameMode) => profile[`${gameMode}_1`] ?? []);
        });
        const todayStart = getUtcDayStart();
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

        const [tests, dailyTests] = await Promise.all([
            prisma.test.findMany({
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
            }),
            prisma.test.findMany({
                where: {
                    gameMode: 'daily',
                    completed: true,
                    time: {
                        gte: todayStart,
                        lt: tomorrowStart,
                    },
                    userId: {
                        not: null,
                    },
                },
                select: {
                    id: true,
                    score: true,
                    time: true,
                    user: {
                        select: {
                            profile: {
                                select: {
                                    username: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        const dailyLeaderboard = sortLeaderboardRows(dailyTests.flatMap((test) => {
            const username = test.user?.profile?.username;
            if (!username){
                return [];
            }
            return [{
                testId: test.id,
                username,
                score: test.score,
                time: test.time.toISOString(),
            }];
        })).slice(0, 100);

        const testById = new Map(tests.map((test) => [test.id, test]));
        const leaderboards = mainGameModes.reduce<LeaderboardData>((acc, gameMode) => {
            acc[gameMode] = sortLeaderboardRows(profiles
                .flatMap((profile) => {
                    const testId = profile[`${gameMode}_1`];
                    const test = testId ? testById.get(testId) : undefined;
                    if (!test || test.gameMode !== gameMode){
                        return [];
                    }
                    return [{
                        testId: test.id,
                        username: profile.username,
                        score: test.score,
                        time: test.time.toISOString()
                    }];
                }))
                .slice(0, 100);
            return acc;
        }, {
            standard: [],
            rapid: [],
            sprint: [],
            hard: [],
            daily: dailyLeaderboard,
        });

        return {gameModes, leaderboards};
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

    return <ClientSide gameModes={data.gameModes} leaderboards={data.leaderboards} />
}