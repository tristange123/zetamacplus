import { test, expect } from '@playwright/test';
import prisma from '@/lib/db/prisma';


test('Has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page.getByText('ZETAMAC+')).toBeVisible();
});

test('Login test', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Register Username').fill('tristange123')
  await page.getByLabel('Register Email').fill('obesity500@gmail.com')
  await page.getByLabel('Register Password').fill('pizza2122')
  await page.getByLabel('Confirm Password').fill('pizza2123')

  await page.getByRole("button", {name: 'Register'}).click()
  await expect(page.getByText('Passwords do not match')).toBeVisible();

  await page.getByLabel('Confirm Password').fill('pizza2122');
  await page.getByRole("button", {name: 'Register'}).click()

  await expect(page.getByText('Email Verification')).toBeVisible()

  await prisma.user.update({
    where: {email: 'obesity500@gmail.com'},
    data: {emailVerified: true}
  })

  await page.goto('/')

  await expect(page.getByText('Welcome tristange123')).toBeVisible()

});




// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
