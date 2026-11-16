import { expect, test, type Page } from '@playwright/test';

/** Skip when the environment has no services (e.g. CI without Firestore). */
async function openForm(page: Page, url: string) {
  await page.goto(url);
  const select = page.locator('#serviceSlug');
  test.skip((await select.count()) === 0, 'Quote form unavailable in this environment');
}

test('quote page renders in both locales', async ({ page }) => {
  for (const locale of ['en', 'sw']) {
    await page.goto(`/${locale}/quote`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('blocks the next step until required fields are valid', async ({ page }) => {
  await openForm(page, '/en/quote');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('#serviceSlug-error')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Service and package');
});

test('full quote request ends on the success page with a reference (F6, FR-4)', async ({
  page,
}) => {
  await openForm(page, '/en/quote?service=logo-design');
  await expect(page.locator('#serviceSlug')).toHaveValue('logo-design');
  await page.getByRole('button', { name: 'Next' }).click();

  await page.locator('#description').fill('E2E test: a logo for a small salon in Dodoma.');
  await page.locator('#attachments').setInputFiles({
    name: 'brief.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7 e2e test'),
  });
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('#budgetRange').selectOption('100k-300k');
  await page.getByRole('button', { name: 'Next' }).click();

  await page.locator('#name').fill('E2E Tester');
  await page.locator('#phone').fill('0712345678');
  await page.getByRole('button', { name: 'Send request' }).click();

  // Sending uploads the file and saves the lead: allow for a slow (busy) machine.
  await expect(page).toHaveURL(/\/en\/quote\/success\?ref=WZ-\d{4}-\d{4,}/, { timeout: 15_000 });
  await expect(page.getByText(/^WZ-\d{4}-\d{4,}$/)).toBeVisible();
});

test('a package link pre-selects the package and limits services (FR-6)', async ({ page }) => {
  await openForm(page, '/en/quote?package=web-development-standard');
  await expect(page.locator('#packageId')).toHaveValue('web-development-standard');
  const groups = page.locator('#serviceSlug optgroup');
  await expect(groups).toHaveCount(1);
});
