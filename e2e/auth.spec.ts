import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('authentication', () => {
  test('protects the dashboard and redirects anonymous visitors to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('rejects a wrong password for the demo account', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('demo@pulse.dev');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByTestId('auth-submit').click();
    await expect(page.getByTestId('auth-error')).toContainText('incorrect');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('validates input', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('short');
    await page.getByTestId('auth-submit').click();
    await expect(page.getByTestId('auth-error')).toBeVisible();
  });

  test('signs in, keeps the session across reload, and signs out', async ({ page }) => {
    await signIn(page);
    await page.reload();
    await expect(page.getByTestId('greeting')).toBeVisible();

    await page.getByTestId('account-button').click();
    await expect(page.getByTestId('account-name')).toHaveText('Demo User');
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('signs up a new user and lands on the dashboard with their name', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Name').fill('Asha Rao');
    await page.getByLabel('Email').fill('asha@example.com');
    await page.getByLabel('Password').fill('Str0ng-pass!');
    await page.getByTestId('auth-submit').click();
    await expect(page.getByTestId('greeting')).toContainText('Asha');
  });

  test('session cookie is httpOnly', async ({ page, context }) => {
    await signIn(page);
    const cookie = (await context.cookies()).find((c) => c.name === 'pcd_session');
    expect(cookie?.httpOnly).toBe(true);
    expect(await page.evaluate(() => document.cookie)).not.toContain('pcd_session');
  });
});
