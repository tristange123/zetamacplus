import {type ProblemType, type GameModeName, type Operation, type OperationBounds, type Problem} from "@/types/frontendTypes"

export type GameContext = {
    timeFormat: number,
    setTimeFormat: (name: number) => void,
    gameMode: GameModeName,
    setGameMode: (name: GameModeName) => void,
    problemType: ProblemType,
    setProblemType: (name: ProblemType) => void,
    operations: Record<Operation, Record<string, number[]>>
    setOperations: (name: OperationBounds) => void,
    score: number,
    setScore: (name: number) => void,
    testsAttempted: number,
    setTestsAttempted: (name: number) => void,
    problemSet: Problem[],
    setProblemSet: (name: Problem[]) => void,
}