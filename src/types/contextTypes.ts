import {type ProblemType, type GameModeName, type OperationBounds, type Problem} from "@/types/frontendTypes"
import type { Dispatch, SetStateAction } from "react"

export type RankedGameModeName = Exclude<GameModeName, "custom">;
export type ScoresByGameMode = Record<RankedGameModeName, number | null>;
export type ScoreRank = 1 | 2 | 3 | null;

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
    setDailyProblems: (name: Problem[]) => void,
    showScore: boolean,
    setShowScore: (show: boolean) => void,
    showTimer: boolean,
    setShowTimer: (show: boolean) => void,
    showKeyboard: boolean,
    setShowKeyboard: (show: boolean) => void,
    bestScores: ScoresByGameMode,
    setBestScores: Dispatch<SetStateAction<ScoresByGameMode>>,
    secondBestScores: ScoresByGameMode,
    setSecondBestScores: Dispatch<SetStateAction<ScoresByGameMode>>,
    thirdBestScores: ScoresByGameMode,
    setThirdBestScores: Dispatch<SetStateAction<ScoresByGameMode>>,
    topScoresLoaded: boolean,
    setTopScoresLoaded: (loaded: boolean) => void,
    updateTopScores: (gameMode: RankedGameModeName, score: number) => ScoreRank
}