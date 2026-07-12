import MainGameModeGame from "@/app/game/MainGameModeGame"

export default async function RapidGame({params}: {params: Promise<{ testId: string }>}){
    const { testId } = await params;
    return (
        <MainGameModeGame gameMode = 'rapid' testId = {testId} />
    )
}