import type { Server, Socket } from "socket.io";
import { type Problem } from "@/types/frontendTypes";
import {
    VERSUS_GAME_ID_LENGTH,
    isMainGameModeName,
    normalizeVersusGameId,
} from "@/lib/game/generateVersusGame";
import {
    attachSocket,
    clearRematchVote,
    createGame,
    deleteGame,
    findPlayer,
    getGame,
    joinGame,
    markPlayerFinished,
    markPlayerForfeit,
    rematchReadyUserIds,
    requestRematch,
    toResultsPayload,
} from "@/lib/versus/gameStore";
import { getVersusUserFromCookie } from "@/lib/versus/nodeSession";

type SocketUser = {
    userId: string,
    username: string,
    gameId?: string,
};

const RECONNECT_GRACE_MS = 15_000;
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

function socketUser(socket: Socket): SocketUser {
    return socket.data as SocketUser;
}

function timerKey(gameId: string, userId: string) {
    return `${gameId}:${userId}`;
}

function cancelForfeit(gameId: string, userId: string) {
    const key = timerKey(gameId, userId);
    const timer = disconnectTimers.get(key);
    if (timer) {
        clearTimeout(timer);
        disconnectTimers.delete(key);
    }
}

function publicPlayers(game: NonNullable<ReturnType<typeof getGame>>) {
    const players = [{ userId: game.host.userId, username: game.host.username }];
    if (game.guest) {
        players.push({ userId: game.guest.userId, username: game.guest.username });
    }
    return players;
}

function emitStart(io: Server, game: NonNullable<ReturnType<typeof getGame>>) {
    io.to(game.gameId).emit("game:start", {
        gameId: game.gameId,
        gameMode: game.gameMode,
        timeFormat: game.timeFormat,
        problems: game.problems,
        players: publicPlayers(game),
    });
}

function emitReplayUpdate(io: Server, game: NonNullable<ReturnType<typeof getGame>>) {
    io.to(game.gameId).emit("game:replayUpdate", {
        gameId: game.gameId,
        readyUserIds: rematchReadyUserIds(game),
    });
}

function notifyOpponentLeft(socket: Socket, gameId: string, userId: string, username: string) {
    socket.to(gameId).emit("game:opponentLeft", { userId, username });
}

function scheduleFinishedLeave(io: Server, gameId: string, userId: string, username: string) {
    cancelForfeit(gameId, userId);
    const timer = setTimeout(() => {
        disconnectTimers.delete(timerKey(gameId, userId));
        const game = getGame(gameId);
        if (!game || game.status !== "finished") return;
        const player = findPlayer(game, userId);
        if (!player || player.socketId) return;

        player.wantsRematch = false;
        io.to(game.gameId).emit("game:opponentLeft", { userId, username });
        emitReplayUpdate(io, game);
    }, RECONNECT_GRACE_MS);
    disconnectTimers.set(timerKey(gameId, userId), timer);
}

function schedulePlayingForfeit(io: Server, gameId: string, userId: string, username: string) {
    cancelForfeit(gameId, userId);
    const timer = setTimeout(() => {
        disconnectTimers.delete(timerKey(gameId, userId));
        const game = getGame(gameId);
        if (!game) return;
        const player = findPlayer(game, userId);
        if (!player || player.finished || player.socketId) return;

        const updated = markPlayerForfeit(gameId, userId);
        if (!updated) return;
        if (updated.status === "finished") {
            io.to(updated.gameId).emit("game:bothFinished", { gameId: updated.gameId });
        }
        else {
            io.to(updated.gameId).emit("game:playerFinished", { userId, username });
        }
    }, RECONNECT_GRACE_MS);
    disconnectTimers.set(timerKey(gameId, userId), timer);
}

