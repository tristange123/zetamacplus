import { getUtcDayStart } from "@/lib/time/utcDate";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type DailyStreakTest = {
    time: Date;
    gameMode: string;
    completed: boolean;
};

export type DailyStreakStats = {
    dailyStreak: number;
    dailyLongestStreak: number;
    dailyLastCompletedAt: Date | null;
};

export function computeDailyStreaks(
    tests: DailyStreakTest[],
    now: Date = new Date(),
): DailyStreakStats {
    const today = getUtcDayStart(now).getTime();
    const playedDays = new Set(
        tests
            .filter((test) => (
                test.completed
                && test.gameMode === "daily"
                && getUtcDayStart(test.time).getTime() <= today
            ))
            .map((test) => getUtcDayStart(test.time).getTime()),
    );
    const days = [...playedDays].sort((a, b) => a - b);

    let longestStreak = 0;
    let runningStreak = 0;
    let previousDay: number | null = null;

    for (const day of days) {
        runningStreak = previousDay !== null
            && day - previousDay === MILLISECONDS_PER_DAY
            ? runningStreak + 1
            : 1;
        longestStreak = Math.max(longestStreak, runningStreak);
        previousDay = day;
    }

    return {
        dailyStreak: runningStreak,
        dailyLongestStreak: longestStreak,
        dailyLastCompletedAt: previousDay === null ? null : new Date(previousDay),
    };
}

// A streak stays alive until a whole UTC day passes without playing the daily
export function getDisplayedDailyStreak(
    dailyStreak: number,
    dailyLastCompletedAt: Date | null,
    now: Date = new Date(),
): number {
    if (dailyLastCompletedAt === null) return 0;

    const daysSinceLastCompletion = (
        getUtcDayStart(now).getTime() - getUtcDayStart(dailyLastCompletedAt).getTime()
    ) / MILLISECONDS_PER_DAY;

    return daysSinceLastCompletion <= 1 ? dailyStreak : 0;
}
