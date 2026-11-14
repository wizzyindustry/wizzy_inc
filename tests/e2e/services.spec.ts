import { expect, test } from '@playwright/test';

for (const locale of ['en', 'sw'] as const) {
  test(`services overview renders in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}/services`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('unknown service slug returns 404', async ({ page }) => {
  const response = await page.goto('/en/services/this-service-does-not-exist');
  expect(response?.status()).toBe(404);
});

test('service detail links to a pre-filled quote form (when services exist)', async ({ page }) => {
  await page.goto('/en/services');
  const firstService = page.locator('main article h3 a').first();
  test.skip((await firstService.count()) === 0, 'No services in this environment');
  await firstService.click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('main a[href*="/quote?service="]')).toBeVisible();
});
