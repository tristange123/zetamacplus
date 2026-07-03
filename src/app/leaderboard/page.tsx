import prisma from '@/lib/db/prisma'
import {MAIN_GAME_MODES} from '@/lib/game/gameModeGlobals'
import {type MainGameModeName} from '@/types/frontendTypes'
import ClientSide, {type LeaderboardData} from './clientSide'

export const dynamic = 'force-dynamic';

async function getLeaderboardData() {
    const gameModes = Object.keys(MAIN_GAME_MODES) as MainGameModeName[];
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
        console.log(profiles);
        const testIds = profiles.flatMap((profile) => {
            return gameModes.flatMap((gameMode) => profile[`${gameMode}_1`] ?? []);
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
        const testById = new Map(tests.map((test) => [test.id, test]));
        const leaderboards = gameModes.reduce<LeaderboardData>((acc, gameMode) => {
            acc[gameMode] = profiles
                .flatMap((profile) => {
                    const testId = profile[`${gameMode}_1`];
                    const test = testId ? testById.get(testId) : undefined;
                    if (!test || test.gameMode !== gameMode){
                        return [];
                    }
                    return [{
                        username: profile.username,
                        score: test.score,
                        time: test.time.toISOString()
                    }];
                })
                .sort((a, b) => {
                    if (b.score !== a.score){
                        return b.score - a.score;
                    }
                    return new Date(a.time).getTime() - new Date(b.time).getTime();
                })
                .slice(0, 100);
            return acc;
        }, {
            standard: [],
            rapid: [],
            sprint: [],
            hard: []
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