'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameContext } from './gameContext';
import { type MainGameModeName,type GameModeName, type ProblemType } from '@/types/frontendTypes'
import {type ScoresByGameMode} from '@/types/contextTypes'
import {MAIN_GAME_MODES, BOUNDS, EXTRA_GAME_MODES} from '@/lib/game/gameModeGlobals'
import { Calculator, Rabbit, SportShoe, Skull, NotebookText, Info, type LucideIcon, Clock, Mail, Wrench } from 'lucide-react'
import Link from 'next/link';
type startProps = {
    userLoggedIn: boolean
}

type DailyStatus = 'loading' | 'available' | 'completed' | 'error';



export default function StartClientSide({userLoggedIn}: startProps) {
    const router = useRouter();
    const gameContext = useGameContext();
    const {
        setBestScores,
        setSecondBestScores,
        setThirdBestScores,
        setTopScoresLoaded,
        setShowScore,
        setShowTimer,
        setShowKeyboard,
    } = gameContext;

    const [timeFormatInput, setTimeFormatInput] = useState(120);
    const [problemTypeInput, setProblemTypeInput] = useState<ProblemType>('medium');
    const [gameModeInput, setGameModeInput] = useState<GameModeName>('standard');
    const [dailyStatus, setDailyStatus] = useState<DailyStatus>('loading');
    const [dailyScore, setDailyScore] = useState<number | null>(null);

    useEffect(() => {
        if (!userLoggedIn) return;

        const controller = new AbortController();

        async function loadDailyStatus() {
            try {
                const response = await fetch('/api/daily/status', {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Daily status request failed with ${response.status}`);
                }

                const status: {
                    dailyCompleted: boolean,
                    dailyScore: number | null,
                    showScore: boolean,
                    showTimer: boolean,
                    showKeyboard: boolean,
                    bestScores: ScoresByGameMode,
                    secondBestScores: ScoresByGameMode,
                    thirdBestScores: ScoresByGameMode
                } = await response.json();

                setDailyScore(status.dailyScore);
                setDailyStatus(status.dailyCompleted ? 'completed' : 'available');
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
                console.error('Failed to load daily status', error);
                setDailyStatus('error');
            }
        }

        void loadDailyStatus();

        return () => controller.abort();
    }, [
        userLoggedIn,
        setBestScores,
        setSecondBestScores,
        setThirdBestScores,
        setTopScoresLoaded,
        setShowScore,
        setShowTimer,
        setShowKeyboard,
    ]);

    const dailyCompleted = dailyStatus === 'completed';
    const dailyAvailable = dailyStatus === 'available';


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
                if (!dailyAvailable) return;

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
        <section className="flex min-h-[calc(100vh-11rem)] flex-col items-center justify-start pb-2 md:min-h-[calc(100vh-9rem)] md:justify-end">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm md:p-8">
                {/* <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">Game Modes</h2>
                    
                </div> */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:min-h-[55vh] lg:grid-cols-3">
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
                                    className={`flex min-h-28 w-full flex-col items-center justify-center rounded-xl border px-4 py-5 text-center transition md:h-full md:min-h-0 md:px-6 md:py-6 ${
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
                                        className="pointer-events-none absolute right-0 top-full z-10 mt-2 hidden max-w-[calc(100vw-3rem)] whitespace-pre-line rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 shadow-lg group-hover/info:block md:left-full md:right-auto md:top-1/2 md:mt-0 md:ml-2 md:max-w-xs md:-translate-y-1/2"
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
                            disabled={!dailyAvailable}
                            onClick={() => {
                                if (!dailyAvailable) return;
                                setGameModeInput('daily');
                            }}
                            className={`flex min-h-28 w-full flex-col items-center justify-center rounded-xl border px-4 py-5 text-center transition md:h-full md:min-h-0 md:px-6 md:py-6 ${
                                dailyCompleted
                                    ? 'cursor-not-allowed border-gray-200 bg-white text-gray-500 shadow-sm'
                                    : !dailyAvailable
                                    ? `${dailyStatus === 'loading' ? 'cursor-wait' : 'cursor-not-allowed'} border-gray-200 bg-white text-gray-500 shadow-sm`
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
                                    : dailyStatus === 'loading'
                                    ? "Checking today's game..."
                                    : dailyStatus === 'error'
                                    ? "Daily game unavailable"
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
                                className="pointer-events-none absolute right-0 top-full z-10 mt-2 hidden max-w-[calc(100vw-3rem)] whitespace-pre-line rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 shadow-lg group-hover/info:block md:left-full md:right-auto md:top-1/2 md:mt-0 md:ml-2 md:max-w-xs md:-translate-y-1/2"
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
                            className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100 px-4 py-5 text-center text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-200 md:h-full md:min-h-0 md:px-6 md:py-6"
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
                                className="pointer-events-none absolute right-0 top-full z-10 mt-2 hidden whitespace-pre-line rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-100 shadow-lg group-hover/info:block md:left-full md:right-auto md:top-1/2 md:mt-0 md:ml-2 md:-translate-y-1/2"
                            >
                                Custom
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => {handleStart()}}
                        className="rounded-lg bg-gray-800 px-10 py-4 text-lg font-semibold text-gray-100 shadow-sm transition hover:bg-gray-900"
                    >
                        Start
                    </button>
                </div>

            </div>
            <div className="mt-6 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3">
                <div className="flex justify-center gap-12 md:gap-24">
                    <Link
                        href="/help"
                            className="flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-gray-600"
                    >
                        <Mail size={14} aria-hidden="true" />
                        Contact
                    </Link>
                    <a
                        href="https://github.com/tristange123/zetamacplus"
                        target="_blank"
                        rel="noreferrer"
                            className="flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-gray-600"
                    >
                        <Wrench size={14} aria-hidden="true" />
                        GitHub
                    </a>
                </div>
            </div>
        </section>
    );
}