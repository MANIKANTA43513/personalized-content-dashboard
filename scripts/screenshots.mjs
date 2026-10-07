// Usage: npm run build && npx next start -p 3100   (in another terminal), then: node scripts/screenshots.mjs
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://localhost:3100';
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH, args: ['--no-sandbox', '--disable-gpu'] } : {});

async function shot(name, { width, height, dark = false, path = '/feed' }) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.getByTestId('use-demo').click();
  await page.getByTestId('auth-submit').click();
  await page.getByTestId('greeting').waitFor();
  if (dark) await page.getByTestId('theme-toggle').click();
  await page.goto(`${base}${path}`);
  await page.getByTestId('content-card').first().waitFor();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `docs/${name}.png` });
  await ctx.close();
}

await shot('feed-light', { width: 1440, height: 900 });
await shot('feed-dark', { width: 1440, height: 900, dark: true });
await shot('mobile', { width: 390, height: 844 });
await browser.close();
