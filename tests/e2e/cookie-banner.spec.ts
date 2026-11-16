import { expect, test } from '@playwright/test';

// A first-time visitor: no saved cookie choice.
test.use({ storageState: { cookies: [], origins: [] } });

const consentCookie = async (page: import('@playwright/test').Page) =>
  (await page.context().cookies()).find((c) => c.name === 'wz_cookie_consent');

test('first visit shows the banner; "Essential only" is remembered', async ({ page }) => {
  await page.goto('/en');
  const banner = page.getByRole('region', { name: 'Cookie consent' });
  await expect(banner).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Read the Cookie Policy' })).toHaveAttribute(
    'href',
    '/en/cookies',
  );

  await banner.getByRole('button', { name: 'Essential only' }).click();
  await expect(banner).toBeHidden();
  const cookie = await consentCookie(page);
  expect(cookie?.value).toBe('essential');
  // About a year (allow a minute either way).
  expect(cookie!.expires * 1000 - Date.now()).toBeGreaterThan(364 * 24 * 3600 * 1000);

  await page.goto('/en/about');
  await page.waitForLoadState('networkidle');
  await expect(banner).toBeHidden();
});

test('"Cookie settings" in the footer reopens it to change the choice', async ({ page }) => {
  await page.goto('/sw');
  const banner = page.getByRole('region', { name: 'Idhini ya vidakuzi' });
  await banner.getByRole('button', { name: 'Kubali vyote' }).click();
  await expect(banner).toBeHidden();
  expect((await consentCookie(page))?.value).toBe('all');

  await page.getByRole('button', { name: 'Mipangilio ya vidakuzi' }).click();
  await expect(banner).toBeVisible();
  await expect(banner.getByText('Chaguo lako la sasa: Kubali vyote.')).toBeVisible();
  await banner.getByRole('button', { name: 'Muhimu pekee' }).click();
  expect((await consentCookie(page))?.value).toBe('essential');
});
