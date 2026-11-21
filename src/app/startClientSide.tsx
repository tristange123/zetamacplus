'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type MainGameModeName } from '@/types/frontendTypes'
import { ArrowRight, Calculator, CalendarDays, Check, Dumbbell, Flame, Info, Mail, Rabbit, Shapes, Skull, SlidersHorizontal, SportShoe, Wrench, type LucideIcon } from 'lucide-react'
import Link from 'next/link';
import { type ModeStandings } from '@/lib/profile/modeStandings'
type startProps = {
    userLoggedIn: boolean,
    // Null when logged out, unverified, or the lookup failed
    standings: ModeStandings | null,
}

type DailyStatus = 'loading' | 'available' | 'completed' | 'error';



export default function StartClientSide({userLoggedIn, standings}: startProps) {
    const router = useRouter();

    const [gameModeInput, setGameModeInput] = useState<MainGameModeName>('standard');
    const [isStarting, setIsStarting] = useState(false);
    const [dailyStatus, setDailyStatus] = useState<DailyStatus>('loading');
    const [dailyScore, setDailyScore] = useState<number | null>(null);
    const [dailyFinishedToday, setDailyFinishedToday] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);

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
                    completedToday: boolean,
                    currentStreak: number
                } = await response.json();

                setDailyScore(status.dailyScore);
                setDailyFinishedToday(status.completedToday);
                setCurrentStreak(status.currentStreak);
                setDailyStatus(status.dailyCompleted ? 'completed' : 'available');
            }
            catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return;
                console.error('Failed to load daily status', error);
                setDailyStatus('error');
            }
        }

        void loadDailyStatus();

        return () => controller.abort();
    }, [userLoggedIn]);

    const dailyCompleted = dailyStatus === 'completed';
    const dailyAvailable = dailyStatus === 'available';


    const gameModeDisplay: Record<MainGameModeName, { label: string, duration: string, example: string, tooltip: string, icon: LucideIcon }> = {
        standard: {
            label: 'Standard',
            duration: '2 min',
            example: '__ _ __',
            tooltip: 'Add/subtract: 2–100 by 2–100\nMultiply/divide: 2–100 by 2–12',
            icon: Calculator,
        },
        rapid: {
            label: 'Rapid',
            duration: '1 min',
            example: '__ _ _',
            tooltip: 'Add/subtract: 2–50 by 2–50\nMultiply/divide: 2–50 by 2–5',
            icon: Rabbit,
        },
        sprint: {
            label: 'Sprint',
            duration: '10 sec',
            example: '_ _ _',
            tooltip: 'All operations use numbers from 2–10',
            icon: SportShoe,
        },
        hard: {
            label: 'Hard',
            duration: '3 min',
            example: '___ _ ___',
            tooltip: 'Add/subtract: 200–1,000 by 200–1,000\nMultiply/divide: 20–100 by 6–20',
            icon: Skull,
        },
    };

    function selectMainMode(mode: MainGameModeName) {
        setGameModeInput(mode);
    }

    async function startGame(mode: MainGameModeName | 'daily') {
        if (isStarting) return;
        if (mode === 'daily' && !dailyAvailable) return;

        setIsStarting(true);
        await new Promise((resolve) => window.setTimeout(resolve, 140));
        router.push(`/game/${mode}`);
    }

    const dailyDescription = dailyCompleted
        ? dailyFinishedToday
            ? `Completed · ${dailyScore ?? 0} points`
            : 'Attempt already claimed'
        : dailyStatus === 'loading'
            ? 'Checking availability…'
            : dailyStatus === 'error'
                ? 'Unavailable right now'
                : 'One shared challenge';
    const showDailyStreak = dailyStatus !== 'loading' && dailyStatus !== 'error';
    const selectedExample = gameModeDisplay[gameModeInput].example;

    function renderDailyCard(className: string) {
        return (
            <div className={className}>
                <div className="flex items-center gap-4 rounded-xl border border-gray-300 bg-white px-5 py-4 shadow-sm">
                    <div className="shrink-0 rounded-lg bg-gray-100 p-2.5 text-gray-700">
                        <CalendarDays size={22} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            Daily
                            {showDailyStreak && (
                                <span
                                    className="flex items-center gap-1 text-sm font-semibold text-gray-700"
                                    aria-label={`Current streak: ${currentStreak} days`}
                                >
                                    <Flame
                                        size={15}
                                        className={dailyFinishedToday ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                                        aria-hidden="true"
                                    />
                                    {currentStreak}
                                </span>
                            )}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{dailyDescription}</p>
                    </div>
                    {dailyCompleted ? (
                        <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-500">
                            <Check size={16} aria-hidden="true" />
                            Done
                        </span>
                    ) : (
                        <button
                            type="button"
                            disabled={!dailyAvailable || isStarting}
                            onClick={() => void startGame('daily')}
                            className="group flex shrink-0 items-center gap-2 rounded-md border border-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
                        >
                            Play
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const sidebarPanel = 'fixed inset-y-0 z-40 hidden w-64 flex-col gap-6 overflow-y-auto border-gray-200/80 bg-white/55 px-5 pb-6 pt-24 backdrop-blur-md xl:flex 2xl:w-72';
    const sidebarCard = 'rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm';

    function renderDailySidebar() {
        return (
            <div className={sidebarCard}>
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        <CalendarDays size={20} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold text-gray-900">Daily</span>
                        <span className="block text-xs text-gray-500">
                            {userLoggedIn ? dailyDescription : 'One shared challenge'}
                        </span>
                    </span>
                    {userLoggedIn && showDailyStreak && (
                        <span
                            className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-sm font-semibold tabular-nums text-gray-700"
                            aria-label={`Current streak: ${currentStreak} days`}
                        >
                            <Flame
                                size={20}
                                className={dailyFinishedToday ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                                aria-hidden="true"
                            />
                            {currentStreak}
                        </span>
                    )}
                </div>
                {!userLoggedIn ? (
                    <Link
                        href="/login"
                        className="mt-4 flex w-full items-center justify-center rounded-md border border-gray-300 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
                    >
                        Log in to play
                    </Link>
                ) : dailyCompleted ? (
                    <span className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-100 py-2 text-sm font-semibold text-gray-500">
                        <Check size={16} aria-hidden="true" />
                        Done for today
                    </span>
                ) : (
                    <button
                        type="button"
                        disabled={!dailyAvailable || isStarting}
                        onClick={() => void startGame('daily')}
                        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        Play
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                )}
            </div>
        );
    }

    function renderTrainingSidebar() {
        return (
            <Link href="/game/training" className={`group block transition hover:border-gray-400 ${sidebarCard}`}>
                <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        <Dumbbell size={20} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold text-gray-900">Training</span>
                        <span className="block text-xs text-gray-500">Targets your weakest standard problems</span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-900" aria-hidden="true" />
                </span>
            </Link>
        );
    }

    // Grayer than the white Daily/Training cards so the stats read as secondary.
    const scoreCard = 'rounded-xl border border-gray-200/80 bg-gray-100/80 p-4';

    function renderTopScores() {
        return (
            <section aria-label="Your best scores" className="flex flex-col gap-3">
                <h2 className="px-1 text-lg font-semibold tracking-tight text-gray-900">Your best</h2>
                {standings ? (
                    <ul className="flex flex-col gap-2">
                        {(Object.keys(gameModeDisplay) as MainGameModeName[]).map((mode) => {
                            const { label, icon: ModeIcon } = gameModeDisplay[mode];
                            const { score, rank, total } = standings[mode];
                            const topPercent = rank != null && total > 0
                                ? Math.max(1, Math.ceil((rank / total) * 100))
                                : null;
                            return (
                                <li key={mode} className={scoreCard}>
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-600">
                                            <ModeIcon size={20} aria-hidden="true" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-gray-900">{label}</span>
                                            <span
                                                className="block text-xs tabular-nums text-gray-500"
                                                title={rank != null ? `#${rank} of ${total}` : undefined}
                                            >
                                                {topPercent != null ? `Top ${topPercent}%` : 'Not played yet'}
                                            </span>
                                        </span>
                                        <span className="text-xl font-semibold tabular-nums text-gray-900">{score ?? '—'}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={`text-sm text-gray-500 ${scoreCard}`}>
                        {userLoggedIn ? 'Verify your email to track your best scores.' : 'Log in to track your best scores and world ranking.'}
                    </p>
                )}
            </section>
        );
    }

    function renderOtherModes(className: string) {
        return (
            <div className={className}>
                <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3 px-4 xl:grid-cols-2">
                    {/* Training lives in the left sidebar on wide screens. */}
                    <Link
                        href="/game/training"
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-gray-300 hover:bg-gray-100 xl:hidden"
                    >
                        <Dumbbell size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
                        <span className="min-w-0">
                            <span className="block text-xs font-semibold text-gray-500">Training</span>
                            <span className="mt-0.5 block truncate text-[0.6875rem] leading-4 text-gray-400">Weak spots</span>
                        </span>
                    </Link>
                    <Link
                        href="/custom"
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-gray-300 hover:bg-gray-100"
                    >
                        <SlidersHorizontal size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
                        <span className="min-w-0">
                            <span className="block text-xs font-semibold text-gray-500">Custom</span>
                            <span className="mt-0.5 block truncate text-[0.6875rem] leading-4 text-gray-400">Set your own rules</span>
                        </span>
                    </Link>
                    <Link
                        href="/otherGameModes"
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-gray-300 hover:bg-gray-100"
                    >
                        <Shapes size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
                        <span className="min-w-0">
                            <span className="block text-xs font-semibold text-gray-500">Other modes</span>
                            <span className="mt-0.5 block truncate text-[0.6875rem] leading-4 text-gray-400">More ways to play</span>
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section
            aria-busy={isStarting}
            className={`relative min-h-[900px] pb-14 transition-opacity duration-150 ease-out motion-reduce:transition-none md:min-h-[calc(100vh-9rem)] md:pb-12 ${
                isStarting ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
        >
                <div className="absolute left-0 right-0 top-[13%] xl:left-64 2xl:left-72">
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
                                            <span className="group/info relative inline-flex">
                                                <Info
                                                    size={11}
                                                    className="text-gray-300 transition-colors group-hover/info:text-gray-500"
                                                    aria-hidden="true"
                                                />
                                                <span
                                                    role="tooltip"
                                                    className={`invisible pointer-events-none absolute top-full z-30 mt-2 w-56 whitespace-pre-line rounded-md bg-gray-800 px-3 py-2 text-left text-[0.65rem] font-normal leading-4 text-gray-100 opacity-0 shadow-lg transition-opacity group-hover/info:visible group-hover/info:opacity-100 ${
                                                        mode === 'standard'
                                                            ? 'left-0'
                                                            : mode === 'hard'
                                                                ? 'right-0'
                                                                : 'left-1/2 -translate-x-1/2'
                                                    }`}
                                                >
                                                    {modeDetails.tooltip}
                                                </span>
                                            </span>
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
                    <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-3 px-4 md:gap-4 md:px-6 xl:pl-[17.5rem] 2xl:pl-[19.5rem]">
                        <span className="flex justify-self-end whitespace-nowrap text-3xl font-semibold tracking-tight text-gray-300 sm:text-4xl md:text-5xl">
                            <span className="inline-block w-36 text-center sm:w-44 md:w-56">
                                {selectedExample}
                            </span>
                            <span className="text-gray-900" aria-hidden="true">=</span>
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

                <div className="absolute left-0 right-0 top-[calc(40%+5rem)] xl:left-64 2xl:left-72">
                    <div className="flex justify-center">
                        <button
                            type="button"
                            disabled={isStarting}
                            onClick={() => void startGame(gameModeInput)}
                            className="group flex items-center justify-center gap-3 rounded-md bg-gray-900 px-10 py-3.5 text-sm font-semibold text-white transition hover:bg-black"
                        >
                            Start
                            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </button>
                    </div>

                </div>

                {/* Centered elements use xl:left-64 / 2xl:left-72 (the sidebar width) so they center in the space beside the sidebar. */}
                {/* Below xl: daily under Start. xl and up: one full-height sidebar fixed to the left edge, starting under the nav (z-50). */}
                {userLoggedIn && renderDailyCard(
                    'absolute left-1/2 top-[calc(40%+10.5rem)] w-full max-w-md -translate-x-1/2 px-4 xl:hidden'
                )}

                <aside aria-label="Daily, training and best scores" className={`left-0 border-r ${sidebarPanel}`}>
                    <div className="flex flex-col gap-3">
                        {renderDailySidebar()}
                        {renderTrainingSidebar()}
                    </div>
                    {renderTopScores()}
                </aside>

                {renderOtherModes(`absolute left-0 right-0 xl:top-auto xl:bottom-20 xl:left-64 2xl:left-72 ${
                    userLoggedIn ? 'top-[calc(40%+17.75rem)]' : 'top-[calc(40%+10.5rem)]'
                }`)}

            <footer className="absolute bottom-0 left-0 right-0 xl:left-64 2xl:left-72 flex justify-center gap-10 border-t border-gray-200 pt-5">
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