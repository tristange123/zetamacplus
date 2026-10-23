import { test, expect, type Page } from '@playwright/test';
import prisma from '@/lib/db/prisma';

import LoginPage from '../pages/LoginPage';
import GamePage from '../pages/GamePage';


async function forceVerifyEmail(email: string) {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });
}

async function saveSettings(page: Page, settings: { showScore: boolean, showTimer: boolean }) {
  await page.goto('/settings');

  for (const [label, checked] of [['Show score', settings.showScore], ['Show timer', settings.showTimer]] as const) {
    const toggle = page.getByRole('checkbox', { name: label });
    if (await toggle.isChecked() !== checked) {
      await page.getByText(label, { exact: true }).click();
    }
    await expect(toggle).toBeChecked({ checked });
  }

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Settings saved.')).toBeVisible();
}

// Normal (saved) and extra (unsaved) modes share the game screen, so check one of each
const GAME_URLS = ['/game/standard', '/game/gcd'];

test('Show score and show timer settings apply to normal and extra game modes', async ({ page }) => {
  test.setTimeout(60_000);

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `settings-${suffix}@example.com`;
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.register(`settings-${suffix}`, email, 'pizza2122', 'pizza2122');
  await expect(page.getByText('Email verification required')).toBeVisible();
  await forceVerifyEmail(email);

  const gamePage = new GamePage(page);

  // Defaults: both shown
  for (const url of GAME_URLS) {
    await page.goto(url);
    await expect(gamePage.problem).toContainText('=');
    await expect(gamePage.score).toBeVisible();
    await expect(gamePage.timer).toBeVisible();
  }

  // Score hidden, timer shown. Games are loaded directly so settings must come from the profile.
  await saveSettings(page, { showScore: false, showTimer: true });
  for (const url of GAME_URLS) {
    await page.goto(url);
    await expect(gamePage.problem).toContainText('=');
    await expect(gamePage.score).toHaveCount(0);
    await expect(gamePage.timer).toBeVisible();
  }

  // Timer hidden, score shown
  await saveSettings(page, { showScore: true, showTimer: false });
  for (const url of GAME_URLS) {
    await page.goto(url);
    await expect(gamePage.problem).toContainText('=');
    await expect(gamePage.timer).toHaveCount(0);
    await expect(gamePage.score).toBeVisible();
  }

  // Settings survive a reload mid-game
  await page.reload();
  await expect(gamePage.problem).toContainText('=');
  await expect(gamePage.timer).toHaveCount(0);
  await expect(gamePage.score).toBeVisible();
});
