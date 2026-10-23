import VersusResultsClient from "./clientSide";

export default async function VersusResultsPage({
    params,
}: {
    params: Promise<{ gameId: string }>;
}) {
    const { gameId } = await params;
    return <VersusResultsClient gameId={gameId} />;
}
