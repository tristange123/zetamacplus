import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import requireSession from "@/lib/auth/requireSession";
import { refreshDailyGame } from "@/lib/game/dailyGame";

export async function GET() {
    try {
        const session = await requireSession();

        // Rotate the daily game before reading the profile so yesterday's
        // completion state cannot be returned for a new day.
        await refreshDailyGame();

        const profile = await prisma.profile.findUnique({
            where: {
                userId: session.user.id,
            },
            select: {
                dailyCompleted: true,
                dailyScore: true,
                showScore: true,
                showTimer: true,
                showKeyboard: true,
                standard_1: true,
                standard_2: true,
                standard_3: true,
                rapid_1: true,
                rapid_2: true,
                rapid_3: true,
                sprint_1: true,
                sprint_2: true,
                sprint_3: true,
                hard_1: true,
                hard_2: true,
                hard_3: true,
                daily_1: true,
                daily_2: true,
                daily_3: true,
            },
        });

        if (!profile) {
            console.log("No Profile Found")
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 },
            );
        }

        const topTestIds = [
            profile.standard_1, profile.standard_2, profile.standard_3,
            profile.rapid_1, profile.rapid_2, profile.rapid_3,
            profile.sprint_1, profile.sprint_2, profile.sprint_3,
            profile.hard_1, profile.hard_2, profile.hard_3,
            profile.daily_1, profile.daily_2, profile.daily_3,
        ].filter((testId): testId is string => testId != null);
        const topTests = topTestIds.length > 0
            ? await prisma.test.findMany({
                where: {
                    id: { in: topTestIds },
                    userId: session.user.id,
                },
                select: {
                    id: true,
                    score: true,
                },
            })
            : [];
        const scoreByTestId = new Map(topTests.map((test) => [test.id, test.score]));
        const scoreFor = (testId: string | null) => (
            testId == null ? null : scoreByTestId.get(testId) ?? null
        );

        return NextResponse.json({
            dailyCompleted: profile.dailyCompleted,
            dailyScore: profile.dailyCompleted ? (profile.dailyScore ?? 0) : null,
            showScore: profile.showScore,
            showTimer: profile.showTimer,
            showKeyboard: profile.showKeyboard,
            bestScores: {
                standard: scoreFor(profile.standard_1),
                rapid: scoreFor(profile.rapid_1),
                sprint: scoreFor(profile.sprint_1),
                hard: scoreFor(profile.hard_1),
                daily: scoreFor(profile.daily_1),
            },
            secondBestScores: {
                standard: scoreFor(profile.standard_2),
                rapid: scoreFor(profile.rapid_2),
                sprint: scoreFor(profile.sprint_2),
                hard: scoreFor(profile.hard_2),
                daily: scoreFor(profile.daily_2),
            },
            thirdBestScores: {
                standard: scoreFor(profile.standard_3),
                rapid: scoreFor(profile.rapid_3),
                sprint: scoreFor(profile.sprint_3),
                hard: scoreFor(profile.hard_3),
                daily: scoreFor(profile.daily_3),
            },
        });
    }
    catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof Error && error.message === "Email not verified") {
            return NextResponse.json({ error: "Email not verified" }, { status: 403 });
        }

        console.error("Failed to send status to the browser", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
