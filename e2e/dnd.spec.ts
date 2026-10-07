import { expect, test, type Page } from '@playwright/test';
import { cardIds, disableLiveUpdates, openFeed, signIn, stripLiveItems } from './helpers';

async function dragFirstOntoThird(page: Page) {
  const handles = page.getByTestId('drag-handle');
  const from = (await handles.nth(0).boundingBox())!;
  const to = (await page.getByTestId('content-card').nth(2).boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 20, from.y + 20, { steps: 5 }); // pass the 6px activation distance
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 25 });
  await page.mouse.up();
}

test.describe('drag-and-drop reordering', () => {
  test.beforeEach(async ({ page }) => { await stripLiveItems(page); await signIn(page); await disableLiveUpdates(page); await openFeed(page); });

  test('dragging a card reorders the feed, and the order survives a reload', async ({ page }) => {
    const before = (await cardIds(page)).slice(0, 6);
    await dragFirstOntoThird(page);

    await expect.poll(async () => (await cardIds(page))[0]).not.toBe(before[0]);
    const after = (await cardIds(page)).slice(0, 6);
    expect(after).not.toEqual(before);
    expect([...after].sort()).toEqual([...before].sort()); // nothing lost or duplicated
    expect(after.indexOf(before[0]!)).toBeGreaterThan(0);

    await page.reload();
    await expect(page.getByTestId('content-card').first()).toBeVisible();
    expect((await cardIds(page)).slice(0, 6)).toEqual(after);
  });

  test('"Reset order" restores the natural order', async ({ page }) => {
    const before = (await cardIds(page)).slice(0, 6);
    await dragFirstOntoThird(page);
    await expect(page.getByTestId('reset-order')).toBeVisible();
    await page.getByTestId('reset-order').click();
    await expect.poll(async () => (await cardIds(page)).slice(0, 6)).toEqual(before);
  });

  test('keyboard users can reorder: Space to lift, arrow to move, Space to drop', async ({ page }) => {
    const before = (await cardIds(page)).slice(0, 4);
    await page.getByTestId('drag-handle').first().focus();
    await page.keyboard.press('Space');
    await expect(page.getByText('Card picked up').first()).toBeAttached(); // sensor is armed
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250); // let collision detection settle under CI load
    await page.keyboard.press('Space');
    await expect.poll(async () => (await cardIds(page))[0]).toBe(before[1]);
  });

  test('favoriting and links still work while drag-and-drop is enabled', async ({ page }) => {
    const first = page.getByTestId('content-card').first();
    const fav = first.getByTestId('favorite-button');
    await fav.click();
    await expect(fav).toHaveAttribute('aria-pressed', 'true');
    await expect(first.getByRole('link').first()).toHaveAttribute('target', '_blank');
  });
});
