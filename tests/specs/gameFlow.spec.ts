import { test, expect } from '@playwright/test';
import prisma from '@/lib/db/prisma';
import clearDatabase from '@/lib/db/clearDatabase';

import LoginPage from '../pages/LoginPage';
import GamePage from '../pages/GamePage';
import ResultsPage from '../pages/ResultsPage';
import StatsPage from '../pages/StatsPage';


async function forceVerifyEmail(email: string) {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });
}

async function waitOneSecond(gamePage: GamePage) {
  const label = await gamePage.timer.innerText();
  const remaining = Number(label.replace('Time: ', ''));
  await expect(gamePage.timer).toHaveText(`Time: ${remaining - 1}`);
}

test('Sprint game flow', async ({ page }) => {
  test.setTimeout(60_000);
  await clearDatabase();

  const email = 'sprintflow@gmail.com';
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.register('sprintplayer', email, 'pizza2122', 'pizza2122');
  await expect(page.getByText('Email verification required')).toBeVisible();

  await forceVerifyEmail(email);
  await page.goto('/');
  await expect(page.getByText('Welcome sprintplayer')).toBeVisible();
  await expect(page.getByLabel('Email verified')).toBeVisible();

  await page.getByRole('button', { name: /^Sprint/ }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page).toHaveURL('/game');

  const gamePage = new GamePage(page);
  await expect(gamePage.score).toHaveText('Score: 0');
  await expect(gamePage.answerInput).toHaveValue('');

  for (let score = 1; score <= 3; score++) {
    await waitOneSecond(gamePage);
    await gamePage.solveProblem();
    await expect(gamePage.answerInput).toHaveValue('');
    await expect(gamePage.score).toHaveText(`Score: ${score}`);
  }

  const resultsSaved = page.waitForResponse((response) => {
    return response.request().method() === 'PATCH'
      && new URL(response.url()).pathname === '/api/profile';
  });

  const resultsPage = new ResultsPage(page);
  await expect(page).toHaveURL(/\/results/, { timeout: 15_000 });
  await expect(resultsPage.score).toHaveText('Score: 3');
  await resultsSaved;

  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('menuitem', { name: 'Stats' }).click();
  await expect(page).toHaveURL('/stats');

  const statsPage = new StatsPage(page);
  await expect(statsPage.sprintStats.firstPlace).toContainText('3 pts');
  await expect(statsPage.pastRuns.rows.first()).toContainText('3 pts');
});
