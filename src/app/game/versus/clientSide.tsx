"use client";

import { type Problem } from "@/types/frontendTypes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useGameContext } from "@/app/gameContext";
import OnScreenKeyboard from "../onScreenKeyboard";

type VersusPhase = "connecting" | "waiting" | "playing" | "waitingForOpponent" | "error";

type PublicPlayer = {
    userId: string,
    username: string,
};

export default function VersusGameClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const context = useGameContext();
    const { showScore, showTimer, showKeyboard } = context;

    const [phase, setPhase] = useState<VersusPhase>("connecting");
    const [error, setError] = useState("");
    const [gameId, setGameId] = useState(searchParams.get("code")?.toUpperCase() ?? "");
    const [timeFormat, setTimeFormat] = useState(120);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [players, setPlayers] = useState<PublicPlayer[]>([]);
    const [copied, setCopied] = useState(false);

    const [currProblem, setCurrProblem] = useState<Problem>();
    const [display, setDisplay] = useState("");
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(120);
    const startTime = useRef(0);
    const solveTimes = useRef<number[]>([]);
    const pastProblems = useRef<Problem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const finishedRef = useRef(false);
    const scoreRef = useRef(0);

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            setError("Missing game code.");
            setPhase("error");
            return;
        }

        const socket = io({
            path: "/socket.io",
            withCredentials: true,
        });
        socketRef.current = socket;

        socket.on("connect_error", (err) => {
            setError(err.message || "Could not connect.");
            setPhase("error");
        });

        socket.on("versus:error", (payload: { message?: string }) => {
            setError(payload.message ?? "Something went wrong.");
            setPhase("error");
        });

        socket.on("game:created", (payload: { gameId: string, timeFormat: number }) => {
            setGameId(payload.gameId);
            setTimeFormat(payload.timeFormat);
            setTime(payload.timeFormat);
            setPhase("waiting");
        });

        socket.on("game:waiting", (payload: { gameId: string, timeFormat: number }) => {
            setGameId(payload.gameId);
            setTimeFormat(payload.timeFormat);
            setTime(payload.timeFormat);
            setPhase("waiting");
        });

        socket.on("game:start", (payload: {
            gameId: string,
            timeFormat: number,
            problems: Problem[],
            players: PublicPlayer[],
        }) => {
            setGameId(payload.gameId);
            setTimeFormat(payload.timeFormat);
            setTime(payload.timeFormat);
            setProblems(payload.problems);
            setPlayers(payload.players);
            setCurrProblem(payload.problems[0]);
            setScore(0);
            scoreRef.current = 0;
            setDisplay("");
            pastProblems.current = [];
            solveTimes.current = [];
            finishedRef.current = false;
            startTime.current = Date.now();
            setPhase("playing");
        });

        socket.on("game:playerFinished", () => {
            // Opponent finished first; local game continues until the timer ends.
        });

        socket.on("game:bothFinished", (payload: { gameId: string }) => {
            router.replace(`/results/${payload.gameId}`);
        });

        socket.on("connect", () => {
            socket.emit("enterGame", { gameId: code });
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [router, searchParams]);

    useEffect(() => {
        if (phase !== "playing") return;

        const timeId = setInterval(() => {
            const elapsed = (Date.now() - startTime.current) / 1000;
            setTime(Math.max(timeFormat - elapsed, 0));
        }, 100);

        return () => {
            clearInterval(timeId);
        };
    }, [phase, timeFormat]);

    useEffect(() => {
        if (phase !== "playing" || time > 0 || finishedRef.current) return;

        finishedRef.current = true;
        setPhase("waitingForOpponent");
        socketRef.current?.emit("game:finished", {
            gameId,
            score: scoreRef.current,
            problemSet: pastProblems.current,
        });
    }, [phase, time, gameId]);

    function checkDisplay(event: React.ChangeEvent<HTMLInputElement>, answer: number) {
        checkValue(event.target.value, answer);
    }

    function checkValue(val: string, answer: number) {
        setDisplay(val);
        if (Number(val) !== answer || !currProblem) return;

        let timeSpent;
        if (solveTimes.current.length === 0) {
            timeSpent = timeFormat - time;
        }
        else {
            timeSpent = solveTimes.current[solveTimes.current.length - 1] - time;
        }

        const currProblemTimed = currProblem;
        currProblemTimed.solveTime = timeSpent;
        currProblemTimed.orderNumber = score;
        pastProblems.current.push(currProblemTimed);
        solveTimes.current.push(time);

        const nextScore = score + 1;
        scoreRef.current = nextScore;
        setScore(nextScore);
        setDisplay("");
        setCurrProblem(problems[nextScore]);
    }

    function pressKeyboardDigit(digit: string) {
        checkValue(display + digit, currProblem?.answer ?? 999);
        inputRef.current?.focus();
    }

    function pressKeyboardBackspace() {
        checkValue(display.slice(0, -1), currProblem?.answer ?? 999);
        inputRef.current?.focus();
    }

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(gameId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch {
            setCopied(false);
        }
    }

    function leave() {
        socketRef.current?.emit("leaveGame");
        router.push("/versusMenu");
    }

    if (phase === "error") {
        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Versus</h1>
                    <p className="mt-2 text-sm text-gray-600">{error}</p>
                    <div className="mt-5">
                        <button
                            type="button"
                            onClick={() => router.push("/versusMenu")}
                            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (phase === "connecting" || phase === "waiting") {
        const opponentName = players.find((player) => player.username)?.username;
        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Waiting for opponent</h1>
                    <p className="mt-2 text-sm text-gray-500">Share this code. The match starts when they join.</p>
                    <p className="mt-6 font-mono text-4xl tracking-[0.35em] text-gray-800 md:text-5xl">
                        {gameId || "------"}
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => void copyCode()}
                            className="rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                        >
                            {copied ? "Copied" : "Copy code"}
                        </button>
                        <button
                            type="button"
                            onClick={leave}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            Back
                        </button>
                    </div>
                    {opponentName && (
                        <p className="mt-4 text-sm text-gray-500">Starting match with {opponentName}...</p>
                    )}
                </div>
            </section>
        );
    }

    if (phase === "waitingForOpponent") {
        return (
            <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Score: {score}</h1>
                    <p className="mt-2 text-sm text-gray-600">Waiting for your opponent to finish...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative flex min-h-[calc(100vh-9rem)] flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 mx-auto flex w-full max-w-6xl items-center justify-between pb-6 text-xs font-medium text-gray-500 md:px-6 md:text-sm">
                {showScore ? <p>Score: {score}</p> : <span />}
                {showTimer ? <p>Time: {Math.ceil(time)}</p> : <span />}
            </div>

            <div className="contents">
                <div className="absolute left-1/2 top-[40%] w-screen -translate-x-1/2 -translate-y-1/2 bg-gray-200 py-6 md:py-8">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 md:gap-4 md:px-6">
                        <h2 className="text-4xl font-semibold tracking-tight text-gray-800 md:text-5xl">
                            {currProblem?.statement}
                        </h2>
                        <label htmlFor="versus-game-answer" className="sr-only">
                            Game answer
                        </label>
                        <input
                            id="versus-game-answer"
                            ref={inputRef}
                            autoFocus
                            type="number"
                            value={display}
                            onChange={(event) => checkDisplay(event, currProblem?.answer ?? 999)}
                            className="w-36 rounded-md border border-gray-300 bg-white px-3 py-3 text-center text-2xl text-gray-800 shadow-sm outline-none transition [appearance:textfield] focus:border-gray-500 focus:ring-2 focus:ring-gray-300 md:w-48 md:px-4 md:text-[1.6875rem] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                <div className="absolute left-0 right-0 top-[calc(40%+4rem)]">
                    <div className="mx-auto flex w-full max-w-6xl justify-center gap-3 px-4 pt-4 md:px-6">
                        <button
                            type="button"
                            onClick={leave}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            Back
                        </button>
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
