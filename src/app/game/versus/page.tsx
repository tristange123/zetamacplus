import { Suspense } from "react";
import { notFound } from "next/navigation";
import requireSession from "@/lib/auth/requireSession";
import { versusEnabled } from "@/lib/features";
import VersusAuthGate from "@/app/versusMenu/authGate";
import VersusGameClient from "./clientSide";

export const dynamic = "force-dynamic";

export default async function VersusGamePage() {
    if (!versusEnabled) {
        notFound();
    }
    const session = await requireSession().catch(() => null);
    if (!session) {
        return <VersusAuthGate title="Versus" />;
    }

    return (
        <Suspense
            fallback={
                <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                    <p className="text-sm text-gray-500">Connecting to match...</p>
                </section>
            }
        >
            <VersusGameClient />
        </Suspense>
    );
}
