import { type MainGameModeName, type Problem } from "@/types/frontendTypes";

export type VersusGameStatus = "waiting" | "playing" | "finished";

export type VersusPlayerResult = {
    userId: string,
    username: string,
    score: number,
    problemSet: Problem[],
    finished: boolean,
};

export type VersusPlayerState = VersusPlayerResult & {
    socketId: string | null,
};

export type VersusGame = {
    gameId: string,
    gameMode: MainGameModeName,
    timeFormat: number,
    problems: Problem[],
    host: VersusPlayerState,
    guest: VersusPlayerState | null,
    status: VersusGameStatus,
    createdAt: number,
};

export type VersusPublicPlayer = {
    userId: string,
    username: string,
};

export type VersusResultsPayload = {
    gameId: string,
    gameMode: MainGameModeName,
    timeFormat: number,
    status: VersusGameStatus,
    players: VersusPlayerResult[],
};
