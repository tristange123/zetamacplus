"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Calculator,
    Rabbit,
    Skull,
    SportShoe,
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
    { label: "Standard", subtitle: "120 secs", gameMode: "standard", icon: Calculator },
    { label: "Rapid", subtitle: "60 secs", gameMode: "rapid", icon: Rabbit },
    { label: "Sprint", subtitle: "10 secs", gameMode: "sprint", icon: SportShoe },
    { label: "Hard", subtitle: "180 secs", gameMode: "hard", icon: Skull },
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
        <section className="flex min-h-[calc(100vh-11rem)] flex-col items-center justify-start pb-2 md:min-h-[calc(100vh-9rem)]">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm md:p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-3xl">Versus</h1>
                    <p className="mt-2 text-sm text-gray-500">Create a match or join with a friend&apos;s code.</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
                    <h2 className="text-lg font-semibold text-gray-800">Create a game</h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {GAME_MODE_DISPLAY.map((mode) => {
                            const isSelected = selectedMode === mode.gameMode;
                            const ModeIcon = mode.icon;
                            return (
                                <button
                                    key={mode.gameMode}
                                    type="button"
                                    onClick={() => setSelectedMode(mode.gameMode)}
                                    className={`flex min-h-24 w-full flex-col items-center justify-center rounded-xl border px-4 py-5 text-center transition ${
                                        isSelected
                                            ? "border-gray-300 bg-gray-200 text-gray-800 shadow-sm"
                                            : "border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-gray-300 hover:shadow"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold">{mode.label}</span>
                                        <ModeIcon
                                            size={22}
                                            className={isSelected ? "text-gray-600" : "text-gray-500"}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <span className={`mt-2 text-sm ${isSelected ? "text-gray-600" : "text-gray-500"}`}>
                                        {mode.subtitle}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-5 flex justify-center">
                        <button
                            type="button"
                            onClick={() => void createGame()}
                            disabled={creating}
                            className="rounded-lg bg-gray-800 px-10 py-3 text-base font-semibold text-gray-100 shadow-sm transition hover:bg-gray-900 disabled:cursor-wait disabled:opacity-70"
                        >
                            {creating ? "Creating..." : "Create"}
                        </button>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 md:p-6">
                    <h2 className="text-lg font-semibold text-gray-800">Join a game</h2>
                    <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
                            className="w-full max-w-48 rounded-md border border-gray-300 bg-white px-3 py-3 text-center text-lg tracking-[0.3em] text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300 sm:w-48"
                        />
                        <button
                            type="button"
                            onClick={joinGame}
                            className="rounded-md border border-gray-300 bg-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                        >
                            Join
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="mt-4 text-center text-sm text-red-600">{error}</p>
                )}
            </div>
        </section>
    );
}
