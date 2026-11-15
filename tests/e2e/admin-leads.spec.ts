import { expect as baseExpect, test, type Page } from '@playwright/test';

// Sign-in makes several calls to the Auth emulator, which is slow when both browser
// projects run in parallel (seconds, not milliseconds). Allow 15 s per assertion here.
const expect = baseExpect.configure({ timeout: 15_000 });

// Uses emulator-only data from `pnpm seed`: admin@example.test and two SAMPLE leads.
test.beforeEach(() => {
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the emulators and `pnpm seed`');
});

async function signInAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@example.test');
  await page.locator('#password').fill('emulator-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test('inbox lists leads with filters and search (A2)', async ({ page }) => {
  await signInAsAdmin(page);
  await page.getByRole('link', { name: 'Open leads inbox' }).click();
  const list = page.getByRole('list', { name: 'Leads, newest first' });
  await expect(list.getByText('WZ-2000-0001')).toBeVisible();
  await expect(list.getByText('WZ-2000-0002')).toBeVisible();

  await page.getByLabel('Type').selectOption('contact');
  await expect(list.getByText('WZ-2000-0002')).toBeVisible();
  await expect(list.getByText('WZ-2000-0001')).toHaveCount(0);

  await page.getByLabel('Type').selectOption('');
  await page.getByLabel('Search').fill('0700 000 001');
  await expect(list.getByText('WZ-2000-0001')).toBeVisible();
  await expect(list.getByText('WZ-2000-0002')).toHaveCount(0);
});

test('status change is recorded with a time, and notes are saved (FR-10)', async ({
  page,
}, testInfo) => {
  // Each browser project uses its own status/note so parallel runs don't clash.
  const target = testInfo.project.name.includes('mobile') ? 'Contacted' : 'Quoted';
  const noteText = `E2E note from ${testInfo.project.name} ${Date.now()}`;

  await signInAsAdmin(page);
  await page.goto('/admin/leads/sample-lead-quote');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('WZ-2000-0001');

  const group = page.getByRole('group', { name: 'Status' });
  const button = group.getByRole('button', { name: target, exact: true });
  if ((await button.getAttribute('aria-pressed')) === 'true') {
    await group.getByRole('button', { name: 'New', exact: true }).click();
    await expect(button).toBeEnabled();
  }
  await button.click();
  await expect(page.getByText(`Status changed to ${target}.`)).toBeVisible();
  await expect(page.locator('ol li').filter({ hasText: target }).first()).toBeVisible();

  await page.getByLabel('Add a note').fill(noteText);
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByText(noteText)).toBeVisible();
});

test('attachment downloads for an admin only', async ({ page, request }) => {
  await signInAsAdmin(page);
  await page.goto('/admin/leads/sample-lead-quote');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample-brief.pdf');

  const anonymous = await request.get('/api/admin/leads/sample-lead-quote/attachments/0');
  expect(anonymous.status()).toBe(401);
  const forged = await request.get('/api/admin/leads/sample-lead-quote/attachments/0', {
    headers: { authorization: 'Bearer not-a-real-token' },
  });
  expect(forged.status()).toBe(401);
});
