import { expect, test } from '@playwright/test';

test('press page: leadership with icon links, media resources and brand colours', async ({
  page,
}) => {
  await page.goto('/en/press');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Press');
  const leadership = page.getByRole('region', { name: 'Leadership' });
  test.skip((await leadership.count()) === 0, 'No press content in this environment');

  // Social links are icons with a spoken name.
  const link = leadership.getByRole('link', { name: /on Pinterest$/ }).first();
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link.locator('svg')).toHaveCount(1);
  await expect(leadership.getByRole('link', { name: /on Email$/ }).first()).toHaveAttribute(
    'href',
    /^mailto:/,
  );

  const media = page.getByRole('region', { name: 'Media resources' });
  await expect(media.getByRole('link', { name: /Open document/ }).first()).toHaveAttribute(
    'href',
    /\.pdf/,
  );

  const colours = page.getByRole('region', { name: 'Brand colours' });
  await expect(colours.getByText('#1D4ED8')).toBeVisible();
  await expect(colours.getByText('rgb(29, 78, 216)')).toBeVisible();
});

test('Swahili press page', async ({ page }) => {
  await page.goto('/sw/press');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vyombo vya habari');
});
