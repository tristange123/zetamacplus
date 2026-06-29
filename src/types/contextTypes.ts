export type GameContext = {
    timeFormat: number,
    setTimeFormat: (name: number) => void,
    gameMode: string,
    setGameMode: (name: string) => void,
    problemType: string,
    setProblemType: (name: string) => void,
    operations: Record<string, boolean>
    setOperations: (name: Record<string, boolean>) => void,
}