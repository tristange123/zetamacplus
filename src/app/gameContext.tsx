"use client";

import { createContext, useContext, useState , ReactNode} from "react";
import {
  type GameContext,
  type RankedGameModeName,
  type ScoreRank,
  type ScoresByGameMode,
} from '@/types/contextTypes';
import {type ProblemType, type GameModeName, type OperationBounds, type Problem} from '@/types/frontendTypes'


type GameProviderProps = {
  children: ReactNode;
};
// means that the props have a param with tyupe react node

const GameContext = createContext<GameContext | null>(null);

const EMPTY_SCORES: ScoresByGameMode = {
  standard: null,
  rapid: null,
  sprint: null,
  hard: null,
  daily: null,
};

export function GameProvider({ children } : GameProviderProps) {
    const [timeFormat, setTimeFormat ] = useState<number>(120);
    const [gameMode, setGameMode ] = useState<GameModeName>("standard");
    const [problemType, setProblemType ] = useState<ProblemType>("medium");
    const [operations, setOperations ] = useState<OperationBounds>({
            '+': {first: [2,100], second: [2,100]}, 
            '-': {first: [2,100], second: [2,100]}, 
            '*': {first: [2,100], second: [2,12]}, 
            '/': {first: [2,100], second: [2,12]}
        });
    const [score, setScore] = useState<number>(0);
    const [testsAttempted, setTestsAttempted] = useState<number>(0);
    const [problemSet, setProblemSet] = useState<Problem[]>([]);
    const [dailyProblems, setDailyProblems] = useState<Problem[]>([]);
    const [showScore, setShowScore] = useState(true);
    const [showTimer, setShowTimer] = useState(true);
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [bestScores, setBestScores] = useState<ScoresByGameMode>({...EMPTY_SCORES});
    const [secondBestScores, setSecondBestScores] = useState<ScoresByGameMode>({...EMPTY_SCORES});
    const [thirdBestScores, setThirdBestScores] = useState<ScoresByGameMode>({...EMPTY_SCORES});
    const [topScoresLoaded, setTopScoresLoaded] = useState(false);

    function updateTopScores(gameMode: RankedGameModeName, newScore: number): ScoreRank {
      if (!topScoresLoaded) return null;

      const first = bestScores[gameMode];
      const second = secondBestScores[gameMode];
      const third = thirdBestScores[gameMode];
      let rank: ScoreRank = null;
      let nextScores: [number | null, number | null, number | null] = [first, second, third];

      if (first == null || newScore > first) {
        rank = 1;
        nextScores = [newScore, first, second];
      }
      else if (second == null || newScore > second) {
        rank = 2;
        nextScores = [first, newScore, second];
      }
      else if (third == null || newScore > third) {
        rank = 3;
        nextScores = [first, second, newScore];
      }

      if (rank != null) {
        setBestScores((scores) => ({...scores, [gameMode]: nextScores[0]}));
        setSecondBestScores((scores) => ({...scores, [gameMode]: nextScores[1]}));
        setThirdBestScores((scores) => ({...scores, [gameMode]: nextScores[2]}));
      }

      return rank;
    }
    

    return (
        <GameContext.Provider value={{
          timeFormat,
          setTimeFormat,
          gameMode,
          setGameMode,
          problemType,
          setProblemType,
          operations,
          setOperations,
          score,
          setScore,
          testsAttempted,
          setTestsAttempted,
          problemSet,
          setProblemSet,
          dailyProblems,
          setDailyProblems,
          showScore,
          setShowScore,
          showTimer,
          setShowTimer,
          showKeyboard,
          setShowKeyboard,
          bestScores,
          setBestScores,
          secondBestScores,
          setSecondBestScores,
          thirdBestScores,
          setThirdBestScores,
          topScoresLoaded,
          setTopScoresLoaded,
          updateTopScores,
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameContext() {
    const context = useContext(GameContext)
    if (!context){
        throw new Error ("missing context somehow");
    }
    return context;
}