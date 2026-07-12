import MainGameModeGame from "@/app/game/MainGameModeGame"

export default async function StandardGame({params}: {params: Promise<{ testId: string }>}){
    const { testId } = await params;
    return (
        <MainGameModeGame gameMode = 'standard' testId = {testId} />
    )
}