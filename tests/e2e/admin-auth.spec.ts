import { expect as baseExpect, test, type Page } from '@playwright/test';

// Sign-in makes several calls to the Auth emulator, which is slow when both browser
// projects run in parallel (seconds, not milliseconds). Allow 15 s per assertion here.
const expect = baseExpect.configure({ timeout: 15_000 });

// Emulator-only accounts created by `pnpm seed` (fake addresses and password).
const PASSWORD = 'emulator-only-password';
const needsEmulator = () =>
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the Auth emulator and `pnpm seed`');

async function signIn(page: Page, email: string) {
  await page.goto('/admin/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

test('admin pages are not indexed and the dashboard needs sign-in (A1)', async ({ page }) => {
  await page.goto('/admin');
  // The guard waits for Firebase Auth to load before redirecting ("Checking your access…").
  await expect(page).toHaveURL(/\/admin\/login$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Admin sign in');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('an admin can sign in and out (A1, FR-8)', async ({ page }, testInfo) => {
  needsEmulator();
  await signIn(page, 'admin@example.test');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('Signed in as admin@example.test')).toBeVisible();

  // On phones, Sign out is inside the sidebar menu.
  if (testInfo.project.name.includes('mobile')) {
    await page.getByRole('button', { name: 'Menu' }).click();
  }
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('a signed-in account without the admin claim is refused', async ({ page }) => {
  needsEmulator();
  await signIn(page, 'not-admin@example.test');
  await expect(page.locator('main p[role="alert"]')).toHaveText(
    'This account does not have admin access.',
  );
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('a wrong password shows a friendly error', async ({ page }) => {
  needsEmulator();
  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@example.test');
  await page.locator('#password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('main p[role="alert"]')).toHaveText('Wrong email or password.');
});
