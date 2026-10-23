import { test, expect, type Page } from '@playwright/test';
import prisma from '@/lib/db/prisma';

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

async function playSprint(gamePage: GamePage, problems: number) {
  await expect(gamePage.score).toHaveText('Score: 0');
  await expect(gamePage.answerInput).toHaveValue('');

  for (let score = 1; score <= problems; score++) {
    await waitOneSecond(gamePage);
    await gamePage.solveProblem();
    await expect(gamePage.answerInput).toHaveValue('');
    await expect(gamePage.score).toHaveText(`Score: ${score}`);
  }
}

function waitForResultsSaved(page: Page) {
  return page.waitForResponse((response) => {
    return response.request().method() === 'PATCH'
      && new URL(response.url()).pathname === '/api/profile';
  });
}

test('Sprint game flow', async ({ page }) => {
  test.setTimeout(90_000);

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `sprint-flow-${suffix}@example.com`;
  const username = `sprint-${suffix}`;
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.register(username, email, 'pizza2122', 'pizza2122');
  await expect(page.getByText('Email verification required')).toBeVisible();

  await forceVerifyEmail(email);
  await page.goto('/');
  await expect(
    page.getByRole('navigation').getByText(username, { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Email verified')).toBeVisible();

  await page.getByRole('button', { name: /^Sprint/ }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page).toHaveURL('/game/sprint');

  // First run: any score is a new best
  const gamePage = new GamePage(page);
  await playSprint(gamePage, 3);

  let resultsSaved = waitForResultsSaved(page);
  const resultsPage = new ResultsPage(page);
  await expect(resultsPage.score).toHaveText('Score: 3', { timeout: 15_000 });
  await expect(page).toHaveURL('/game/sprint');
  await expect(resultsPage.rankCrown).toHaveAttribute('aria-label', 'First best score');
  await resultsSaved;

  // Second run: beating the first score is a new best again
  await resultsPage.restartButton.click();
  await playSprint(gamePage, 4);

  resultsSaved = waitForResultsSaved(page);
  await expect(resultsPage.score).toHaveText('Score: 4', { timeout: 15_000 });
  await expect(resultsPage.rankCrown).toHaveAttribute('aria-label', 'First best score');
  await resultsSaved;

  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('menuitem', { name: 'Stats' }).click();
  await expect(page).toHaveURL('/stats');

  const statsPage = new StatsPage(page);
  await expect(statsPage.sprintStats.firstPlace).toContainText('4 pts');
  await expect(statsPage.pastRuns.rows.first()).toContainText('4 pts');
});

test('Sprint game flow without an account', async ({ page }) => {
  test.setTimeout(60_000);

  const apiWrites: string[] = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (request.method() !== 'GET' && pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      apiWrites.push(`${request.method()} ${pathname}`);
    }
  });

  await page.goto('/');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Login' })).toBeVisible();

  await page.getByRole('button', { name: /^Sprint/ }).click();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page).toHaveURL('/game/sprint');

  const gamePage = new GamePage(page);
  await playSprint(gamePage, 3);

  const resultsPage = new ResultsPage(page);
  await expect(resultsPage.score).toHaveText('Score: 3', { timeout: 15_000 });
  await expect(page).toHaveURL('/game/sprint');
  await expect(resultsPage.problemTable.rows).toHaveCount(3);
  await expect(resultsPage.rankCrown).toHaveCount(0);

  await resultsPage.restartButton.click();
  await expect(gamePage.score).toHaveText('Score: 0');
  await expect(gamePage.problem).toContainText('=');

  expect(apiWrites).toEqual([]);
});
