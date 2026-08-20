import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import requireSession from '@/lib/auth/requireSession';
import {getDailyProblems} from '@/lib/game/dailyGame';
import ClientSide from './clientSide';

export const dynamic = 'force-dynamic';

function BackButton() {
    return (
        <Link
            href="/"
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
            Back
        </Link>
    );
}

export default async function DailyPage() {
    const session = await requireSession().catch(() => null);

    if (!session) {
        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Daily Game</h1>
                    <p className="mt-2 text-sm text-gray-600">Log in and verify your email to play the daily game.</p>
                    <div className="mt-5">
                        <BackButton />
                    </div>
                </div>
            </section>
        );
    }

    // Rotate first so completion state is reset before this request attempts
    // to claim today's single play.
    const dailyProblems = await getDailyProblems();

    const claimedDaily = await prisma.profile.updateMany({
        where: {
            userId: session.user.id,
            dailyCompleted: false,
        },
        data: {
            dailyCompleted: true,
        },
    });

    if (claimedDaily.count === 0) {
        const profile = await prisma.profile.findUnique({
            where: {
                userId: session.user.id,
            },
            select: {
                dailyCompleted: true,
            },
        });

        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
                        {profile ? "Daily Already Played" : "Daily Game"}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {profile
                            ? "You have already played today's daily game."
                            : "No profile found for this account."}
                    </p>
                    <div className="mt-5">
                        <BackButton />
                    </div>
                </div>
            </section>
        );
    }

    return <ClientSide dailyProblems={dailyProblems} />;
}
