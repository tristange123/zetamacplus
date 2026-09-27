"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getRandomPitch,
    PITCHES,
    PITCH_GAME_DURATION,
    PITCH_GAME_RESULTS_KEY,
    playPianoPitch,
    type Pitch,
    type PitchAttempt,
    type PitchGameResults,
} from "@/lib/game/pitchGame";

function getTimestamp() {
    return Date.now();
}

export default function PitchGame() {
    const router = useRouter();
    const [currentPitch, setCurrentPitch] = useState<Pitch | null>(null);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(PITCH_GAME_DURATION);
    const [started, setStarted] = useState(false);
    const [audioError, setAudioError] = useState("");
    const [feedback, setFeedback] = useState<{ pitchName: string; correct: boolean } | null>(null);
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

        setFeedback({ pitchName: selected.name, correct });
        nextProblemTimeout.current = window.setTimeout(() => {
            presentProblem(currentPitch);
        }, 600);
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
                const results: PitchGameResults = {
                    score: scoreRef.current,
                    duration: PITCH_GAME_DURATION,
                    attempts: attempts.current,
                };
                localStorage.setItem(PITCH_GAME_RESULTS_KEY, JSON.stringify(results));
                router.replace("/results/pitch_game");
            }
        }, 100);

        return () => window.clearInterval(timer);
    }, [router, started]);

    useEffect(() => {
        return () => {
            if (nextProblemTimeout.current !== null) {
                window.clearTimeout(nextProblemTimeout.current);
            }
            void audioContext.current?.close();
        };
    }, []);

    return (
        <section className="relative flex min-h-[calc(100vh-9rem)] flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 mx-auto flex w-full max-w-6xl items-center justify-between pb-6 text-xs font-medium text-gray-500 md:px-6 md:text-sm">
                <p>Score: {score}</p>
                <p>Time: {Math.ceil(time)}</p>
            </div>

            <div className="absolute left-1/2 top-[42%] w-screen -translate-x-1/2 -translate-y-1/2 bg-gray-200 py-6 md:py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center px-4 md:px-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">
                        Which piano key did you hear?
                    </h2>
                    <button
                        type="button"
                        onClick={replayPitch}
                        className="mt-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Replay note
                    </button>
                    {audioError && <p className="mt-2 text-sm text-red-600">{audioError}</p>}

                    <div className="mt-6 grid w-full max-w-4xl grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12" aria-label="Piano key choices">
                        {PITCHES.map((pitch) => {
                            const pitchFeedback = feedback?.pitchName === pitch.name ? feedback : null;
                            const feedbackClasses = pitchFeedback
                                ? pitchFeedback.correct
                                    ? "border-green-500 bg-green-100 text-green-800"
                                    : "pitch-key-shake border-red-500 bg-red-100 text-red-800"
                                : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50";

                            return (
                                <button
                                    key={pitch.label}
                                    type="button"
                                    onClick={() => choosePitch(pitch)}
                                    disabled={feedback !== null}
                                    aria-label={`Choose ${pitch.label}`}
                                    className={`min-h-20 rounded-md border px-2 py-4 text-base font-semibold shadow-sm transition active:translate-y-0.5 disabled:cursor-default md:min-h-28 ${feedbackClasses}`}
                                >
                                    {pitch.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="absolute left-0 right-0 top-[calc(42%+13rem)] md:top-[calc(42%+15rem)]">
                <div className="mx-auto flex w-full max-w-6xl justify-center gap-3 px-4 pt-4 md:px-6">
                    <button
                        type="button"
                        onClick={startGame}
                        className="rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                    >
                        Restart
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Back
                    </button>
                </div>
            </div>
        </section>
    );
}
