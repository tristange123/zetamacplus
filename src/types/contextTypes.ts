import {type ProblemType, type GameModeName} from "@/types/frontendTypes"

export type GameContext = {
    timeFormat: number,
    setTimeFormat: (name: number) => void,
    gameMode: GameModeName,
    setGameMode: (name: GameModeName) => void,
    problemType: ProblemType,
    setProblemType: (name: ProblemType) => void,
    operations: Record<string, boolean>
    setOperations: (name: Record<string, boolean>) => void,
}