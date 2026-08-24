import { type MainGameModeName, type Problem } from "@/types/frontendTypes";
import {
    type VersusGame,
    type VersusPlayerResult,
    type VersusPlayerState,
    type VersusResultsPayload,
} from "@/types/versusTypes";
import { generateVersusGame, generateVersusGameId } from "@/lib/game/generateVersusGame";

const GAME_TTL_MS = 2 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

const games = new Map<string, VersusGame>();

if (typeof setInterval === "function") {
    const cleanupTimer = setInterval(() => {
        const cutoff = Date.now() - GAME_TTL_MS;
        for (const [gameId, game] of games) {
            if (game.createdAt < cutoff) {
                games.delete(gameId);
            }
        }
    }, CLEANUP_INTERVAL_MS);
    cleanupTimer.unref?.();
}

function emptyPlayer(userId: string, username: string, socketId: string | null): VersusPlayerState {
    return {
        userId,
        username,
        socketId,
        score: 0,
        problemSet: [],
        finished: false,
    };
}

export function createGame(
    gameMode: MainGameModeName,
    host: { userId: string, username: string, socketId: string | null },
): VersusGame {
    let generated = generateVersusGame(gameMode);
    while (games.has(generated.gameId)) {
        generated = {
            ...generated,
            gameId: generateVersusGameId(),
        };
    }

    const game: VersusGame = {
        gameId: generated.gameId,
        gameMode: generated.gameMode,
        timeFormat: generated.timeFormat,
        problems: generated.problems,
        host: emptyPlayer(host.userId, host.username, host.socketId),
        guest: null,
        status: "waiting",
        createdAt: Date.now(),
    };
    games.set(game.gameId, game);
    return game;
}

export function getGame(gameId: string): VersusGame | undefined {
    return games.get(gameId);
}

export function deleteGame(gameId: string): void {
    games.delete(gameId);
}

export function findPlayer(game: VersusGame, userId: string): VersusPlayerState | null {
    if (game.host.userId === userId) return game.host;
    if (game.guest?.userId === userId) return game.guest;
    return null;
}

export function attachSocket(game: VersusGame, userId: string, socketId: string): void {
    const player = findPlayer(game, userId);
    if (player) {
        player.socketId = socketId;
    }
}

export function joinGame(
    gameId: string,
    guest: { userId: string, username: string, socketId: string },
): VersusGame {
    const game = games.get(gameId);
    if (!game) {
        throw new Error("Game not found");
    }
    if (game.status !== "waiting" || game.guest) {
        throw new Error("Game is no longer open");
    }
    if (game.host.userId === guest.userId) {
        throw new Error("You cannot join your own game");
    }

    game.guest = emptyPlayer(guest.userId, guest.username, guest.socketId);
    game.status = "playing";
    return game;
}

export function markPlayerFinished(
    gameId: string,
    userId: string,
    score: number,
    problemSet: Problem[],
): VersusGame {
    const game = games.get(gameId);
    if (!game) {
        throw new Error("Game not found");
    }
    if (game.status === "waiting") {
        throw new Error("Game has not started");
    }

    const player = findPlayer(game, userId);
    if (!player) {
        throw new Error("You are not in this game");
    }
    if (player.finished) {
        return game;
    }

    const cappedSet = problemSet.slice(0, game.problems.length);
    player.score = Math.max(0, Math.min(score, cappedSet.length));
    player.problemSet = cappedSet;
    player.finished = true;

    if (game.host.finished && game.guest?.finished) {
        game.status = "finished";
    }

    return game;
}

export function markPlayerForfeit(gameId: string, userId: string): VersusGame | null {
    const game = games.get(gameId);
    if (!game) return null;

    if (game.status === "waiting") {
        if (game.host.userId === userId) {
            games.delete(gameId);
            return null;
        }
        return game;
    }

    const player = findPlayer(game, userId);
    if (!player || player.finished) {
        return game;
    }

    player.finished = true;
    player.score = player.score || 0;
    player.problemSet = player.problemSet ?? [];

    if (game.host.finished && game.guest?.finished) {
        game.status = "finished";
    }
    return game;
}

function toPlayerResult(player: VersusPlayerState): VersusPlayerResult {
    return {
        userId: player.userId,
        username: player.username,
        score: player.score,
        problemSet: player.problemSet,
        finished: player.finished,
    };
}

export function toResultsPayload(game: VersusGame): VersusResultsPayload {
    const players = [toPlayerResult(game.host)];
    if (game.guest) {
        players.push(toPlayerResult(game.guest));
    }
    return {
        gameId: game.gameId,
        gameMode: game.gameMode,
        timeFormat: game.timeFormat,
        status: game.status,
        players,
    };
}
