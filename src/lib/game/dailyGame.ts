import prisma from "@/lib/db/prisma"
import { type Problem } from "@/types/frontendTypes"
import { generateDailyGame } from "./generateDailyGame"

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
            dailyScore: null,
            dailyTest: null
        }
    });
}

export async function getDailyProblems(): Promise<Problem[]> {
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
        return problems;
    }

    return existingProblems;
}

// Same rotation as getDailyProblems, but without loading the problems themselves
export async function refreshDailyGame(): Promise<void> {
    const currDate = getUtcDayStart();
    const [dbDate, problemCount] = await Promise.all([
        prisma.dailyDate.findFirst({
            orderBy: {
                date: "desc"
            }
        }),
        prisma.daily.count()
    ]);

    if (dbDate && problemCount > 0 && getUtcDateKey(dbDate.date) === getUtcDateKey(currDate)){
        return;
    }

    await replaceDailyGame(currDate);
    await untoggleDailyCompleted();
}
