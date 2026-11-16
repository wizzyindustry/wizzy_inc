import { expect, test } from '@playwright/test';

test('support page: help topics, FAQ link and contact options', async ({ page }) => {
  await page.goto('/en/support');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Support');
  const topics = page.getByRole('region', { name: 'How we can help' });
  await expect(topics.getByRole('listitem')).not.toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Get in touch' })).toBeVisible();
  await page.getByRole('link', { name: 'Read the FAQ' }).click();
  await expect(page).toHaveURL(/\/en\/faq$/, { timeout: 15_000 });
});

test('Swahili support page', async ({ page }) => {
  await page.goto('/sw/support');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Msaada');
  await expect(page.getByRole('heading', { name: 'Tunavyoweza kusaidia' })).toBeVisible();
});
