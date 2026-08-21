import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import requireSession from "@/lib/auth/requireSession";

type SettingsRequest = {
    showScore?: unknown;
    showTimer?: unknown;
    showKeyboard?: unknown;
};

export async function PATCH(request: Request) {
    try {
        const session = await requireSession();
        const body = await request.json() as SettingsRequest;

        if (
            typeof body.showScore !== "boolean"
            || typeof body.showTimer !== "boolean"
            || typeof body.showKeyboard !== "boolean"
        ) {
            return NextResponse.json(
                { error: "All settings must be boolean values" },
                { status: 400 },
            );
        }

        const settings = await prisma.profile.update({
            where: {
                userId: session.user.id,
            },
            data: {
                showScore: body.showScore,
                showTimer: body.showTimer,
                showKeyboard: body.showKeyboard,
            },
            select: {
                showScore: true,
                showTimer: true,
                showKeyboard: true,
            },
        });

        return NextResponse.json(settings);
    }
    catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof Error && error.message === "Email not verified") {
            return NextResponse.json({ error: "Email not verified" }, { status: 403 });
        }

        console.error("Failed to save settings", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
