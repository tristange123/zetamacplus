import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { buildProfileStats, type TestStat } from "@/lib/profile/buildProfileStats";


// call using curl -X POST http://localhost:3000/api/profile/rebuild -H "Authorization: Bearer PROFILE_REBUILD_SECRET"

const adapter = new PrismaPg({ connectionString: process.env.PROD_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const UPDATE_BATCH_SIZE = 50;

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
