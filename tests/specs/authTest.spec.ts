import { test, expect } from '@playwright/test';
import prisma from '@/lib/db/prisma';
import clearDatabase from '@/lib/db/clearDatabase'

import LoginPage from '../pages/LoginPage'


test('Initial Load', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ZETAMAC+')).toBeVisible();
});

async function forceVerifyEmail (email: string){
  await prisma.user.update({
    where: {email},
    data: {emailVerified: true}
  })
}

test('Auth Flow Test', async ({ page }) => {
  await clearDatabase()

  const loginPage = new LoginPage(page)
  await loginPage.goto()

  await loginPage.register('tris123', 'obesity500@gmail.com', 'pizza2122', 'pizza')
  await expect(page.getByText('match')).toBeVisible()

  await loginPage.register('tris123', 'obesity500@gmail.com', 'pizza2122', 'pizza2122')
  await expect(page.getByText('Email verification required')).toBeVisible()

  await forceVerifyEmail('obesity500@gmail.com')
  await page.goto('/')
  await expect(page.getByText('Welcome tris123')).toBeVisible()
});




// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
