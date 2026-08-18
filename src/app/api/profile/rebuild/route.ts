import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { MAIN_GAME_MODES } from "@/lib/game/gameModeGlobals";
import { type MainGameModeName } from "@/types/frontendTypes";
import { type Prisma } from "@/generated/prisma/client";


// call using curl -X POST http://localhost:3000/api/profile/rebuild -H "Authorization: Bearer PROFILE_REBUILD_SECRET"

type TrackedGameMode = MainGameModeName | "daily";

type TestStat = {
    id: string;
    score: number;
    time: Date;
    gameMode: string;
    userId: string | null;
    completed: boolean;
};

const TRACKED_GAME_MODES: TrackedGameMode[] = [
    ...(Object.keys(MAIN_GAME_MODES) as MainGameModeName[]),
    "daily",
];

const UPDATE_BATCH_SIZE = 50;

function isTrackedGameMode(gameMode: string): gameMode is TrackedGameMode {
    return TRACKED_GAME_MODES.includes(gameMode as TrackedGameMode);
}

function getUtcDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function buildModeStats(tests: TestStat[], gameMode: TrackedGameMode) {
    const modeTests = tests.filter((test) => test.completed && test.gameMode === gameMode);
    const topTests = [...modeTests].sort((a, b) =>
        b.score - a.score
        || a.time.getTime() - b.time.getTime()
        || a.id.localeCompare(b.id)
    );

    return {
        [`${gameMode}PastTenTests`]: modeTests.slice(0, 10).map((test) => test.score),
        [`${gameMode}Average`]: modeTests.length === 0
            ? 0
            : modeTests.reduce((sum, test) => sum + test.score, 0) / modeTests.length,
        [`${gameMode}TotalTests`]: modeTests.length,
        [`${gameMode}_1`]: topTests[0]?.id ?? null,
        [`${gameMode}_2`]: topTests[1]?.id ?? null,
        [`${gameMode}_3`]: topTests[2]?.id ?? null,
    };
}

function buildProfileStats(tests: TestStat[]): Prisma.ProfileUpdateInput {
    const completedTrackedTests = tests.filter(
        (test) => test.completed && isTrackedGameMode(test.gameMode)
    );
    const dailyTests = completedTrackedTests.filter((test) => test.gameMode === "daily");
    const latestDailyTest = dailyTests[0] ?? null;
    const completedDailyToday = latestDailyTest !== null
        && getUtcDateKey(latestDailyTest.time) === getUtcDateKey(new Date());

    const modeStats = TRACKED_GAME_MODES.reduce<Record<string, unknown>>(
        (stats, gameMode) => Object.assign(stats, buildModeStats(tests, gameMode)),
        {}
    );

    return {
        testsCompleted: completedTrackedTests.length,
        ...modeStats,
        dailyCompleted: completedDailyToday,
        pastDailys: [...dailyTests].reverse().map((test) => test.id),
        dailyTest: completedDailyToday ? latestDailyTest.id : null,
        dailyScore: completedDailyToday ? latestDailyTest.score : null,
    } as Prisma.ProfileUpdateInput;
}

function isAuthorized(req: Request) {
    const rebuildSecret = process.env.PROFILE_REBUILD_SECRET;
    if (!rebuildSecret) {
        return null;
    }

    return req.headers.get("authorization") === `Bearer ${rebuildSecret}`;
}

export async function POST(req: Request) {
    const authorized = isAuthorized(req);
    if (authorized === null) {
        return NextResponse.json(
            { error: "PROFILE_REBUILD_SECRET is not configured" },
            { status: 503 }
        );
    }
    if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const profiles = await prisma.profile.findMany({
            select: {
                userId: true,
            },
        });
        const profileUserIds = profiles.map((profile) => profile.userId);

        const tests = profileUserIds.length === 0
            ? []
            : await prisma.test.findMany({
                where: {
                    userId: {
                        in: profileUserIds,
                    },
                },
                select: {
                    id: true,
                    score: true,
                    time: true,
                    gameMode: true,
                    userId: true,
                    completed: true,
                },
                orderBy: [
                    { userId: "asc" },
                    { time: "desc" },
                    { id: "desc" },
                ],
            });

        const testsByUser = new Map<string, TestStat[]>();
        for (const test of tests) {
            if (!test.userId) {
                continue;
            }
            const userTests = testsByUser.get(test.userId) ?? [];
            userTests.push(test);
            testsByUser.set(test.userId, userTests);
        }

        for (let start = 0; start < profiles.length; start += UPDATE_BATCH_SIZE) {
            const batch = profiles.slice(start, start + UPDATE_BATCH_SIZE);
            await prisma.$transaction(
                batch.map((profile) =>
                    prisma.profile.update({
                        where: {
                            userId: profile.userId,
                        },
                        data: buildProfileStats(testsByUser.get(profile.userId) ?? []),
                    })
                )
            );
        }

        revalidatePath("/leaderboard");
        revalidatePath("/stats");

        return NextResponse.json({
            message: "Profile statistics rebuilt",
            profilesUpdated: profiles.length,
            testsProcessed: tests.length,
        });
    }
    catch (error) {
        console.error("Failed to rebuild profile statistics", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
