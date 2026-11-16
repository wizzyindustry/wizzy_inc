import { expect, test } from '@playwright/test';

test('the loading "W" shows while a page is still loading, then the page appears', async ({
  page,
}) => {
  // Slow down the data for the next page (also its background prefetch), like a weak
  // mobile connection.
  await page.route('**/en/portfolio**', async (route) => {
    if (route.request().headers()['rsc']) await new Promise((r) => setTimeout(r, 2500));
    await route.continue();
  });
  await page.goto('/en');

  await page.getByRole('main').getByRole('link', { name: 'See our work' }).click();
  const loading = page.getByRole('status').filter({ hasText: 'Loading…' });
  await expect(loading).toBeVisible();
  await expect(loading.locator('svg path')).toHaveCount(2);

  // The address changes when the slowed-down page data has arrived.
  await expect(page).toHaveURL(/\/en\/portfolio$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(loading).toBeHidden();
});
