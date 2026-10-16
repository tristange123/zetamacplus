"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ArrowRight,
    Calculator,
    Rabbit,
    Skull,
    SportShoe,
    Swords,
    type LucideIcon,
} from "lucide-react";
import { type MainGameModeName } from "@/types/frontendTypes";
import { normalizeVersusGameId, VERSUS_GAME_ID_LENGTH } from "@/lib/game/generateVersusGame";

type GameModeDisplay = {
    label: string,
    subtitle: string,
    gameMode: MainGameModeName,
    icon: LucideIcon,
};

const GAME_MODE_DISPLAY: GameModeDisplay[] = [
    { label: "Standard", subtitle: "2 min", gameMode: "standard", icon: Calculator },
    { label: "Rapid", subtitle: "1 min", gameMode: "rapid", icon: Rabbit },
    { label: "Sprint", subtitle: "10 sec", gameMode: "sprint", icon: SportShoe },
    { label: "Hard", subtitle: "3 min", gameMode: "hard", icon: Skull },
];

export default function VersusMenuClient() {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<MainGameModeName>("standard");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);

    async function createGame() {
        setError("");
        setCreating(true);
        try {
            const response = await fetch("/api/versus/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameMode: selectedMode }),
            });
            const payload = await response.json() as { gameId?: string, error?: string };
            if (!response.ok || !payload.gameId) {
                throw new Error(payload.error ?? "Could not create game.");
            }
            router.push(`/game/versus?code=${payload.gameId}`);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Could not create game.");
            setCreating(false);
        }
    }

    function joinGame() {
        const gameId = normalizeVersusGameId(joinCode);
        if (gameId.length !== VERSUS_GAME_ID_LENGTH) {
            setError(`Enter a ${VERSUS_GAME_ID_LENGTH}-character game code.`);
            return;
        }
        setError("");
        router.push(`/game/versus?code=${gameId}`);
    }

    return (
        <section className="relative min-h-[900px] pb-14 md:min-h-[calc(100vh-9rem)] md:pb-12">
            <Swords
                className="pointer-events-none absolute left-1/2 top-[40%] h-auto w-[min(82vw,36rem)] -translate-x-1/2 -translate-y-1/2 text-gray-300/35"
                strokeWidth={0.7}
                aria-hidden="true"
            />

            <div className="absolute left-0 right-0 top-[8%] z-10">
                <div className="mx-auto w-full max-w-3xl px-3 md:px-6">
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {GAME_MODE_DISPLAY.map((mode) => {
                            const isSelected = selectedMode === mode.gameMode;
                            const ModeIcon = mode.icon;
                            return (
                                <button
                                    key={mode.gameMode}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => setSelectedMode(mode.gameMode)}
                                    className={`relative flex min-h-28 items-center justify-center gap-4 rounded-lg border px-4 py-5 text-left transition ${
                                        isSelected
                                            ? "border-gray-400 bg-gray-200 text-gray-900"
                                            : "border-gray-200 bg-gray-100/60 text-gray-500 hover:border-gray-400 hover:bg-gray-200/70 hover:text-gray-700"
                                    }`}
                                >
                                    <ModeIcon
                                        size={22}
                                        className={isSelected ? "text-gray-700" : "text-gray-400"}
                                        aria-hidden="true"
                                    />
                                    <span>
                                        <span className="block text-base font-semibold sm:text-lg">{mode.label}</span>
                                        <span className={`mt-1 block text-xs ${
                                            isSelected ? "text-gray-600" : "text-gray-400"
                                        }`}>
                                            {mode.subtitle}
                                        </span>
                                    </span>
                                    {isSelected && (
                                        <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-gray-800" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={() => void createGame()}
                            disabled={creating}
                            className="group flex min-w-40 items-center justify-center gap-3 rounded-md bg-gray-900 px-10 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60"
                        >
                            {creating ? "Creating…" : "Start"}
                            {!creating && (
                                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            )}
                        </button>
                    </div>

                    <div className="mt-10">
                    <div className="flex items-center gap-4">
                        <span className="h-px flex-1 bg-gray-200" />
                        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Join a game</h2>
                        <span className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <label htmlFor="versus-join-code" className="sr-only">Game code</label>
                        <input
                            id="versus-join-code"
                            value={joinCode}
                            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") joinGame();
                            }}
                            maxLength={VERSUS_GAME_ID_LENGTH}
                            placeholder="ABC123"
                            className="w-full max-w-52 rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-lg tracking-[0.3em] text-gray-800 shadow-sm outline-none transition placeholder:text-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-300 sm:w-52"
                        />
                        <button
                            type="button"
                            onClick={joinGame}
                            className="w-full max-w-52 rounded-md border border-gray-300 bg-transparent px-7 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-gray-500 hover:bg-gray-200 sm:w-auto"
                        >
                            Join match
                        </button>
                    </div>
                    </div>
                </div>

                {error && (
                    <p role="alert" className="mt-5 text-center text-sm text-red-600">{error}</p>
                )}
            </div>
        </section>
    );
}
