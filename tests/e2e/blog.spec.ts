import { expect, test } from '@playwright/test';

const emulator = process.env.FIRESTORE_EMULATOR_HOST;

test('blog list and a post open in both languages', async ({ page }) => {
  await page.goto('/en/blog');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
  const cards = page.getByRole('main').getByRole('article');
  test.skip((await cards.count()) === 0, 'No posts in this environment');
  const first = cards.first();
  const title = (await first.getByRole('heading').textContent())!.trim();
  await first.getByRole('link').click();
  await expect(page).toHaveURL(/\/en\/blog\/[a-z0-9-]+$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(page.getByRole('link', { name: /All posts/ })).toBeVisible();

  await page.goto('/sw/blog');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blogu');
});

test('a missing post is a real 404', async ({ page }) => {
  const res = await page.goto('/en/blog/no-such-post');
  expect(res?.status()).toBe(404);
});

test('admin writes, publishes and deletes a post (Admin → Blog posts)', async ({
  page,
}, testInfo) => {
  test.skip(!emulator, 'Needs the emulators and `pnpm seed`');
  const slug = `e2e-${testInfo.project.name.includes('mobile') ? 'm' : 'd'}-${Date.now()}`;
  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@example.test');
  await page.locator('#password').fill('emulator-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });

  await page.goto('/admin/content/posts/new');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('New blog post');
  await page.locator('#field-title-en').fill(`E2E post ${slug}`);
  await page.locator('#field-slug').fill(slug);
  await page.locator('#field-excerpt-en').fill('E2E summary.');
  await page.locator('#field-body-en').fill('## E2E heading\n\nE2E body text.');
  await page.locator('#field-published').check();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved. The public site is updated.')).toBeVisible({
    timeout: 15_000,
  });

  await expect(async () => {
    await page.goto(`/en/blog/${slug}`);
    await expect(page.getByRole('heading', { name: 'E2E heading' })).toBeVisible({
      timeout: 2_000,
    });
  }).toPass({ timeout: 30_000 });

  await page.goto('/admin/content/posts');
  await page.getByRole('link', { name: new RegExp(`E2E post ${slug}`) }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL(/\/admin\/content\/posts$/, { timeout: 15_000 });
});
