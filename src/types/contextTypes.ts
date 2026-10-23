import {type OperationBounds, type RankedGameModeName} from "@/types/frontendTypes"
import type { Dispatch, SetStateAction } from "react"

export type { RankedGameModeName };
export type ScoresByGameMode = Record<RankedGameModeName, number | null>;
export type ScoreRank = 1 | 2 | 3 | null;

export type GameContext = {
    timeFormat: number,
    setTimeFormat: (name: number) => void,
    operations: OperationBounds
    setOperations: (name: OperationBounds) => void,
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