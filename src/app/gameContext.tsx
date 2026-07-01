"use client";

import { createContext, useContext, useState , ReactNode} from "react";
import {type GameContext} from '@/types/contextTypes';
import {type ProblemType, type GameModeName} from '@/types/frontendTypes'


type GameProviderProps = {
  children: ReactNode;
};
// means that the props have a param with tyupe react node

const GameContext = createContext<GameContext | null>(null);

export function GameProvider({ children } : GameProviderProps) {
    const [timeFormat, setTimeFormat ] = useState<number>(120);
    const [gameMode, setGameMode ] = useState<GameModeName>("standard");
    const [problemType, setProblemType ] = useState<ProblemType>("medium");
    const [operations, setOperations ] = useState({});


    return (
        <GameContext.Provider value={{ timeFormat, setTimeFormat, gameMode, setGameMode, problemType, setProblemType, operations, setOperations}}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameContext() {
    return useContext(GameContext);
}