import requireSession from "@/lib/auth/requireSession";
import VersusAuthGate from "./authGate";
import VersusMenuClient from "./clientSide";

export const dynamic = "force-dynamic";

export default async function VersusMenuPage() {
    const session = await requireSession().catch(() => null);
    if (!session) {
        return <VersusAuthGate title="Versus" />;
    }
    return <VersusMenuClient />;
}
