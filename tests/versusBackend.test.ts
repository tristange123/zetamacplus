import assert from "node:assert/strict";
import test from "node:test";
import {
    createGame,
    deleteGame,
    findPlayer,
    joinGame,
    markPlayerFinished,
    markPlayerForfeit,
    rematchReadyUserIds,
    requestRematch,
    toResultsPayload,
} from "@/lib/versus/gameStore";

test("versus backend supports a complete match and rematch lifecycle", () => {
    const host = { userId: "host-id", username: "Host", socketId: "host-socket" };
    const guest = { userId: "guest-id", username: "Guest", socketId: "guest-socket" };
    const game = createGame("sprint", host);

    try {
        assert.equal(game.status, "waiting");
        assert.equal(game.guest, null);
        assert.equal(findPlayer(game, host.userId)?.socketId, host.socketId);

        const joined = joinGame(game.gameId, guest);
        assert.equal(joined.status, "playing");
        assert.equal(findPlayer(joined, guest.userId)?.username, guest.username);

        const originalProblems = joined.problems;
        markPlayerFinished(game.gameId, host.userId, 2, originalProblems.slice(0, 2));
        assert.equal(game.status, "playing");
        assert.equal(game.host.finished, true);
        assert.equal(game.host.score, 2);

        markPlayerFinished(game.gameId, guest.userId, 1, originalProblems.slice(0, 1));
        assert.equal(game.status, "finished");

        const results = toResultsPayload(game);
        assert.deepEqual(
            results.players.map(({ userId, score, finished }) => ({ userId, score, finished })),
            [
                { userId: host.userId, score: 2, finished: true },
                { userId: guest.userId, score: 1, finished: true },
            ],
        );

        const firstVote = requestRematch(game.gameId, host.userId);
        assert.equal(firstVote.started, false);
        assert.deepEqual(rematchReadyUserIds(game), [host.userId]);

        const secondVote = requestRematch(game.gameId, guest.userId);
        assert.equal(secondVote.started, true);
        assert.equal(game.status, "playing");
        assert.notEqual(game.problems, originalProblems);
        assert.deepEqual(rematchReadyUserIds(game), []);

        for (const player of [game.host, game.guest]) {
            assert.ok(player);
            assert.equal(player.score, 0);
            assert.equal(player.finished, false);
            assert.deepEqual(player.problemSet, []);
            assert.equal(player.wantsRematch, false);
        }
    }
    finally {
        deleteGame(game.gameId);
    }
});

test("versus backend rejects invalid joins and finishes forfeited matches", () => {
    const host = { userId: "host-id", username: "Host", socketId: "host-socket" };
    const guest = { userId: "guest-id", username: "Guest", socketId: "guest-socket" };
    const game = createGame("standard", host);

    try {
        assert.throws(
            () => joinGame(game.gameId, { ...guest, userId: host.userId }),
            /cannot join your own game/i,
        );

        joinGame(game.gameId, guest);
        assert.throws(
            () => joinGame(game.gameId, {
                userId: "third-id",
                username: "Third",
                socketId: "third-socket",
            }),
            /no longer open/i,
        );

        markPlayerFinished(game.gameId, host.userId, 1, game.problems.slice(0, 1));
        const forfeited = markPlayerForfeit(game.gameId, guest.userId);
        assert.equal(forfeited?.status, "finished");
        assert.equal(findPlayer(game, guest.userId)?.finished, true);
    }
    finally {
        deleteGame(game.gameId);
    }
});
