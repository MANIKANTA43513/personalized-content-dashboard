import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test('live updates: a periodic refresh prepends new items and shows an indicator', async ({ page }) => {
  await page.clock.install();
  await signIn(page);
  await page.getByTestId('nav-feed').first().click();
  await expect(page.getByTestId('content-card').first()).toBeVisible();

  // The mock's "live" item depends on server time, so make the next refresh deterministic.
  await page.route('**/api/feed*', async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    body.items.unshift({
      id: 'social:e2e-live-1', type: 'social', title: 'E2E live post', description: '#live', image: null, category: 'technology',
      source: 'Chirp', handle: '@e2e', hashtags: ['#live'], likes: 1, url: 'https://example.com/e2e', publishedAt: new Date().toISOString(),
    });
    await route.fulfill({ response: res, json: body });
  });

  // Retry the clock advance: under load the poll timer may not be registered on the first attempt.
  await expect(async () => {
    await page.clock.runFor(31_000); // runFor (not fastForward) so async work between timers executes
    await expect(page.getByRole('heading', { name: 'E2E live post' })).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 25_000 });
  await expect(page.getByTestId('new-items')).toBeVisible();
  // Prepended to the top (card count is not asserted: infinite scroll may also append page 2).
  await expect(page.getByTestId('content-card').first()).toHaveAttribute('data-item-id', 'social:e2e-live-1');
});
