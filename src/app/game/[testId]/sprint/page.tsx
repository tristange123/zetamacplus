import MainGameModeGame from "@/app/game/MainGameModeGame"

export default async function SprintGame({params}: {params: Promise<{ testId: string }>}){
    const { testId } = await params;
    return (
        <MainGameModeGame gameMode = 'sprint' testId = {testId} />
    )
}