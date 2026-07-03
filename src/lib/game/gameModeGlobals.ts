import {type MainGameModeName, type ExtraGameModeName, type GameModeType, type ProblemType, type OperationBounds} from "@/types/frontendTypes"


export const MAIN_GAME_MODES: Record<MainGameModeName, GameModeType> = {
    'standard':
    {
        timeFormat: 120,
        problemType: 'medium',
    },
    'rapid':
    {
        timeFormat: 60,
        problemType: 'medium',
    },
    'hard':
    {
        timeFormat: 180,
        problemType: 'hard',
    },
    'sprint':
    {
        timeFormat: 10,
        problemType: 'easy',
    }
}

export const BOUNDS: Record <ProblemType, OperationBounds> = 
        {'medium':{
            '+': {first: [2,100], second: [2,100]}, 
            '-': {first: [2,100], second: [2,100]}, 
            '*': {first: [2,100], second: [2,12]}, 
            '/': {first: [2,100], second: [2,12]}
        }, 
         'easy': {
            '+': {first: [2,10], second: [2,10]}, 
            '-': {first: [2,10], second: [2,10]}, 
            '*': {first: [2,10], second: [2,10]}, 
            '/': {first: [2,10], second: [2,10]}
        },
         'hard': {
            '+': {first: [50,1000], second: [50,1000]}, 
            '-': {first: [50,1000], second: [50,1000]}, 
            '*': {first: [20,100], second: [5,25]}, 
            '/': {first: [20,100], second: [5,25]}
        }
        };

export const EXTRA_GAME_MODES: Record<ExtraGameModeName, GameModeType> = {
    'custom':
    {
        timeFormat: 120,
        problemType: 'medium',
    },
    // "LCM": {
    //     timeFormat: 60,
    //     problemType: 'LCM'
    // }
}

// choosing a game: Gamemode -> operationsContext -> bounds