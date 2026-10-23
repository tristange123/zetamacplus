import { expect, test } from "@playwright/test";
import prisma from "@/lib/db/prisma";
import { addUtcDays, getUtcDayStart } from "@/lib/time/utcDate";
import LoginPage from "../pages/LoginPage";

test("daily streak is strict at rollover and profile updates are idempotent", async ({page}) => {
    test.setTimeout(90_000);

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const email = `daily-streak-${suffix}@example.com`;
    const username = `daily-streak-${suffix}`;
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.register(username, email, "pizza2122", "pizza2122");
    await expect(page.getByText("Email verification required")).toBeVisible();
    await prisma.user.update({
        where: {email},
        data: {emailVerified: true},
    });

    const user = await prisma.user.findUniqueOrThrow({where: {email}});
    const today = getUtcDayStart();
    const yesterday = addUtcDays(today, -1);
    const twoDaysAgo = addUtcDays(today, -2);

    await prisma.test.createMany({
        data: [
            {
                score: 2,
                time: twoDaysAgo,
                gameMode: "daily",
                userId: user.id,
                completed: true,
            },
            {
                score: 3,
                time: yesterday,
                gameMode: "daily",
                userId: user.id,
                completed: true,
            },
        ],
    });
    await prisma.profile.update({
        where: {userId: user.id},
        data: {
            dailyStreak: 2,
            dailyLongestStreak: 2,
            dailyLastCompletedAt: yesterday,
        },
    });

    await page.goto("/");
    await expect(page.getByLabel("Current streak: 0 days")).toContainText("0");

    const testResponse = await page.request.post("/api/test", {
        data: {
            time: addUtcDays(today, 5),
            gameMode: "daily",
            score: 0,
        },
    });
    expect(testResponse.ok()).toBe(true);
    const completedTest = await testResponse.json() as {id: string};

    const profileUpdate = {
        testId: completedTest.id,
        score: 0,
        gameMode: "daily",
    };
    const firstPatch = await page.request.patch("/api/profile", {data: profileUpdate});
    const duplicatePatch = await page.request.patch("/api/profile", {data: profileUpdate});
    expect(firstPatch.ok()).toBe(true);
    expect(duplicatePatch.ok()).toBe(true);

    const profile = await prisma.profile.findUniqueOrThrow({
        where: {userId: user.id},
    });
    expect(profile.dailyStreak).toBe(3);
    expect(profile.dailyLongestStreak).toBe(3);
    expect(profile.dailyTotalTests).toBe(3);
    expect(profile.dailyLastCompletedAt?.toISOString()).toBe(today.toISOString());

    await page.reload();
    await expect(page.getByLabel("Current streak: 3 days")).toContainText("3");

    await page.goto("/stats");
    await expect(page.getByText("Current streak", {exact: true}).locator("..")).toContainText("3 days");
    await expect(page.getByText("Best streak", {exact: true}).locator("..")).toContainText("3 days");
});
