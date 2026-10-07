import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('search', () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test('debounces typing: one API request for "react", not five', async ({ page }) => {
    // Land on /search first so typing doesn't also trigger a route change mid-keystroke.
    await page.getByTestId('search-input').fill('x');
    await expect(page).toHaveURL(/\/search$/);
    await page.getByTestId('search-clear').click();

    const requests: string[] = [];
    page.on('request', (r) => { if (r.url().includes('/api/search')) requests.push(new URL(r.url()).searchParams.get('q') ?? ''); });

    await page.getByTestId('search-input').click();
    await page.keyboard.type('react', { delay: 40 });
    await expect(page.getByTestId('results-news')).toBeVisible();
    await page.waitForTimeout(800); // longer than the debounce window: no late stragglers
    expect(requests).toEqual(['react']);
  });

  test('returns grouped, categorized results across content types', async ({ page }) => {
    await page.getByTestId('search-input').fill('data');
    const groups = page.locator('[data-testid^="results-"]');
    await expect(groups.first()).toBeVisible();
    expect(await groups.count()).toBeGreaterThanOrEqual(2);
    await expect(page.getByTestId('content-card').first()).toBeVisible();
  });

  test('filters results by content type', async ({ page }) => {
    await page.getByTestId('search-input').fill('data');
    await expect(page.getByTestId('results-news')).toBeVisible();
    await page.getByRole('group', { name: /type/i }).getByRole('button', { name: 'Social posts' }).click();
    await expect(page.getByTestId('results-news')).toHaveCount(0);
  });

  test('shows an empty state for a query with no matches, and clearing resets it', async ({ page }) => {
    await page.getByTestId('search-input').fill('zzqxjv');
    await expect(page.getByTestId('search-empty')).toContainText('zzqxjv');
    await page.getByTestId('search-clear').click();
    await expect(page.getByTestId('search-input')).toHaveValue('');
    await expect(page.getByTestId('search-prompt')).toBeVisible();
  });

  test('shows an error with Retry when the API fails, then recovers', async ({ page }) => {
    let fail = true;
    await page.route('**/api/search*', (route) => (fail
      ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'upstream', message: 'Search is temporarily unavailable.' } }) })
      : route.continue()));
    await page.getByTestId('search-input').fill('react');
    await expect(page.getByTestId('error-state')).toContainText('temporarily unavailable');
    fail = false;
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByTestId('results-news')).toBeVisible();
  });

  test('a search can be favorited and the item shows up in Favorites', async ({ page }) => {
    await page.getByTestId('search-input').fill('data');
    await page.getByTestId('favorite-button').first().click();
    await page.getByTestId('nav-favorites').first().click();
    await expect(page.getByTestId('favorites-list').getByTestId('content-card')).toHaveCount(1);
  });
});
