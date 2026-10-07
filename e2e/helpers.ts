import { expect, type Page } from '@playwright/test';

export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByTestId('use-demo').click();
  await page.getByTestId('auth-submit').click();
  await expect(page.getByTestId('greeting')).toBeVisible();
}

/** Waits for the unified feed to render real cards. */
export async function openFeed(page: Page) {
  await page.getByTestId('nav-feed').first().click();
  await expect(page).toHaveURL(/\/feed$/);
  await expect(page.getByTestId('content-card').first()).toBeVisible();
}

export const cardIds = (page: Page) => page.getByTestId('content-card').evaluateAll((els) => els.map((e) => e.getAttribute('data-item-id')));

/** Turns off simulated live updates so a background refresh can't reorder cards mid-test. */
export async function disableLiveUpdates(page: Page) {
  await page.getByTestId('nav-settings').first().click();
  const sw = page.getByTestId('setting-live');
  if ((await sw.getAttribute('aria-checked')) === 'true') await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
}

/**
 * The mock backend injects a time-windowed "live" post (id changes every 30 s). Drag-and-drop tests strip it
 * so the item set stays identical across reloads and assertions about order are deterministic.
 */
export async function stripLiveItems(page: Page) {
  await page.route('**/api/feed*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    body.items = body.items.filter((i: { id: string }) => !i.id.includes(':live-'));
    await route.fulfill({ response: res, json: body });
  });
}
