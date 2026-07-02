'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGameContext } from './gameContext';
import { type MainGameModeName, type ProblemType } from '@/types/frontendTypes'
import {MAIN_GAME_MODES, BOUNDS} from '@/lib/game/gameModeGlobals'
type startProps = {
    userLoggedIn: boolean,
    username: string | null
}

export default function StartClientSide({userLoggedIn, username}: startProps) {
    const router = useRouter();
    const gameContext = useGameContext();

    const [timeFormatInput, setTimeFormatInput] = useState(120);
    const [problemTypeInput, setProblemTypeInput] = useState<ProblemType>('medium');
    const [gameModeInput, setGameModeInput] = useState<MainGameModeName>('standard');


    type GameModeDisplay = {
        label: string,
        subtitle: string,
        gameMode: MainGameModeName
    }
    const gameModeDisplay: GameModeDisplay[] = [
            { label: 'Standard', subtitle: '120 secs', gameMode: 'standard' },
            { label: 'Rapid', subtitle: '60 secs', gameMode: 'rapid' },
            { label: 'Sprint', subtitle: '10 secs', gameMode: 'sprint' },
            { label: 'Hard', subtitle: '180 secs', gameMode: 'hard' },
    ];

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">Game Modes</h2>
                    
                </div>

                <div className="grid min-h-[55vh] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gameModeDisplay.map((mode) => {
                        const isSelected = gameModeInput === mode.gameMode;
                        return (
                            <button
                                key={mode.gameMode}
                                onClick={() => {
                                    setTimeFormatInput(MAIN_GAME_MODES[mode.gameMode].timeFormat);
                                    setProblemTypeInput(MAIN_GAME_MODES[mode.gameMode].problemType);
                                    setGameModeInput(mode.gameMode);
                                }}
                                className={`flex flex-col items-center justify-center rounded-xl border px-4 py-6 text-center transition md:px-6 ${
                                    isSelected
                                        ? 'border-gray-300 bg-gray-200 text-gray-800 shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow'
                                }`}
                            >
                                <span className="text-lg font-semibold md:text-xl">{mode.label}</span>
                                <span className={`mt-2 text-sm ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                                    {mode.subtitle}
                                </span>
                            </button>
                        );
                    })}

                    <button
                        onClick={() => {
                            router.push('/custom');
                        }}
                        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100 px-4 py-6 text-center text-gray-600 transition hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-200 md:px-6"
                    >
                        <span className="text-lg font-semibold md:text-xl">Custom</span>
                        <span className="mt-2 text-sm text-gray-500">Set your own rules</span>
                    </button>
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => {
                            gameContext?.setGameMode(gameModeInput);
                            gameContext?.setProblemType(problemTypeInput);
                            gameContext?.setTimeFormat(timeFormatInput);
                            gameContext?.setOperations(BOUNDS[problemTypeInput])
                            gameContext?.setScore(0);
                            gameContext?.setTestsAttempted(0);
                            gameContext?.setProblemSet([]);
                            router.push('/game');
                        }}
                        className="rounded-lg bg-gray-800 px-8 py-3 text-base font-semibold text-gray-100 transition hover:bg-gray-900"
                    >
                        Start
                    </button>
                </div>
            </div>
        </section>
    );
}