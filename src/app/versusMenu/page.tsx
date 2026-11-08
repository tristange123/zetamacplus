import { notFound } from "next/navigation";
import requireSession from "@/lib/auth/requireSession";
import { versusEnabled } from "@/lib/features";
import VersusAuthGate from "./authGate";
import VersusMenuClient from "./clientSide";

export const dynamic = "force-dynamic";

export default async function VersusMenuPage() {
    if (!versusEnabled) {
        notFound();
    }
    const session = await requireSession().catch(() => null);
    if (!session) {
        return <VersusAuthGate title="Versus" />;
    }
    return <VersusMenuClient />;
}
