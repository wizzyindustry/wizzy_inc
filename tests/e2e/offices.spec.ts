import { expect, test } from '@playwright/test';

test('offices page lists offices with a map, in both languages', async ({ page }) => {
  await page.goto('/en/offices');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our offices');
  const map = page.locator('iframe[title^="Map: "]');
  test.skip((await map.count()) === 0, 'No offices in this environment');
  await expect(map).toHaveAttribute('src', /openstreetmap\.org/);
  await expect(page.getByRole('article').first()).toBeVisible();

  await page.goto('/sw/offices');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ofisi zetu');
});

test('home page links to all offices', async ({ page }) => {
  await page.goto('/en');
  const visit = page.getByRole('region', { name: 'Visit our office' });
  test.skip((await visit.count()) === 0, 'No offices in this environment');
  await visit.getByRole('link', { name: 'See all offices' }).click();
  await expect(page).toHaveURL(/\/en\/offices$/, { timeout: 15_000 });
});
