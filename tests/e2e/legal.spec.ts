import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/privacy', en: 'Privacy Policy', sw: 'Sera ya Faragha' },
  { path: '/terms', en: 'Terms & Conditions', sw: 'Vigezo na Masharti' },
  { path: '/cookies', en: 'Cookie Policy', sw: 'Sera ya Vidakuzi' },
] as const;

for (const page of PAGES) {
  test(`${page.en} page works in both languages`, async ({ page: browser }) => {
    const res = await browser.goto(`/en${page.path}`);
    expect(res?.status()).toBe(200);
    await expect(browser.getByRole('heading', { level: 1 })).toHaveText(page.en);
    await expect(browser.getByText(/Last updated:/)).toBeVisible();

    await browser.goto(`/sw${page.path}`);
    await expect(browser.getByRole('heading', { level: 1 })).toHaveText(page.sw);
  });
}

test('footer links to the legal pages', async ({ page }) => {
  await page.goto('/en');
  const legal = page.getByRole('navigation', { name: 'Legal' });
  await legal.getByRole('link', { name: 'Terms & Conditions' }).click();
  await expect(page).toHaveURL(/\/en\/terms$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms & Conditions');
});

test('Swahili visitors are told when only English text exists yet', async ({ page }) => {
  await page.goto('/sw/privacy');
  // The drafts are English-only until the owner adds Swahili.
  await expect(page.getByText('Toleo la Kiswahili la ukurasa huu linaandaliwa.')).toBeVisible();
});

test('the contact form links to the Privacy Policy', async ({ page }) => {
  await page.goto('/en/contact');
  await page.getByRole('main').getByRole('link', { name: 'Privacy Policy' }).click();
  await expect(page).toHaveURL(/\/en\/privacy$/, { timeout: 15_000 });
});
