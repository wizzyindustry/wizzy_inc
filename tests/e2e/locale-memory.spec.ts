import { expect, test } from '@playwright/test';

test('the chosen language is remembered for the next visit (F10)', async ({ page, context }) => {
  await page.goto('/en');
  await page.getByRole('banner').locator('a[hreflang="sw"]').click();
  await expect(page).toHaveURL(/\/sw$/);

  const cookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE');
  expect(cookie?.value).toBe('sw');
  // A persistent cookie (about a year), not one that disappears with the browser session.
  const days = ((cookie?.expires ?? -1) * 1000 - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(360);

  // A link without a language (e.g. shared on WhatsApp) opens in the remembered one.
  await page.goto('/');
  await expect(page).toHaveURL(/\/sw$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
});

test('switching back to English is remembered too', async ({ page }) => {
  await page.goto('/sw');
  await page.getByRole('banner').locator('a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/en$/);
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
});
