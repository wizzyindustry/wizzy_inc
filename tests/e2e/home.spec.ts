import { expect, test } from '@playwright/test';

test('home page explains the business: about, why choose us, FAQ', async ({ page }) => {
  await page.goto('/en');
  const about = page.getByRole('region', { name: 'Who is behind Wizzy Inc' });
  await expect(about).toBeVisible();
  await about.getByRole('link', { name: 'More about us' }).click();
  await expect(page).toHaveURL(/\/en\/about$/, { timeout: 15_000 });

  await page.goto('/en');
  const why = page.getByRole('region', { name: 'Why choose us' });
  await expect(why.getByRole('listitem')).not.toHaveCount(0);

  const faq = page.getByRole('region', { name: 'Questions clients ask' });
  test.skip((await faq.count()) === 0, 'No FAQ questions in this environment');
  const first = faq.locator('details').first();
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await faq.getByRole('link', { name: /See all/ }).click();
  await expect(page).toHaveURL(/\/en\/faq$/, { timeout: 15_000 });
});

test('Swahili home page has the same sections', async ({ page }) => {
  await page.goto('/sw');
  await expect(page.getByRole('heading', { name: 'Kwa nini utuchague' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nani yuko nyuma ya Wizzy Inc' })).toBeVisible();
});
