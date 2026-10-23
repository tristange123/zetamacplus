import assert from "node:assert/strict";
import test from "node:test";
import {
    computeDailyStreaks,
    getDisplayedDailyStreak,
    type DailyStreakTest,
} from "@/lib/profile/dailyStreak";
import { buildProfileStats, type TestStat } from "@/lib/profile/buildProfileStats";

const NOW = new Date("2026-10-15T16:00:00.000Z");

function daily(time: string, overrides: Partial<DailyStreakTest> = {}): DailyStreakTest {
    return {
        time: new Date(time),
        gameMode: "daily",
        completed: true,
        ...overrides,
    };
}

test("returns zero streaks for no completed daily tests", () => {
    assert.deepEqual(computeDailyStreaks([], NOW), {
        dailyStreak: 0,
        dailyLongestStreak: 0,
        dailyLastCompletedAt: null,
    });
});

test("counts consecutive UTC dates and deduplicates multiple tests in one day", () => {
    const result = computeDailyStreaks([
        daily("2026-10-15T23:59:00.000Z"),
        daily("2026-10-14T01:00:00.000Z"),
        daily("2026-10-15T00:01:00.000Z"),
        daily("2026-10-13T12:00:00.000Z"),
    ], NOW);

    assert.equal(result.dailyStreak, 3);
    assert.equal(result.dailyLongestStreak, 3);
    assert.equal(result.dailyLastCompletedAt?.toISOString(), "2026-10-15T00:00:00.000Z");
});

test("tracks the current chain and the all-time longest chain separately", () => {
    const result = computeDailyStreaks([
        daily("2026-10-15T02:00:00.000Z"),
        daily("2026-10-10T02:00:00.000Z"),
        daily("2026-10-09T02:00:00.000Z"),
        daily("2026-10-08T02:00:00.000Z"),
    ], NOW);

    assert.equal(result.dailyStreak, 1);
    assert.equal(result.dailyLongestStreak, 3);
});

test("ignores incomplete, non-daily, and future tests", () => {
    const result = computeDailyStreaks([
        daily("2026-10-15T02:00:00.000Z", { completed: false }),
        daily("2026-10-15T02:00:00.000Z", { gameMode: "standard" }),
        daily("2026-10-16T02:00:00.000Z"),
        daily("2026-10-14T02:00:00.000Z"),
    ], NOW);

    assert.equal(result.dailyStreak, 1);
    assert.equal(result.dailyLastCompletedAt?.toISOString(), "2026-10-14T00:00:00.000Z");
});

test("display keeps the streak until a whole UTC day is missed", () => {
    assert.equal(
        getDisplayedDailyStreak(5, new Date("2026-10-15T00:00:00.000Z"), NOW),
        5,
    );
    assert.equal(
        getDisplayedDailyStreak(4, new Date("2026-10-14T00:00:00.000Z"), NOW),
        4,
    );
    assert.equal(
        getDisplayedDailyStreak(3, new Date("2026-10-13T00:00:00.000Z"), NOW),
        0,
    );
    assert.equal(getDisplayedDailyStreak(0, null, NOW), 0);
});

test("uses UTC rather than the local calendar at midnight boundaries", () => {
    const lastCompletion = new Date("2026-10-15T20:00:00.000Z");

    assert.equal(getDisplayedDailyStreak(2, lastCompletion, new Date("2026-10-16T23:59:59.999Z")), 2);
    assert.equal(getDisplayedDailyStreak(2, lastCompletion, new Date("2026-10-17T00:00:00.000Z")), 0);
});

test("profile rebuild includes the same streak cache fields", () => {
    const tests: TestStat[] = [
        {
            id: "today",
            score: 0,
            time: new Date("2026-10-15T08:00:00.000Z"),
            gameMode: "daily",
            userId: "user-1",
            completed: true,
        },
        {
            id: "yesterday",
            score: 4,
            time: new Date("2026-10-14T08:00:00.000Z"),
            gameMode: "daily",
            userId: "user-1",
            completed: true,
        },
    ];

    const stats = buildProfileStats(tests, NOW) as Record<string, unknown>;

    assert.equal(stats.dailyStreak, 2);
    assert.equal(stats.dailyLongestStreak, 2);
    assert.deepEqual(stats.dailyLastCompletedAt, new Date("2026-10-15T00:00:00.000Z"));
    assert.equal(stats.dailyCompleted, true);
    assert.equal(stats.dailyScore, 0);
});
