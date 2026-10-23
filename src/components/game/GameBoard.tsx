"use client"

import { useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useGameContext } from '@/app/gameContext'
import OnScreenKeyboard from './OnScreenKeyboard'
import { type TimedGame } from './useTimedGame'

type GameBoardProps = {
    game: TimedGame,
    // Omitted for games that can't be restarted or left mid-game (daily)
    onRestart?: () => void,
    onBack?: () => void,
}

export default function GameBoard({game, onRestart, onBack}: GameBoardProps) {
    const {showScore, showTimer, showKeyboard} = useGameContext();
    const {currProblem, display, inputKey, score, time, checkValue} = game;
    const inputRef = useRef<HTMLInputElement>(null);

    function pressKeyboardDigit(digit: string){
        checkValue(display + digit);
        inputRef.current?.focus();
    }

    function pressKeyboardBackspace(){
        checkValue(display.slice(0, -1));
        inputRef.current?.focus();
    }

    function restart() {
        onRestart?.();
        inputRef.current?.focus();
    }

    return (
        <section className="game-screen-enter relative flex min-h-[calc(100vh-9rem)] flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 mx-auto flex w-full max-w-6xl items-center justify-between pb-6 text-xs font-medium text-gray-500 md:px-6 md:text-sm">
                {showScore ? <p>Score: {score}</p> : <span />}
                {showTimer ? <p>Time: {Math.ceil(time)}</p> : <span />}
            </div>

            <div className="contents">
                <div className="absolute left-1/2 top-[40%] w-screen -translate-x-1/2 -translate-y-1/2 bg-gray-200 py-6 md:py-8">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-3 px-4 md:gap-4 md:px-6">
                        <h2 className="justify-self-end whitespace-nowrap text-3xl font-semibold tracking-tight text-gray-800 sm:text-4xl md:text-5xl">
                            {currProblem?.statement}
                        </h2>
                        <label htmlFor="game-answer" className="sr-only">
                            Game answer
                        </label>
                        <input
                            id="game-answer"
                            key={inputKey}
                            ref={inputRef}
                            autoFocus
                            type="number"
                            value={display}
                            onChange={(e) => checkValue(e.target.value)}
                            className="w-28 justify-self-start rounded-md border border-gray-300 bg-white px-3 py-3 text-center text-2xl text-gray-800 shadow-sm outline-none transition [appearance:textfield] focus:border-gray-500 focus:ring-2 focus:ring-gray-300 sm:w-36 md:w-48 md:px-4 md:text-[1.6875rem] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <div className="absolute left-0 right-0 top-[calc(40%+6rem)]">
                <div className="mx-auto flex w-full max-w-6xl justify-center gap-10 px-4 pt-4 md:px-6">
                    {onRestart && (
                        <button
                            onClick={restart}
                            aria-label="Restart"
                            title="Restart"
                            className="p-1 text-gray-300 transition hover:text-gray-500"
                        >
                            <RotateCcw className="h-6 w-6" aria-hidden="true" />
                        </button>
                    )}
                    {onBack && (
                        <button
                            onClick={onBack}
                            aria-label="Back"
                            title="Back"
                            className="p-1 text-gray-300 transition hover:text-gray-500"
                        >
                            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
                        </button>
                    )}
                </div>

                {showKeyboard && (
                    <OnScreenKeyboard
                        onDigit={pressKeyboardDigit}
                        onBackspace={pressKeyboardBackspace}
                    />
                )}
                </div>
            </div>
        </section>
    );
}
