"use client";

import { createContext, useContext, useEffect, useState , ReactNode} from "react";
import {authClient} from "@/lib/auth/auth-client";
import {
  type GameContext,
  type RankedGameModeName,
  type ScoreRank,
  type ScoresByGameMode,
} from '@/types/contextTypes';
import {type OperationBounds} from '@/types/frontendTypes'


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
    // Last custom game settings, used as the custom page defaults
    const [timeFormat, setTimeFormat ] = useState<number>(120);
    const [operations, setOperations ] = useState<OperationBounds>({
            '+': {first: [2,100], second: [2,100]}, 
            '-': {first: [2,100], second: [2,100]}, 
            '*': {first: [2,100], second: [2,12]}, 
            '/': {first: [2,100], second: [2,12]}
        });
    const [showScore, setShowScore] = useState(true);
    const [showTimer, setShowTimer] = useState(true);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [bestScores, setBestScores] = useState<ScoresByGameMode>({...EMPTY_SCORES});
    const [secondBestScores, setSecondBestScores] = useState<ScoresByGameMode>({...EMPTY_SCORES});
    const [thirdBestScores, setThirdBestScores] = useState<ScoresByGameMode>({...EMPTY_SCORES});
    const [topScoresLoaded, setTopScoresLoaded] = useState(false);

    const {data: session} = authClient.useSession();
    const sessionUserId = session?.user.id ?? null;

    // Load the user's display settings and top scores on any page,
    // so games opened directly (or reloaded) use them too
    useEffect(() => {
      if (!sessionUserId) return;

      const controller = new AbortController();

      async function loadProfileSettings() {
        try {
          const response = await fetch('/api/daily/status', {
            cache: 'no-store',
            signal: controller.signal,
          });
          if (!response.ok) return;

          const status: {
            showScore: boolean,
            showTimer: boolean,
            showKeyboard: boolean,
            bestScores: ScoresByGameMode,
            secondBestScores: ScoresByGameMode,
            thirdBestScores: ScoresByGameMode
          } = await response.json();

          setShowScore(status.showScore);
          setShowTimer(status.showTimer);
          setShowKeyboard(status.showKeyboard);
          setBestScores(status.bestScores);
          setSecondBestScores(status.secondBestScores);
          setThirdBestScores(status.thirdBestScores);
          setTopScoresLoaded(true);
        }
        catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
          console.error('Failed to load profile settings', error);
        }
      }

      void loadProfileSettings();

      return () => controller.abort();
    }, [sessionUserId]);

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
          operations,
          setOperations,
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