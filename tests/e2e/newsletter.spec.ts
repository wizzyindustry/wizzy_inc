import { createHash } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';

const emulator = process.env.FIRESTORE_EMULATOR_HOST;

/** Same id as the server: hash of the lower-case email. */
const subscriberId = (email: string) =>
  createHash('sha256').update(email).digest('hex').slice(0, 40);

/** Read a subscriber straight from the Firestore emulator (test-only admin access). */
async function readToken(email: string): Promise<string | null> {
  const url = `http://${emulator}/v1/projects/demo-wizzy/databases/(default)/documents/subscribers/${subscriberId(email)}`;
  const res = await fetch(url, { headers: { Authorization: 'Bearer owner' } });
  if (!res.ok) return null;
  const doc = (await res.json()) as { fields?: { unsubscribeToken?: { stringValue?: string } } };
  return doc.fields?.unsubscribeToken?.stringValue ?? null;
}

async function signUp(page: Page, form: ReturnType<Page['getByRole']>, email: string) {
  await form.getByRole('textbox', { name: 'Your email address' }).fill(email);
  await form.getByRole('button', { name: 'Subscribe' }).click();
  await expect(form.getByRole('status')).toHaveText(/Thank you!/, { timeout: 15_000 });
}

test('a bad email is refused with a clear message', async ({ page }) => {
  await page.goto('/en');
  const form = page.getByRole('contentinfo').getByRole('group', { name: 'Stay updated' });
  await form.getByRole('textbox', { name: 'Your email address' }).fill('not-an-email');
  await form.getByRole('button', { name: 'Subscribe' }).click();
  await expect(form.getByRole('alert')).toHaveText('Please enter a valid email address.', {
    timeout: 15_000,
  });
});

test('subscribe on the home page, then unsubscribe with the email link', async ({
  page,
}, testInfo) => {
  test.skip(!emulator, 'Needs the emulators and `pnpm seed`');
  const email = `e2e-${testInfo.project.name}-${Date.now()}@example.test`;
  await page.goto('/en');
  const form = page.getByRole('region', { name: 'Get in touch' }).getByRole('group', {
    name: 'Stay updated',
  });
  await expect(form.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
    'href',
    '/en/privacy',
  );
  await signUp(page, form, email);

  await expect.poll(() => readToken(email)).not.toBeNull();
  const token = (await readToken(email))!;

  await page.goto(`/en/unsubscribe?t=${token}`);
  // Opening the link alone removes nothing (mail scanners open links too).
  expect(await readToken(email)).toBe(token);
  await page.getByRole('button', { name: 'Unsubscribe' }).click();
  await expect(page.getByRole('status')).toHaveText(/You have been unsubscribed/, {
    timeout: 15_000,
  });
  expect(await readToken(email)).toBeNull();

  // Using the link again is harmless.
  await page.goto(`/en/unsubscribe?t=${token}`);
  await page.getByRole('button', { name: 'Unsubscribe' }).click();
  await expect(page.getByRole('status')).toHaveText(/no longer valid/, { timeout: 15_000 });
});

test('the footer form works on every page and the admin sees the subscriber', async ({
  page,
}, testInfo) => {
  test.skip(!emulator, 'Needs the emulators and `pnpm seed`');
  test.skip(testInfo.project.name.includes('mobile'), 'Admin list: run in one project only');
  const email = `e2e-footer-${Date.now()}@example.test`;
  await page.goto('/sw/faq');
  const form = page.getByRole('contentinfo').getByRole('group', { name: 'Pata taarifa mpya' });
  await form.getByRole('textbox', { name: 'Anwani yako ya barua pepe' }).fill(email);
  await form.getByRole('button', { name: 'Jiandikishe' }).click();
  await expect(form.getByRole('status')).toHaveText(/Asante!/, { timeout: 15_000 });

  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@example.test');
  await page.locator('#password').fill('emulator-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
  await page.goto('/admin/subscribers');
  const row = page.getByRole('row').filter({ hasText: email });
  await expect(row).toContainText('SW');
  await expect(row).toContainText('Footer');

  page.once('dialog', (dialog) => void dialog.accept());
  await row.getByRole('button', { name: `Remove ${email}` }).click();
  await expect(row).toHaveCount(0, { timeout: 15_000 });
});
