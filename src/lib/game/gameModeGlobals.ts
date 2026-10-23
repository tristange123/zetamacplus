import {type MainGameModeName, type ExtraGameModeName, type GameModeName, type GameModeType, type ProblemType, type OperationBounds} from "@/types/frontendTypes"


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

export const DAILY_GAME_MODE: GameModeType = {
    timeFormat: 120,
    problemType: 'daily'
}

export const EXTRA_GAME_MODES: Record<ExtraGameModeName, {timeFormat: number}> = {
    'custom': {
        timeFormat: 120,
    },
    'gcd': {
        timeFormat: 120,
    },
    'lcm': {
        timeFormat: 120,
    }
}

export function isMainGameMode(mode: string): mode is MainGameModeName {
    return Object.hasOwn(MAIN_GAME_MODES, mode);
}

export function isExtraGameMode(mode: string): mode is ExtraGameModeName {
    return Object.hasOwn(EXTRA_GAME_MODES, mode);
}

export function isGameModeName(mode: string): mode is GameModeName {
    return mode === 'daily' || isMainGameMode(mode) || isExtraGameMode(mode);
}
