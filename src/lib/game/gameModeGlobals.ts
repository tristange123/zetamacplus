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
        problemType: 'easy-medium',
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
        'easy-medium': {
            '+': {first: [2,50], second: [2,50]}, 
            '-': {first: [2,50], second: [2,50]}, 
            '*': {first: [2,50], second: [2,5]}, 
            '/': {first: [2,50], second: [2,5]}
        },
         'hard': {
            '+': {first: [200,1000], second: [200,1000]}, 
            '-': {first: [200,1000], second: [200,1000]}, 
            '*': {first: [20,100], second: [6,20]}, 
            '/': {first: [20,100], second: [6,20]}
        },
        'daily' : {
            '+': {first: [2,100], second: [2,100]}, 
            '-': {first: [2,100], second: [2,100]}, 
            '*': {first: [2,100], second: [2,12]}, 
            '/': {first: [2,100], second: [2,12]}
        }
        };

export const EXTRA_GAME_MODES: Record<ExtraGameModeName, GameModeType> = {
    'custom':
    {
        timeFormat: 120,
        problemType: 'medium',
    },
    'daily':{
        timeFormat: 120,
        problemType: 'daily'
    }
    // "LCM": {
    //     timeFormat: 60,
    //     problemType: 'LCM'
    // }
}

// choosing a game: Gamemode -> operationsContext -> bounds