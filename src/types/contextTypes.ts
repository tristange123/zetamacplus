import {type ProblemType, type GameModeName, type Operation} from "@/types/frontendTypes"

export type GameContext = {
    timeFormat: number,
    setTimeFormat: (name: number) => void,
    gameMode: GameModeName,
    setGameMode: (name: GameModeName) => void,
    problemType: ProblemType,
    setProblemType: (name: ProblemType) => void,
    operations: Record<Operation, Record<string, number[]>>
    setOperations: (name: Record<Operation, Record<string, number[]>>) => void,
}