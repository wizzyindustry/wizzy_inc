import { expect, test } from '@playwright/test';

test('portfolio page renders in both locales', async ({ page }) => {
  for (const locale of ['en', 'sw']) {
    await page.goto(`/${locale}/portfolio`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('category filter works without a page reload (FR-7)', async ({ page }) => {
  await page.goto('/en/portfolio');
  const filters = page.getByRole('group').getByRole('button');
  test.skip((await filters.count()) === 0, 'No portfolio items in this environment');

  await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
  await filters.nth(1).click();
  await expect(filters.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/category=/);
  // Same document: the marker survives, so there was no full reload.
  expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
});

test('unknown case study returns 404', async ({ page }) => {
  const response = await page.goto('/en/portfolio/does-not-exist');
  expect(response?.status()).toBe(404);
});

test('project buttons follow the category (web: project + Git; design: design)', async ({
  page,
}) => {
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the emulators and `pnpm seed`');
  // SAMPLE data: project 2 is web development, project 1 is graphic design.
  await page.goto('/en/portfolio/sample-project-2');
  await expect(page.getByRole('link', { name: /View project/ })).toHaveAttribute(
    'href',
    'https://example.com/',
  );
  await expect(page.getByRole('link', { name: /View Git repo/ })).toHaveAttribute(
    'href',
    'https://example.com/sample-repo',
  );
  await expect(page.getByRole('link', { name: /View design/ })).toHaveCount(0);

  await page.goto('/en/portfolio/sample-project-1');
  await expect(page.getByRole('link', { name: /View design/ })).toHaveAttribute('target', '_blank');
  await expect(page.getByRole('link', { name: /View Git repo/ })).toHaveCount(0);
});