export function attachVersusSockets(io: Server) {
    io.use(async (socket, next) => {
        try {
            const user = await getVersusUserFromCookie(socket.handshake.headers.cookie);
            if (!user) {
                next(new Error("Unauthorized"));
                return;
            }
            socket.data.userId = user.userId;
            socket.data.username = user.username;
            next();
        }
        catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.on("createGame", async (payload: { gameMode?: string } | undefined) => {
            const user = socketUser(socket);
            const gameMode = payload?.gameMode ?? "";
            if (!isMainGameModeName(gameMode)) {
                socket.emit("versus:error", { message: "Choose a valid game mode." });
                return;
            }

            const game = createGame(gameMode, {
                userId: user.userId,
                username: user.username,
                socketId: socket.id,
            });
            user.gameId = game.gameId;
            await socket.join(game.gameId);
            socket.emit("game:created", {
                gameId: game.gameId,
                gameMode: game.gameMode,
                timeFormat: game.timeFormat,
            });
        });

        socket.on("enterGame", async (payload: { gameId?: string } | undefined) => {
            const user = socketUser(socket);
            const gameId = normalizeVersusGameId(payload?.gameId ?? "");
            if (gameId.length !== VERSUS_GAME_ID_LENGTH) {
                socket.emit("versus:error", { message: "Enter a valid game code." });
                return;
            }

            const game = getGame(gameId);
            if (!game) {
                socket.emit("versus:error", { message: "Game not found." });
                return;
            }

            const existing = findPlayer(game, user.userId);
            if (existing) {
                cancelForfeit(game.gameId, user.userId);
                attachSocket(game, user.userId, socket.id);
                user.gameId = game.gameId;
                await socket.join(game.gameId);

                if (game.status === "waiting") {
                    socket.emit("game:waiting", {
                        gameId: game.gameId,
                        gameMode: game.gameMode,
                        timeFormat: game.timeFormat,
                    });
                    return;
                }

                if (game.status === "finished") {
                    socket.emit("game:bothFinished", {
                        gameId: game.gameId,
                        score: existing.score,
                    });
                    socket.emit("game:replayUpdate", {
                        gameId: game.gameId,
                        readyUserIds: rematchReadyUserIds(game),
                    });
                    return;
                }

                if (existing.finished) {
                    socket.emit("game:waitingForOpponent", {
                        gameId: game.gameId,
                        score: existing.score,
                    });
                    return;
                }

                socket.emit("game:start", {
                    gameId: game.gameId,
                    gameMode: game.gameMode,
                    timeFormat: game.timeFormat,
                    problems: game.problems,
                    players: publicPlayers(game),
                });
                return;
            }

            try {
                const joined = joinGame(gameId, {
                    userId: user.userId,
                    username: user.username,
                    socketId: socket.id,
                });
                user.gameId = joined.gameId;
                await socket.join(joined.gameId);
                emitStart(io, joined);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Could not join game.";
                socket.emit("versus:error", { message });
            }
        });

        socket.on("game:finished", (payload: {
            gameId?: string,
            score?: number,
            problemSet?: Problem[],
        } | undefined) => {
            const user = socketUser(socket);
            const gameId = normalizeVersusGameId(payload?.gameId ?? user.gameId ?? "");
            if (!gameId) {
                socket.emit("versus:error", { message: "Game not found." });
                return;
            }

            try {
                const game = markPlayerFinished(
                    gameId,
                    user.userId,
                    typeof payload?.score === "number" ? payload.score : 0,
                    Array.isArray(payload?.problemSet) ? payload.problemSet : [],
                );

                socket.to(game.gameId).emit("game:playerFinished", {
                    userId: user.userId,
                    username: user.username,
                });

                if (game.status === "finished") {
                    io.to(game.gameId).emit("game:bothFinished", { gameId: game.gameId });
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Could not save results.";
                socket.emit("versus:error", { message });
            }
        });

        socket.on("game:replay", (payload: { gameId?: string } | undefined) => {
            const user = socketUser(socket);
            const gameId = normalizeVersusGameId(payload?.gameId ?? user.gameId ?? "");
            if (!gameId) {
                socket.emit("versus:error", { message: "Game not found." });
                return;
            }

            try {
                const { game, started } = requestRematch(gameId, user.userId);
                if (started) {
                    cancelForfeit(game.gameId, game.host.userId);
                    if (game.guest) {
                        cancelForfeit(game.gameId, game.guest.userId);
                    }
                    emitStart(io, game);
                    return;
                }
                emitReplayUpdate(io, game);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Could not request rematch.";
                socket.emit("versus:error", { message });
            }
        });

        socket.on("results:get", (payload: { gameId?: string } | undefined) => {
            const user = socketUser(socket);
            const gameId = normalizeVersusGameId(payload?.gameId ?? "");
            const game = getGame(gameId);
            if (!game || !findPlayer(game, user.userId)) {
                socket.emit("versus:error", { message: "Results not found." });
                return;
            }
            socket.emit("results:data", toResultsPayload(game));
        });

        socket.on("leaveGame", () => {
            const user = socketUser(socket);
            if (!user.gameId) return;

            const gameId = user.gameId;
            const game = getGame(gameId);
            cancelForfeit(gameId, user.userId);

            if (game?.status === "waiting" && game.host.userId === user.userId) {
                deleteGame(game.gameId);
                user.gameId = undefined;
                void socket.leave(gameId);
                return;
            }

            const player = game ? findPlayer(game, user.userId) : null;
            if (game && player?.finished) {
                clearRematchVote(game.gameId, user.userId);
                notifyOpponentLeft(socket, game.gameId, user.userId, user.username);
                user.gameId = undefined;
                void socket.leave(gameId);
                return;
            }

            const updated = markPlayerForfeit(gameId, user.userId);
            if (updated?.status === "finished") {
                io.to(updated.gameId).emit("game:bothFinished", { gameId: updated.gameId });
            }
            else if (updated?.status === "playing") {
                socket.to(updated.gameId).emit("game:playerFinished", {
                    userId: user.userId,
                    username: user.username,
                });
            }
            user.gameId = undefined;
            void socket.leave(gameId);
        });

        socket.on("disconnect", () => {
            const user = socketUser(socket);
            if (!user.gameId) return;

            const game = getGame(user.gameId);
            if (!game) return;

            const player = findPlayer(game, user.userId);
            if (player && player.socketId === socket.id) {
                player.socketId = null;
            }

            if (game.status === "waiting") {
                return;
            }

            if (game.status === "finished") {
                scheduleFinishedLeave(io, game.gameId, user.userId, user.username);
                return;
            }

            if (player && !player.finished) {
                schedulePlayingForfeit(io, game.gameId, user.userId, user.username);
            }
        });
    });
}
