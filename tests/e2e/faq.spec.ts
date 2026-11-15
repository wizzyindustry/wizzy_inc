import { expect, test } from '@playwright/test';

for (const locale of ['en', 'sw'] as const) {
  test(`FAQ page renders in ${locale} with a way to ask more (F12)`, async ({ page }) => {
    await page.goto(`/${locale}/faq`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main a[href$="/quote"]')).toBeVisible();
    await expect(page.locator('main a[href$="/contact"]')).toBeVisible();
  });
}

test('FAQ is reachable from the footer', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('contentinfo').getByRole('link', { name: 'FAQ' }).click();
  await expect(page).toHaveURL(/\/en\/faq$/);
});

test('questions from site settings open and close, with FAQPage data', async ({ page }) => {
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the emulators and `pnpm seed`');
  await page.goto('/en/faq');
  const question = page.locator('summary', { hasText: 'SAMPLE: How do I pay?' });
  const answer = page.getByText('SAMPLE: Placeholder answer — not a real policy.').first();
  await expect(question).toBeVisible();
  await expect(answer).toBeHidden();
  await question.click();
  await expect(answer).toBeVisible();

  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
  expect(types).toContain('FAQPage');
});
