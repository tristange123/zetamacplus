import { MAIN_GAME_MODES } from "@/lib/game/gameModeGlobals";
import { type MainGameModeName } from "@/types/frontendTypes";
import { type Prisma } from "@/generated/prisma/client";

type TrackedGameMode = MainGameModeName | "daily";

export type TestStat = {
    id: string;
    score: number;
    time: Date;
    gameMode: string;
    userId: string | null;
    completed: boolean;
};

const TRACKED_GAME_MODES: TrackedGameMode[] = [
    ...(Object.keys(MAIN_GAME_MODES) as MainGameModeName[]),
    "daily",
];

function isTrackedGameMode(gameMode: string): gameMode is TrackedGameMode {
    return TRACKED_GAME_MODES.includes(gameMode as TrackedGameMode);
}

function getUtcDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function buildModeStats(tests: TestStat[], gameMode: TrackedGameMode) {
    const modeTests = tests.filter((test) => test.completed && test.gameMode === gameMode);
    const topTests = [...modeTests].sort((a, b) =>
        b.score - a.score
        || a.time.getTime() - b.time.getTime()
        || a.id.localeCompare(b.id)
    );
    const problemsSolved = gameMode === "daily"
        ? {}
        : {
            [`${gameMode}ProblemsSolved`]: modeTests.reduce(
                (total, test) => total + test.score,
                0
            ),
        };

    return {
        [`${gameMode}PastTenTests`]: modeTests.slice(0, 10).map((test) => test.score),
        [`${gameMode}Average`]: modeTests.length === 0
            ? 0
            : modeTests.reduce((sum, test) => sum + test.score, 0) / modeTests.length,
        [`${gameMode}TotalTests`]: modeTests.length,
        [`${gameMode}_1`]: topTests[0]?.id ?? null,
        [`${gameMode}_2`]: topTests[1]?.id ?? null,
        [`${gameMode}_3`]: topTests[2]?.id ?? null,
        ...problemsSolved,
    };
}

export function buildProfileStats(
    tests: TestStat[],
    now: Date = new Date()
): Prisma.ProfileUpdateInput {
    const completedTrackedTests = tests.filter(
        (test) => test.completed && isTrackedGameMode(test.gameMode)
    );
    const dailyTests = completedTrackedTests.filter((test) => test.gameMode === "daily");
    const latestDailyTest = dailyTests[0] ?? null;
    const completedDailyToday = latestDailyTest !== null
        && getUtcDateKey(latestDailyTest.time) === getUtcDateKey(now);

    const modeStats = TRACKED_GAME_MODES.reduce<Record<string, unknown>>(
        (stats, gameMode) => Object.assign(stats, buildModeStats(tests, gameMode)),
        {}
    );

    return {
        testsCompleted: completedTrackedTests.length,
        ...modeStats,
        dailyCompleted: completedDailyToday,
        pastDailys: [...dailyTests].reverse().map((test) => test.id),
        dailyTest: completedDailyToday ? latestDailyTest.id : null,
        dailyScore: completedDailyToday ? latestDailyTest.score : null,
    } as Prisma.ProfileUpdateInput;
}
