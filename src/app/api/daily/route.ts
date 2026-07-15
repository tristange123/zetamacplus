import prisma from "@/lib/db/prisma"
import { NextResponse } from "next/server";
import { type Problem } from "@/types/frontendTypes"
import {generateDailyGame} from "@/lib/game/generateDailyGame"


function getUtcDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function getUtcDayStart(date = new Date()) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function replaceDailyGame(date: Date): Promise<Problem[]> {
    const problems = generateDailyGame();

    await prisma.$transaction([
        prisma.daily.deleteMany(),
        prisma.dailyDate.deleteMany(),
        prisma.dailyDate.create({
            data: {date}
        }),
        prisma.daily.createMany({
            data: problems
        })
    ]);

    return problems;
}

async function untoggleDailyCompleted(){
    await prisma.profile.updateMany({
        data: {
            dailyCompleted: false,
            dailyScore: null
        }
    });
}

export async function GET(){
    try {
        const currDate = getUtcDayStart();
        const [dbDate, existingProblems] = await Promise.all([
            prisma.dailyDate.findFirst({
                orderBy: {
                    date: "desc"
                }
            }),
            prisma.daily.findMany({
                orderBy: {
                    orderNumber:"asc"
                }
            })
        ]);

        if (!dbDate || existingProblems.length === 0 || getUtcDateKey(dbDate.date) !== getUtcDateKey(currDate)){
            const problems = await replaceDailyGame(currDate);
            await untoggleDailyCompleted();
            return NextResponse.json(problems);
        }

        return NextResponse.json(existingProblems);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load daily game";
        return NextResponse.json({error: message}, {status: 500});
    }
}
