"use client"

import { useEffect, useRef, useState } from 'react';
import { type Problem } from '@/types/frontendTypes'
import { type ProblemSource } from '@/lib/game/generateProblem'

export type GameResult = {
    score: number,
    timeFormat: number,
    problems: Problem[],
}

type TimedGameOptions = {
    timeFormat: number,
    nextProblem: ProblemSource,
    onFinish?: (result: GameResult) => void,
}

export function useTimedGame({timeFormat, nextProblem, onFinish}: TimedGameOptions) {
    const [currProblem, setCurrProblem] = useState<Problem>();
    const [display, setDisplay] = useState('');
    const [inputKey, setInputKey] = useState(0);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(timeFormat);
    const [result, setResult] = useState<GameResult | null>(null);
    // Bumped on every (re)start so the timer effect restarts
    const [round, setRound] = useState(0);

    const startTime = useRef(0);
    const lastSolveElapsed = useRef(0);
    const pastProblems = useRef<Problem[]>([]);
    const onFinishRef = useRef(onFinish);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    function start() {
        startTime.current = Date.now();
        lastSolveElapsed.current = 0;
        pastProblems.current = [];
        setScore(0);
        setDisplay('');
        setTime(timeFormat);
        setResult(null);
        setInputKey((k) => k + 1);
        setCurrProblem(nextProblem(0));
        setRound((r) => r + 1);
    }

    // Start once on mount. Problems are random, so generate them on the client only.
    useEffect(() => {
        const startTimeout = window.setTimeout(start, 0);
        return () => window.clearTimeout(startTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // timer logic
    useEffect(() => {
        if (round === 0) return;

        const timeId = window.setInterval(() => {
            const elapsed = (Date.now() - startTime.current) / 1000;
            const remaining = Math.max(timeFormat - elapsed, 0);
            setTime(remaining);

            if (remaining === 0) {
                window.clearInterval(timeId);
                const gameResult = {
                    score: pastProblems.current.length,
                    timeFormat,
                    problems: pastProblems.current,
                };
                setResult(gameResult);
                onFinishRef.current?.(gameResult);
            }
        }, 100);
        return () => window.clearInterval(timeId);
    }, [round, timeFormat]);

    function checkValue(val: string) {
        setDisplay(val);
        if (!currProblem || result || Number(val) !== currProblem.answer) return;

        const elapsed = Math.min((Date.now() - startTime.current) / 1000, timeFormat);
        const orderNumber = pastProblems.current.length;
        pastProblems.current.push({
            ...currProblem,
            solveTime: elapsed - lastSolveElapsed.current,
            orderNumber,
        });
        lastSolveElapsed.current = elapsed;

        setScore(orderNumber + 1);
        setDisplay('');
        setCurrProblem(nextProblem(orderNumber + 1));
    }

    return {
        currProblem,
        display,
        inputKey,
        score,
        time,
        result,
        checkValue,
        restart: start,
    };
}

export type TimedGame = ReturnType<typeof useTimedGame>;
