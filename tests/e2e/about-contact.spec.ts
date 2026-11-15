import { expect, test } from '@playwright/test';

for (const locale of ['en', 'sw'] as const) {
  test(`about and contact pages render in ${locale} (F8, F9)`, async ({ page }) => {
    await page.goto(`/${locale}/about`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#tools-heading')).toBeVisible();

    await page.goto(`/${locale}/contact`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
  });
}

test('contact form shows errors for invalid input', async ({ page }) => {
  await page.goto('/en/contact');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('#name-error')).toBeVisible();
  await expect(page.locator('#phone-error')).toBeVisible();
  await expect(page.locator('#message-error')).toBeVisible();
});

test('contact message is sent and shows a reference (F9)', async ({ page }) => {
  // Needs Firestore (emulator); CI without it shows a server error instead.
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the Firestore emulator');
  await page.goto('/en/contact');
  await page.locator('#name').fill('E2E Tester');
  await page.locator('#phone').fill('0712345678');
  await page.locator('#message').fill('E2E test: do you also print business cards?');
  await page.getByRole('button', { name: 'Send message' }).click();

  const status = page.getByRole('status');
  await expect(status).toBeVisible();
  await expect(status.getByText(/^WZ-\d{4}-\d{4,}$/)).toBeVisible();
});

test('contact page has no horizontal scroll at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/en/contact');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
