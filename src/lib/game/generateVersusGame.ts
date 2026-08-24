import { type MainGameModeName, type Problem } from "@/types/frontendTypes";
import { generateProblem } from "./generateProblem";
import { BOUNDS, MAIN_GAME_MODES } from "./gameModeGlobals";

const VERSUS_PROBLEM_COUNT = 1000;
const GAME_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const VERSUS_GAME_ID_LENGTH = 6;

export function generateVersusGameId(): string {
    let gameId = "";
    for (let i = 0; i < VERSUS_GAME_ID_LENGTH; i += 1) {
        gameId += GAME_ID_ALPHABET[Math.floor(Math.random() * GAME_ID_ALPHABET.length)];
    }
    return gameId;
}

export function generateVersusProblems(gameMode: MainGameModeName): Problem[] {
    const bounds = BOUNDS[MAIN_GAME_MODES[gameMode].problemType];
    const problems: Problem[] = [];
    for (let i = 0; i < VERSUS_PROBLEM_COUNT; i += 1) {
        const problem = generateProblem(bounds, i);
        problem.orderNumber = i;
        problems.push(problem);
    }
    return problems;
}

export function generateVersusGame(gameMode: MainGameModeName): {
    gameId: string,
    gameMode: MainGameModeName,
    timeFormat: number,
    problems: Problem[],
} {
    return {
        gameId: generateVersusGameId(),
        gameMode,
        timeFormat: MAIN_GAME_MODES[gameMode].timeFormat,
        problems: generateVersusProblems(gameMode),
    };
}

export function isMainGameModeName(value: string): value is MainGameModeName {
    return value === "standard"
        || value === "rapid"
        || value === "sprint"
        || value === "hard";
}

export function normalizeVersusGameId(value: string): string {
    return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
