import type { IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import { createGame, findPlayer, getGame, toResultsPayload } from "@/lib/versus/gameStore";
import { getVersusUserFromCookie } from "@/lib/versus/nodeSession";
import {
    VERSUS_GAME_ID_LENGTH,
    isMainGameModeName,
    normalizeVersusGameId,
} from "@/lib/game/generateVersusGame";

function json(res: ServerResponse, status: number, body: unknown) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
}

function readJson(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
        });
        req.on("end", () => {
            try {
                const raw = Buffer.concat(chunks).toString("utf8");
                resolve(raw ? JSON.parse(raw) : {});
            }
            catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}

export async function handleVersusHttp(
    req: IncomingMessage,
    res: ServerResponse,
): Promise<boolean> {
    const parsed = parse(req.url ?? "", true);
    const pathname = parsed.pathname ?? "";
    if (!pathname.startsWith("/api/versus")) {
        return false;
    }

    const user = await getVersusUserFromCookie(req.headers.cookie);
    if (!user) {
        json(res, 401, { error: "Unauthorized" });
        return true;
    }

    if (pathname === "/api/versus/create" && req.method === "POST") {
        try {
            const body = await readJson(req) as { gameMode?: unknown };
            if (typeof body.gameMode !== "string" || !isMainGameModeName(body.gameMode)) {
                json(res, 400, { error: "Choose a valid game mode." });
                return true;
            }

            const game = createGame(body.gameMode, {
                userId: user.userId,
                username: user.username,
                socketId: null,
            });
            json(res, 200, {
                gameId: game.gameId,
                gameMode: game.gameMode,
                timeFormat: game.timeFormat,
            });
        }
        catch {
            json(res, 400, { error: "Invalid request body." });
        }
        return true;
    }

    const match = pathname.match(/^\/api\/versus\/results\/([A-Za-z0-9]+)$/);
    if (match && req.method === "GET") {
        const gameId = normalizeVersusGameId(match[1]);
        if (gameId.length !== VERSUS_GAME_ID_LENGTH) {
            json(res, 400, { error: "Invalid game code" });
            return true;
        }

        const game = getGame(gameId);
        if (!game || !findPlayer(game, user.userId)) {
            json(res, 404, { error: "Results not found" });
            return true;
        }

        json(res, 200, toResultsPayload(game));
        return true;
    }

    json(res, 404, { error: "Not found" });
    return true;
}
