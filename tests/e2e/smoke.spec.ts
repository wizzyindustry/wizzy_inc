import { expect, test } from '@playwright/test';

test('root redirects to a locale', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/(en|sw)$/);
});

for (const locale of ['en', 'sw'] as const) {
  test(`home page renders in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}
