import {type ProblemType, type GameModeName, type OperationBounds, type Problem} from "@/types/frontendTypes"

export type GameContext = {
    timeFormat: number,
    setTimeFormat: (name: number) => void,
    gameMode: GameModeName,
    setGameMode: (name: GameModeName) => void,
    problemType: ProblemType,
    setProblemType: (name: ProblemType) => void,
    operations: OperationBounds
    setOperations: (name: OperationBounds) => void,
    score: number,
    setScore: (name: number) => void,
    testsAttempted: number,
    setTestsAttempted: (name: number) => void,
    problemSet: Problem[],
    setProblemSet: (name: Problem[]) => void,
    dailyProblems: Problem[],
    setDailyProblems: (name: Problem[]) => void
}