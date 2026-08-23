import { test, expect } from '@playwright/test';

test('Sprint Gamemode run through', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  const sprintButton = page.getByText('')
  await expect
});





