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
            },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            dailyCompleted: profile.dailyCompleted,
            dailyScore: profile.dailyCompleted ? (profile.dailyScore ?? 0) : null,
        });
    }
    catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof Error && error.message === "Email not verified") {
            return NextResponse.json({ error: "Email not verified" }, { status: 403 });
        }

        console.error("Failed to load daily status", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
