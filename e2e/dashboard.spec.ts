import { expect, test } from '@playwright/test';
import { cardIds, openFeed, signIn } from './helpers';

test.describe('dashboard flows', () => {
  test.beforeEach(async ({ page }) => { await signIn(page); });

  test('sidebar navigates between every section', async ({ page }) => {
    for (const [id, url, heading] of [['feed', /\/feed$/, 'Personalized feed'], ['trending', /\/trending$/, 'Trending'], ['favorites', /\/favorites$/, 'Favorites'], ['settings', /\/settings$/, 'Settings'], ['dashboard', /\/dashboard$/, '']] as const) {
      await page.getByTestId(`nav-${id}`).first().click();
      await expect(page).toHaveURL(url);
      if (heading) await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    }
    await expect(page.getByTestId('nav-dashboard').first()).toHaveAttribute('aria-current', 'page');
  });

  test('feed mixes news, recommendations and social posts, and loads more on demand', async ({ page }) => {
    await openFeed(page);
    const types = await page.getByTestId('content-card').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('data-type')))]);
    expect(types.sort()).toEqual(['news', 'recommendation', 'social']);
    const first = (await cardIds(page)).length;
    await page.getByTestId('feed-footer').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await cardIds(page)).length).toBeGreaterThan(first);
    const ids = await cardIds(page);
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
  });

  test('trending shows ranked items per content type', async ({ page }) => {
    await page.getByTestId('nav-trending').first().click();
    for (const t of ['news', 'recommendation', 'social']) await expect(page.getByTestId(`trending-${t}`)).toBeVisible();
    await expect(page.getByLabel('Rank 1').first()).toBeVisible();
  });

  test('changing topics changes the feed and persists after reload', async ({ page }) => {
    await page.getByTestId('nav-settings').first().click();
    await page.getByRole('button', { name: /clear/i }).first().click();
    await page.getByTestId('category-finance').check({ force: true });
    await expect(page.getByTestId('topics-count')).toContainText('1');
    await page.reload();
    await expect(page.getByTestId('category-finance')).toBeChecked();
    await expect(page.getByTestId('category-technology')).not.toBeChecked();

    await page.getByTestId('nav-feed').first().click();
    await expect(page.getByTestId('content-card').first()).toBeVisible();
    const cats = await page.getByTestId('content-card').evaluateAll((els) => els.length);
    expect(cats).toBeGreaterThan(0);
    await expect(page.getByTestId('content-card').first().getByText('Finance', { exact: true })).toBeVisible();
  });

  test('with no topics selected the feed explains what to do', async ({ page }) => {
    await page.getByTestId('nav-settings').first().click();
    await page.getByRole('button', { name: /clear/i }).first().click();
    await page.getByTestId('nav-feed').first().click();
    await expect(page.getByText('Choose your topics')).toBeVisible();
  });

  test('favorites persist across reload and can be removed', async ({ page }) => {
    await page.getByTestId('nav-favorites').first().click();
    await expect(page.getByTestId('favorites-empty')).toBeVisible();

    await openFeed(page);
    const target = page.getByTestId('content-card').nth(1);
    const id = await target.getAttribute('data-item-id');
    await target.getByTestId('favorite-button').click();

    await page.reload();
    await page.getByTestId('nav-favorites').first().click();
    await expect(page.locator(`[data-item-id="${id}"]`)).toBeVisible();

    await page.locator(`[data-item-id="${id}"]`).getByTestId('favorite-button').click();
    await expect(page.getByTestId('favorites-empty')).toBeVisible();
  });

  test('dark mode applies to the document and persists after reload', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveClass(/dark/);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgb(255, 255, 255)');
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await page.getByTestId('theme-toggle').click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('language switcher translates the UI and persists', async ({ page }) => {
    await page.getByTestId('language-select').first().selectOption('es');
    await expect(page.getByTestId('nav-favorites').first()).toContainText('Favoritos');
    await page.reload();
    await expect(page.getByTestId('nav-favorites').first()).toContainText('Favoritos');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('simulated outage shows an error with Retry; turning it off recovers', async ({ page }) => {
    await page.getByTestId('nav-settings').first().click();
    await page.getByTestId('setting-simulate-error').click();
    await page.getByTestId('search-input').fill('react');
    await expect(page.getByTestId('error-state')).toBeVisible();
    await expect(page.getByTestId('error-state')).not.toContainText(/stack|TypeError|at \w+ \(/);

    await page.getByTestId('nav-settings').first().click();
    await page.getByTestId('setting-simulate-error').click();
    await page.getByTestId('search-input').fill('cloud');
    await expect(page.getByTestId('results-news')).toBeVisible();
  });
});

test.describe('responsive layout', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('mobile: drawer navigation works and there is no horizontal overflow', async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId('open-nav')).toBeVisible();
    await page.getByTestId('open-nav').click();
    const drawer = page.getByTestId('mobile-drawer');
    await expect(drawer).toBeVisible();
    await drawer.getByTestId('nav-feed').click();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(drawer).toBeHidden();
    await expect(page.getByTestId('content-card').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('mobile drawer closes with Escape', async ({ page }) => {
    await signIn(page);
    await page.getByTestId('open-nav').click();
    await expect(page.getByTestId('mobile-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('mobile-drawer')).toBeHidden();
  });
});
