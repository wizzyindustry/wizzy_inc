import { expect, test } from '@playwright/test';

test('the loading "W" shows on every page change, then the page appears', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('main').getByRole('link', { name: 'See our work' }).click();

  // Shown even on a fast connection (owner's choice), for about 0.6 s.
  const loading = page.getByRole('status').filter({ hasText: 'Loading…' });
  await expect(loading).toBeVisible();
  await expect(loading.locator('svg path')).toHaveCount(2);

  await expect(page).toHaveURL(/\/en\/portfolio$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(loading).toBeHidden();
});

test('the "W" also shows when a page is opened directly, then fades away', async ({ page }) => {
  await page.goto('/en/about');
  const splash = page.locator('.page-splash');
  await expect(splash).toHaveCount(1);
  await expect(splash).toBeHidden({ timeout: 5_000 });
  // The page underneath can be used once the splash has gone.
  await page.getByRole('main').getByRole('link').first().click({ trial: true });
});
