import { expect, test } from '@playwright/test';

test('pricing page renders in both locales', async ({ page }) => {
  for (const locale of ['en', 'sw']) {
    await page.goto(`/${locale}/pricing`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(`main a[href="/${locale}/quote"]`)).toBeVisible();
  }
});

test('"Request this package" links to the quote form with the package (FR-6)', async ({ page }) => {
  await page.goto('/en/pricing');
  const links = page.locator('main a[href*="/quote?package="]');
  test.skip((await links.count()) === 0, 'No packages in this environment');
  await expect(links.first()).toHaveAttribute('href', /\/en\/quote\?package=[\w-]+/);
});
