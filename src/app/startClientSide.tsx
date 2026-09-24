'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameContext } from './gameContext';
import { type MainGameModeName, type GameModeName, type ProblemType } from '@/types/frontendTypes'
import {type ScoresByGameMode} from '@/types/contextTypes'
import {MAIN_GAME_MODES, BOUNDS, EXTRA_GAME_MODES} from '@/lib/game/gameModeGlobals'
import { ArrowRight, CalendarDays, ChevronDown, Mail, Shapes, SlidersHorizontal, Wrench } from 'lucide-react'
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


    const gameModeDisplay: Record<MainGameModeName, { label: string, duration: string, example: string }> = {
        standard: { label: 'Standard', duration: '2 minutes', example: '48 ÷ 6 =' },
        rapid: { label: 'Rapid', duration: '1 minute', example: '17 + 26 =' },
        sprint: { label: 'Sprint', duration: '10 seconds', example: '8 × 7 =' },
        hard: { label: 'Hard', duration: '3 minutes', example: '684 − 297 =' },
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

    const selectedMode = gameModeDisplay[gameModeInput];
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
        <section className="flex min-h-[calc(100vh-8rem)] flex-col justify-between pb-2">
            <div className="flex flex-1 flex-col justify-center py-10 md:py-16">
                <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        Mental math training
                    </p>
                    <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-gray-900 md:text-6xl">
                        Think fast. Get faster.
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-gray-600 md:text-base">
                        Pick a pace, solve as many problems as you can, and make every second count.
                    </p>
                </div>

                <div className="relative left-1/2 w-screen -translate-x-1/2 border-y border-gray-300 bg-gray-200">
                    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-7 md:grid-cols-[13rem_1fr_auto] md:items-center md:px-6 md:py-9">
                        <div>
                            <label htmlFor="home-game-mode" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                                Game mode
                            </label>
                            <div className="relative">
                                <select
                                    id="home-game-mode"
                                    value={gameModeInput}
                                    onChange={(event) => selectMainMode(event.target.value as MainGameModeName)}
                                    className="w-full appearance-none rounded-md border border-gray-400 bg-gray-100 py-2.5 pl-3 pr-9 text-sm font-semibold text-gray-900 outline-none transition focus:border-gray-700 focus:ring-2 focus:ring-gray-400/40"
                                >
                                    {(Object.keys(gameModeDisplay) as MainGameModeName[]).map((mode) => (
                                        <option key={mode} value={mode}>
                                            {gameModeDisplay[mode].label} · {gameModeDisplay[mode].duration}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} aria-hidden="true" />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 md:gap-5">
                            <span className="whitespace-nowrap text-4xl font-semibold tracking-[-0.04em] text-gray-900 md:text-5xl">
                                {selectedMode.example}
                            </span>
                            <span className="flex h-14 w-28 items-center justify-center rounded-md border border-gray-400 bg-white text-2xl text-gray-400 shadow-sm md:w-36">
                                ?
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleStart()}
                            className="group flex w-full items-center justify-center gap-3 rounded-md bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black md:w-auto"
                        >
                            Start {selectedMode.label}
                            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div className="mx-auto mt-6 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
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
                        className="flex min-h-24 items-center gap-4 rounded-lg border border-gray-300 bg-white px-5 py-4 text-left transition hover:border-gray-500 hover:bg-gray-50"
                    >
                        <SlidersHorizontal size={20} className="shrink-0 text-gray-500" aria-hidden="true" />
                        <span>
                            <span className="block text-sm font-semibold text-gray-900">Custom</span>
                            <span className="mt-1 block text-xs leading-4 text-gray-500">Set your own rules</span>
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
            </div>

            <footer className="flex justify-center gap-10 border-t border-gray-200 pt-5">
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