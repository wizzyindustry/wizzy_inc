import { expect, test } from '@playwright/test';

test('root redirects to a locale', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/(en|sw)$/);
});

for (const locale of ['en', 'sw'] as const) {
  test(`home page renders in ${locale} with header, footer and quote CTA`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('banner').locator(`a[href="/${locale}/quote"]`)).toBeVisible();
  });
}

test('language switcher moves between en and sw', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('banner').locator('a[hreflang="sw"]').click();
  await expect(page).toHaveURL(/\/sw$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
});

test('no horizontal scroll at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/en');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
