'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameContext } from './gameContext';
import { type MainGameModeName, type GameModeName, type ProblemType } from '@/types/frontendTypes'
import {type ScoresByGameMode} from '@/types/contextTypes'
import {MAIN_GAME_MODES, BOUNDS, EXTRA_GAME_MODES} from '@/lib/game/gameModeGlobals'
import { ArrowRight, Calculator, CalendarDays, Mail, Rabbit, Shapes, Skull, SlidersHorizontal, SportShoe, Wrench, type LucideIcon } from 'lucide-react'
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
    const [gameModeInput, setGameModeInput] = useState<MainGameModeName>('standard');
    const [isStarting, setIsStarting] = useState(false);
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


    const gameModeDisplay: Record<MainGameModeName, { label: string, duration: string, example: string, icon: LucideIcon }> = {
        standard: { label: 'Standard', duration: '2 min', example: '48 ÷ 6', icon: Calculator },
        rapid: { label: 'Rapid', duration: '1 min', example: '17 + 26', icon: Rabbit },
        sprint: { label: 'Sprint', duration: '10 sec', example: '8 × 7', icon: SportShoe },
        hard: { label: 'Hard', duration: '3 min', example: '684 − 297', icon: Skull },
    };

    function selectMainMode(mode: MainGameModeName) {
        setGameModeInput(mode);
        setTimeFormatInput(MAIN_GAME_MODES[mode].timeFormat);
        setProblemTypeInput(MAIN_GAME_MODES[mode].problemType);
    }

    async function handleStart (mode: GameModeName = gameModeInput) {
        try{
            if (mode === "daily") {
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
                gameContext?.setGameMode(mode);
                localStorage.setItem("gameMode", mode);
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

    async function handleMainStart() {
        if (isStarting) return;

        setIsStarting(true);
        await new Promise((resolve) => window.setTimeout(resolve, 140));
        await handleStart();
    }

    const dailyDescription = !userLoggedIn
        ? 'Log in to unlock'
        : dailyCompleted
            ? `Completed · ${dailyScore ?? 0} points`
            : dailyStatus === 'loading'
                ? 'Checking availability…'
                : dailyStatus === 'error'
                    ? 'Unavailable right now'
                    : 'One shared challenge';
    const dailyDisabled = !userLoggedIn || !dailyAvailable;

    return (
        <section
            aria-busy={isStarting}
            className={`relative min-h-[900px] pb-14 transition-opacity duration-150 ease-out motion-reduce:transition-none md:min-h-[calc(100vh-9rem)] md:pb-12 ${
                isStarting ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
        >
                <div className="absolute left-0 right-0 top-[13%]">
                    <div className="mx-auto w-full max-w-3xl px-3 md:px-6">
                        <div className="grid grid-cols-4 border-b border-gray-200">
                            {(Object.keys(gameModeDisplay) as MainGameModeName[]).map((mode) => {
                                const modeDetails = gameModeDisplay[mode];
                                const ModeIcon = modeDetails.icon;
                                const isSelected = mode === gameModeInput;

                                return (
                                    <button
                                        key={mode}
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={() => selectMainMode(mode)}
                                        className={`relative px-1 pb-4 pt-2 text-center transition-colors ${
                                            isSelected
                                                ? 'text-gray-900'
                                                : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        <span className="flex items-center justify-center gap-1.5 text-sm font-semibold sm:gap-2 sm:text-base">
                                            <ModeIcon size={16} aria-hidden="true" />
                                            <span>{modeDetails.label}</span>
                                        </span>
                                        <span className={`mt-1 block text-[0.65rem] sm:text-xs ${
                                            isSelected ? 'text-gray-500' : 'text-gray-300'
                                        }`}>
                                            {modeDetails.duration}
                                        </span>
                                        {isSelected && (
                                            <span className="absolute -bottom-px left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-gray-800" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="absolute left-1/2 top-[40%] w-screen -translate-x-1/2 -translate-y-1/2 bg-gray-200 py-6 md:py-8">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-3 px-4 md:gap-4 md:px-6">
                        <span className="justify-self-end whitespace-nowrap text-3xl font-semibold tracking-tight text-gray-800 sm:text-4xl md:text-5xl">
                            {gameModeDisplay[gameModeInput].example} =
                        </span>
                        <input
                            type="number"
                            readOnly
                            tabIndex={-1}
                            aria-label="Answer preview"
                            className="w-28 justify-self-start rounded-md border border-gray-300 bg-white px-3 py-3 text-center text-2xl text-gray-800 shadow-sm outline-none [appearance:textfield] sm:w-36 md:w-48 md:px-4 md:text-[1.6875rem] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <div className="absolute left-0 right-0 top-[calc(40%+5rem)]">
                <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                    <button
                        type="button"
                        disabled={dailyDisabled}
                        onClick={() => void handleStart('daily')}
                        className="group flex min-h-24 items-center gap-4 rounded-lg border border-gray-300 bg-white px-5 py-4 text-left transition hover:border-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-gray-300 disabled:hover:bg-white"
                    >
                        <CalendarDays size={20} className="shrink-0 text-gray-500" aria-hidden="true" />
                        <span>
                            <span className="block text-sm font-semibold text-gray-900">Daily</span>
                            <span className="mt-1 block text-xs leading-4 text-gray-500">{dailyDescription}</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/custom')}
                        className="flex min-h-24 items-center gap-4 rounded-lg border border-gray-200 bg-gray-100/70 px-5 py-4 text-left transition hover:border-gray-400 hover:bg-gray-200"
                    >
                        <SlidersHorizontal size={20} className="shrink-0 text-gray-400" aria-hidden="true" />
                        <span>
                            <span className="block text-sm font-semibold text-gray-600">Custom</span>
                            <span className="mt-1 block text-xs leading-4 text-gray-400">Set your own rules</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        aria-disabled="true"
                        className="flex min-h-24 cursor-default items-center gap-4 rounded-lg border border-gray-200 bg-gray-100/70 px-5 py-4 text-left"
                    >
                        <Shapes size={20} className="shrink-0 text-gray-400" aria-hidden="true" />
                        <span>
                            <span className="block text-sm font-semibold text-gray-600">Other game mode</span>
                            <span className="mt-1 block text-xs leading-4 text-gray-400">More ways to play soon</span>
                        </span>
                    </button>
                </div>

                    <div className="mt-5 flex justify-center">
                        <button
                            type="button"
                            disabled={isStarting}
                            onClick={() => void handleMainStart()}
                            className="group flex items-center justify-center gap-3 rounded-md bg-gray-900 px-10 py-3.5 text-sm font-semibold text-white transition hover:bg-black"
                        >
                            Start
                            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </button>
                    </div>
                </div>

            <footer className="absolute bottom-0 left-0 right-0 flex justify-center gap-10 border-t border-gray-200 pt-5">
                    <Link
                        href="/help"
                        className="flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-gray-700"
                    >
                        <Mail size={14} aria-hidden="true" />
                        Contact
                    </Link>
                    <a
                        href="https://github.com/tristange123/zetamacplus"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-gray-700"
                    >
                        <Wrench size={14} aria-hidden="true" />
                        GitHub
                    </a>
            </footer>
        </section>
    );
}