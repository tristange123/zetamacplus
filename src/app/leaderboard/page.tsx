import prisma from '@/lib/db/prisma'
import {MAIN_GAME_MODES} from '@/lib/game/gameModeGlobals'


export default function Leaderboard (){
    try{
        for (const gameMode in MAIN_GAME_MODES){
            const leaderboard = prisma.profile.findMany({
                distinct: ['userId'],
                select: {
                    userId: true,
                    standard_1: true,
                    rapid_1: true,
                    sprint_1: true,
                    hard_1: true,
                },
                orderBy:{
                    score: "desc"
                },
                take: 100
            })
        }
    }
    catch{
        return <div>Error Loading Leaderboards</div>
    }
}