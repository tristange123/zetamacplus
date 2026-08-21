import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import SettingsClient from "./clientSide";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return (
            <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <p className="text-sm text-gray-600">Log in to manage settings.</p>
            </div>
        );
    }

    if (!session.user.emailVerified) {
        return (
            <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <p className="text-sm text-gray-600">Verify your email to manage settings.</p>
            </div>
        );
    }

    const settings = await prisma.profile.findUnique({
        where: {
            userId: session.user.id,
        },
        select: {
            showScore: true,
            showTimer: true,
            showKeyboard: true,
        },
    });

    if (!settings) {
        return (
            <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <p className="text-sm text-gray-600">Profile not found.</p>
            </div>
        );
    }

    return <SettingsClient initialSettings={settings} />;
}
