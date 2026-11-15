import { expect as baseExpect, test } from '@playwright/test';

// Sign-in goes through the Auth emulator, which is slow when both projects run at once.
const expect = baseExpect.configure({ timeout: 15_000 });

test.beforeEach(async ({ page }) => {
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the emulators and `pnpm seed`');
  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@example.test');
  await page.locator('#password').fill('emulator-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test('dashboard shows live lead activity, shortcuts and content summary', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Needs attention' })).toBeVisible();
  await expect(page.getByText('New leads', { exact: true })).toBeVisible();
  // SAMPLE leads exist, so the latest-leads list has entries that open the lead.
  const recent = page.getByRole('list', { name: 'Latest leads' });
  await expect(recent.getByRole('link').first()).toBeVisible();
  await expect(recent.getByRole('link')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Edit the About page' })).toBeVisible();
  await expect(page.getByText(/\d+ items? · \d+ published/).first()).toBeVisible();

  await recent.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/admin\/leads\/[^/]+$/);
});

test('sidebar menu lists every admin section, including the About page', async ({
  page,
}, testInfo) => {
  const phone = testInfo.project.name.includes('mobile');
  const menu = page.getByRole('button', { name: 'Menu' });
  const nav = page.getByRole('navigation', { name: 'Admin navigation' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');
  if (phone) {
    // Phones: closed until opened, and closes again after choosing a page.
    await expect(nav).toBeHidden();
    await menu.click();
  }
  await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await nav.getByRole('link', { name: 'About page' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About page');
  if (phone) await expect(nav).toBeHidden();
});
