"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getRandomPitch,
    PITCHES,
    PITCH_GAME_DURATION,
    playPianoPitch,
    type Pitch,
    type PitchAttempt,
    type PitchGameResults,
} from "@/lib/game/pitchGame";
import PitchResults from "./pitchResults";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import { useGameContext } from "@/app/gameContext";

function getTimestamp() {
    return Date.now();
}

export default function PitchGame() {
    const router = useRouter();
    const { showScore, showTimer } = useGameContext();
    const [currentPitch, setCurrentPitch] = useState<Pitch | null>(null);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(PITCH_GAME_DURATION);
    const [started, setStarted] = useState(false);
    const [audioError, setAudioError] = useState("");
    const [results, setResults] = useState<PitchGameResults | null>(null);
    const [feedback, setFeedback] = useState<{ pitchName: string; correctName: string; correct: boolean } | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const nextProblemTimeout = useRef<number | null>(null);
    const startedAt = useRef(0);
    const problemStartedAt = useRef(0);
    const attempts = useRef<PitchAttempt[]>([]);
    const scoreRef = useRef(0);
    const finished = useRef(false);
    const answerLocked = useRef(false);

    function getAudioContext() {
        if (!audioContext.current || audioContext.current.state === "closed") {
            audioContext.current = new AudioContext();
        }
        return audioContext.current;
    }

    function presentProblem(previous?: Pitch) {
        if (finished.current) return;

        const nextPitch = getRandomPitch(previous);
        answerLocked.current = false;
        setFeedback(null);
        setCurrentPitch(nextPitch);
        problemStartedAt.current = getTimestamp();
        setAudioError("");
        void playPianoPitch(getAudioContext(), nextPitch).catch(() => {
            setAudioError("Sound could not be played. Check your browser audio settings.");
        });
    }

    function startGame() {
        if (nextProblemTimeout.current !== null) {
            window.clearTimeout(nextProblemTimeout.current);
        }
        attempts.current = [];
        scoreRef.current = 0;
        finished.current = false;
        answerLocked.current = false;
        startedAt.current = getTimestamp();
        problemStartedAt.current = startedAt.current;
        setScore(0);
        setTime(PITCH_GAME_DURATION);
        setResults(null);
        setStarted(true);
        presentProblem();
    }

    function choosePitch(selected: Pitch) {
        if (!currentPitch || finished.current || answerLocked.current) return;

        answerLocked.current = true;
        const now = getTimestamp();
        const correct = selected.name === currentPitch.name;
        const attempt: PitchAttempt = {
            expected: currentPitch.label,
            selected: selected.label,
            correct,
            solveTime: (now - problemStartedAt.current) / 1000,
            elapsedTime: Math.min((now - startedAt.current) / 1000, PITCH_GAME_DURATION),
            orderNumber: attempts.current.length,
        };
        attempts.current.push(attempt);

        if (correct) {
            scoreRef.current += 1;
            setScore(scoreRef.current);
        }

        setFeedback({ pitchName: selected.name, correctName: currentPitch.name, correct });
        // Linger on a miss so the correct key can be seen.
        nextProblemTimeout.current = window.setTimeout(() => {
            presentProblem(currentPitch);
        }, correct ? 600 : 1200);
    }

    function replayPitch() {
        if (!currentPitch) return;
        setAudioError("");
        void playPianoPitch(getAudioContext(), currentPitch).catch(() => {
            setAudioError("Sound could not be played. Check your browser audio settings.");
        });
    }

    useEffect(() => {
        const startTimeout = window.setTimeout(startGame, 0);
        return () => window.clearTimeout(startTimeout);
        // Start the game once when this page mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!started) return;

        const timer = window.setInterval(() => {
            const elapsed = (Date.now() - startedAt.current) / 1000;
            const remaining = Math.max(PITCH_GAME_DURATION - elapsed, 0);
            setTime(remaining);

            if (remaining === 0 && !finished.current) {
                finished.current = true;
                answerLocked.current = true;
                if (nextProblemTimeout.current !== null) {
                    window.clearTimeout(nextProblemTimeout.current);
                }
                setResults({
                    score: scoreRef.current,
                    duration: PITCH_GAME_DURATION,
                    attempts: attempts.current,
                });
            }
        }, 100);

        return () => window.clearInterval(timer);
    }, [started]);

    useEffect(() => {
        return () => {
            if (nextProblemTimeout.current !== null) {
                window.clearTimeout(nextProblemTimeout.current);
            }
            void audioContext.current?.close();
        };
    }, []);

    if (results) {
        return <PitchResults results={results} onRestart={startGame} />;
    }

    return (
        <section className="game-screen-enter relative flex min-h-[calc(100vh-9rem)] flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 mx-auto flex w-full max-w-6xl items-center justify-between pb-6 text-xs font-medium text-gray-500 md:px-6 md:text-sm">
                {showScore ? <p>Score: {score}</p> : <span />}
                {showTimer ? <p>Time: {Math.ceil(time)}</p> : <span />}
            </div>

            <div className="absolute left-1/2 top-[40%] w-screen -translate-x-1/2 -translate-y-1/2 bg-gray-200 py-6 md:py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-semibold tracking-tight text-gray-800 sm:text-4xl">
                            Which note?
                        </h2>
                        <button
                            type="button"
                            onClick={replayPitch}
                            aria-label="Replay note"
                            title="Replay note"
                            className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 shadow-sm transition hover:border-gray-500 hover:text-gray-800"
                        >
                            <Volume2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="grid w-full max-w-4xl grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12" aria-label="Piano key choices">
                        {PITCHES.map((pitch) => {
                            const isSelected = feedback?.pitchName === pitch.name;
                            const isCorrect = feedback?.correctName === pitch.name;
                            const feedbackClasses = !feedback
                                ? "border-gray-300 bg-white text-gray-800 hover:border-gray-500"
                                : isCorrect && feedback.correct
                                    ? "border-green-500 bg-green-100 text-green-800"
                                    : isCorrect
                                        // Missed: the right key shakes and goes bold.
                                        ? "pitch-key-shake border-green-600 bg-green-100 text-green-900 font-black! ring-2 ring-green-500"
                                        : isSelected
                                            ? "border-red-500 bg-red-100 text-red-800"
                                            : "border-gray-300 bg-white text-gray-400";

                            return (
                                <button
                                    key={pitch.label}
                                    type="button"
                                    onClick={() => choosePitch(pitch)}
                                    disabled={feedback !== null}
                                    aria-label={`Choose ${pitch.label}`}
                                    className={`h-14 rounded-md border text-lg font-semibold shadow-sm transition active:translate-y-0.5 disabled:cursor-default md:h-16 ${feedbackClasses}`}
                                >
                                    {pitch.name}
                                </button>
                            );
                        })}
                    </div>
                    {audioError && <p className="text-sm text-red-600">{audioError}</p>}
                </div>
            </div>

            <div className="absolute left-0 right-0 top-[calc(40%+10rem)] sm:top-[calc(40%+8rem)] md:top-[calc(40%+7rem)]">
                <div className="mx-auto flex w-full max-w-6xl justify-center gap-10 px-4 pt-4 md:px-6">
                    <button
                        type="button"
                        onClick={startGame}
                        aria-label="Restart"
                        title="Restart"
                        className="p-1 text-gray-300 transition hover:text-gray-500"
                    >
                        <RotateCcw className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        aria-label="Back"
                        title="Back"
                        className="p-1 text-gray-300 transition hover:text-gray-500"
                    >
                        <ArrowLeft className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}
