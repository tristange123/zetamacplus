"use client";

import { createContext, useContext, useState , ReactNode} from "react";
import {type GameContext} from '@/types/contextTypes';



interface GameProviderProps {
  children: ReactNode;
};
// means that the props have a param with tyupe react node

const GameContext = createContext<GameContext | null>(null);

export function GameProvider({ children } : GameProviderProps) {
    const [timeFormat, setTimeFormat ] = useState(120);
    const [gameMode, setGameMode ] = useState("");
    const [problemType, setProblemType ] = useState("");
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