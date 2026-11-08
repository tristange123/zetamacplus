import { notFound } from "next/navigation";
import { versusEnabled } from "@/lib/features";
import VersusResultsClient from "./clientSide";

export default async function VersusResultsPage({
    params,
}: {
    params: Promise<{ gameId: string }>;
}) {
    if (!versusEnabled) {
        notFound();
    }
    const { gameId } = await params;
    return <VersusResultsClient gameId={gameId} />;
}
