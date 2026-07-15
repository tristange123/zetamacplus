'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGameContext } from './gameContext';
import { type MainGameModeName,type GameModeName, type ProblemType } from '@/types/frontendTypes'
import {MAIN_GAME_MODES, BOUNDS, EXTRA_GAME_MODES} from '@/lib/game/gameModeGlobals'
import { Calculator, Rabbit, SportShoe, Skull, NotebookText, Info, type LucideIcon, Clock } from 'lucide-react'
type startProps = {
    userLoggedIn: boolean,
    username: string | null,
    dailyCompleted: boolean,
    dailyScore: number | null
}



export default function StartClientSide({userLoggedIn, dailyCompleted: initialDailyCompleted, dailyScore: initialDailyScore}: startProps) {
    const router = useRouter();
    const gameContext = useGameContext();

    const [timeFormatInput, setTimeFormatInput] = useState(120);
    const [problemTypeInput, setProblemTypeInput] = useState<ProblemType>('medium');
    const [gameModeInput, setGameModeInput] = useState<GameModeName>('standard');
    const [dailyCompleted] = useState(initialDailyCompleted);
    const [dailyScore] = useState<number | null>(initialDailyScore);


    type GameModeDisplay = {
        label: string,
        subtitle: string,
        gameMode: MainGameModeName,
        tooltip: string,
        icon: LucideIcon
    }
    const gameModeDisplay: GameModeDisplay[] = [
            { label: 'Standard', subtitle: '120 secs', gameMode: 'standard', tooltip: "Addition and Subtraction: (2-100) by (2-100)\nMultiplication and Division: (2-100) by (2-12)", icon: Calculator },
            { label: 'Rapid', subtitle: '60 secs', gameMode: 'rapid', tooltip: "Addition and Subtraction: (2-50) by (2-50)\nMultiplication and Division: (2-50) by (2-5)", icon: Rabbit },
            { label: 'Sprint', subtitle: '10 secs', gameMode: 'sprint', tooltip: "Addition and Subtraction: (2-10) by (2-10)\nMultiplication and Division: (2-10) by (2-10)", icon: SportShoe },
            { label: 'Hard', subtitle: '180 secs', gameMode: 'hard', tooltip: "Addition and Subtraction: (20-1000) by (20-1000)\nMultiplication and Division: (20-100) by (6-20)", icon: Skull },
    ];

    async function handleStart () {     
        try{
            if (gameModeInput == "daily") {
                gameContext?.setGameMode("daily");
                localStorage.setItem("gameMode", "daily");
                gameContext?.setProblemType(EXTRA_GAME_MODES['daily']['problemType']);
                localStorage.setItem("problemType", EXTRA_GAME_MODES['daily']['problemType']);
                gameContext?.setTimeFormat(EXTRA_GAME_MODES['daily']['timeFormat']);
                localStorage.setItem("timeFormat", String(EXTRA_GAME_MODES['daily']['timeFormat']));
                localStorage.setItem("testLogged","false");

                router.push('/game/daily')
            }
            else{
                gameContext?.setGameMode(gameModeInput);
                localStorage.setItem("gameMode", gameModeInput);
                gameContext?.setProblemType(problemTypeInput);
                localStorage.setItem("problemType", problemTypeInput);
                gameContext?.setTimeFormat(timeFormatInput);
                localStorage.setItem("timeFormat", String(timeFormatInput));
                gameContext?.setOperations(BOUNDS[problemTypeInput])
                localStorage.setItem("operations", JSON.stringify(BOUNDS[problemTypeInput]));
                gameContext?.setScore(0);
                gameContext?.setTestsAttempted(0);
                gameContext?.setProblemSet([]);

                localStorage.setItem("testLogged","false");
                router.push(`/game`);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    return (
        <section className="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">Game Modes</h2>
                    
                </div>

                <div className="grid min-h-[55vh] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gameModeDisplay.map((mode) => {
                        const isSelected = gameModeInput === mode.gameMode;
                        const ModeIcon = mode.icon;
                        return (
                            <div key={mode.gameMode} className="relative h-full w-full">
                                <button
                                    onClick={() => {
                                        setTimeFormatInput(MAIN_GAME_MODES[mode.gameMode].timeFormat);
                                        setProblemTypeInput(MAIN_GAME_MODES[mode.gameMode].problemType);
                                        setGameModeInput(mode.gameMode);
                                    }}
                                    className={`flex h-full w-full flex-col items-center justify-center rounded-xl border px-4 py-6 text-center transition md:px-6 ${
                                        isSelected
                                            ? 'border-gray-300 bg-gray-200 text-gray-800 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-gray-300 hover:shadow'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold md:text-xl">{mode.label}</span>
                                        <ModeIcon
                                            size={24}
                                            className={isSelected ? 'text-gray-600' : 'text-gray-500'}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <span className={`mt-2 text-sm ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                                        {mode.subtitle}
                                    </span>
                                </button>
                                <div className="group/info absolute right-2 top-2 z-10">
                                    <Info size={12} className="text-gray-400" aria-hidden="true" />
                                    <div
                                        role="tooltip"
                                        className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 hidden max-w-xs -translate-y-1/2 whitespace-pre-line rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 shadow-lg group-hover/info:block"
                                    >
                                        {mode.tooltip}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {userLoggedIn && (
                    <div className="relative h-full w-full">
                        <button
                            disabled={!userLoggedIn || dailyCompleted}
                            onClick={() => {
                                if (!userLoggedIn || dailyCompleted) return;
                                setGameModeInput('daily');
                            }}
                            className={`flex h-full w-full flex-col items-center justify-center rounded-xl border px-4 py-6 text-center transition md:px-6 ${
                                !userLoggedIn
                                    ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500'
                                    : dailyCompleted
                                    ? 'cursor-not-allowed border-gray-200 bg-white text-gray-500 shadow-sm'
                                    : gameModeInput === "daily"
                                    ? 'border-gray-300 bg-gray-200 text-gray-800 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-gray-300 hover:shadow'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold md:text-xl"> Daily </span>
                                <Clock
                                    size={24}
                                    className={gameModeInput === "daily" ? 'text-gray-600' : 'text-gray-500'}
                                    aria-hidden="true"
                                />
                            </div>
                            <span className={`mt-2 text-sm ${gameModeInput === "daily" ? 'text-gray-600' : 'text-gray-500'}`}>
                                {!userLoggedIn
                                    ? "Login to unlock"
                                    : dailyCompleted
                                    ? ""
                                    : "Play once every day!"}
                            </span>
                            {dailyCompleted && (
                                <span className="mt-4 rounded-md border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                                    Today&apos;s score: {dailyScore ?? 0}
                                </span>
                            )}
                        </button>
                        <div className="group/info absolute right-2 top-2 z-10">
                            <Info size={12} className="text-gray-400" aria-hidden="true" />
                            <div
                                role="tooltip"
                                className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 hidden max-w-xs -translate-y-1/2 whitespace-pre-line rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 shadow-lg group-hover/info:block"
                            >
                                Standard problem bounds
                            </div>
                        </div>
                    </div>)}

                    <div className="relative h-full w-full">
                        <button
                            onClick={() => {
                                router.push('/custom');
                            }}
                            className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100 px-4 py-6 text-center text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-200 md:px-6"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold md:text-xl">Custom</span>
                                <NotebookText size={24} className="text-gray-500" aria-hidden="true" />
                            </div>
                            <span className="mt-2 text-sm text-gray-500">Set your own rules</span>
                        </button>
                        <div className="group/info absolute right-2 top-2 z-10">
                            <Info size={12} className="text-gray-400" aria-hidden="true" />
                            <div
                                role="tooltip"
                                className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 hidden -translate-y-1/2 whitespace-pre-line rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 shadow-lg group-hover/info:block"
                            >
                                Custom
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => {handleStart()}}
                        className="rounded-lg bg-gray-800 px-8 py-3 text-base font-semibold text-gray-100 shadow-sm transition hover:bg-gray-900"
                    >
                        Start
                    </button>
                </div>
            </div>
        </section>
    );
}