"use client";

import { createContext, useContext, useState , ReactNode} from "react";
import {type GameContext} from '@/types/contextTypes';
import {type ProblemType, type GameModeName, type OperationBounds, type Problem} from '@/types/frontendTypes'


type GameProviderProps = {
  children: ReactNode;
};
// means that the props have a param with tyupe react node

const GameContext = createContext<GameContext | null>(null);

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
    

    return (
        <GameContext.Provider value={{ timeFormat, setTimeFormat, gameMode, setGameMode, problemType, setProblemType, operations, setOperations, score, setScore, testsAttempted, setTestsAttempted, problemSet, setProblemSet}}>
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