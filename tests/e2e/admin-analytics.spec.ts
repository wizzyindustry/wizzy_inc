import { expect as baseExpect, test } from '@playwright/test';

// Sign-in goes through the Auth emulator, which is slow when both projects run at once.
const expect = baseExpect.configure({ timeout: 15_000 });

test('analytics shows headline numbers, 12 months and breakdowns (A7)', async ({ page }) => {
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the emulators and `pnpm seed`');
  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@example.test');
  await page.locator('#password').fill('emulator-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page
    .getByRole('navigation', { name: 'Admin navigation' })
    .getByRole('link', { name: 'Analytics' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Analytics');

  const months = page.getByRole('list', { name: 'Leads per month' });
  await expect(months.getByRole('listitem')).toHaveCount(12);
  await expect(page.getByText('Conversion', { exact: true })).toBeVisible();
  await expect(page.getByText('Quote requests by service')).toBeVisible();

  // Table view: same 12 months, and the monthly counts add up to the "Leads" tile.
  await page.getByText('Show as table').click();
  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(12);
  const counts = await rows.locator('td:last-child').allTextContents();
  const sum = counts.reduce((total, c) => total + Number(c), 0);
  const tile = page.locator('p', { hasText: /^Leads$/ }).locator('xpath=following-sibling::p[1]');
  await expect(tile).toHaveText(String(sum));
  expect(sum).toBeGreaterThan(0);
});
