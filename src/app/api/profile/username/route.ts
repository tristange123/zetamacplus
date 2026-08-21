import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import requireSession from "@/lib/auth/requireSession";
import prisma from "@/lib/db/prisma";

type UsernameRequest = {
    username?: unknown;
};

export async function GET() {
    try {
        const session = await requireSession();
        const profile = await prisma.profile.findUnique({
            where: {
                userId: session.user.id,
            },
            select: {
                username: true,
            },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json(profile);
    }
    catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof Error && error.message === "Email not verified") {
            return NextResponse.json({ error: "Email not verified" }, { status: 403 });
        }

        console.error("Failed to load username", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await requireSession();
        const body = await request.json() as UsernameRequest;

        if (typeof body.username !== "string") {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        const username = body.username.trim();
        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        if (username.length > 50) {
            return NextResponse.json(
                { error: "Username must be 50 characters or fewer" },
                { status: 400 },
            );
        }

        const existingProfile = await prisma.profile.findUnique({
            where: { username },
            select: { userId: true },
        });
        if (existingProfile && existingProfile.userId !== session.user.id) {
            return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
        }

        const profile = await prisma.profile.update({
            where: {
                userId: session.user.id,
            },
            data: {
                username,
            },
            select: {
                username: true,
            },
        });

        revalidatePath("/leaderboard");
        revalidatePath("/stats");

        return NextResponse.json(profile);
    }
    catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof Error && error.message === "Email not verified") {
            return NextResponse.json({ error: "Email not verified" }, { status: 403 });
        }

        console.error("Failed to change username", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
