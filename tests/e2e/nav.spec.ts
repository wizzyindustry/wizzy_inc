import { expect, test } from '@playwright/test';

test.describe('desktop header menus', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop header only');

  test('Services menu opens on hover and lists every service', async ({ page }) => {
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Main navigation' }).first();
    const button = nav.getByRole('button', { name: 'Services' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.hover();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: 'All services' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Graphic design' }).first()).toBeVisible();
    // Moving away closes it.
    await page.mouse.move(5, 600);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('Company menu works with a click and the keyboard', async ({ page }) => {
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Main navigation' }).first();
    const button = nav.getByRole('button', { name: 'Company' });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    for (const name of ['About', 'Blog', 'Support', 'Offices', 'Press']) {
      await expect(nav.getByRole('link', { name: new RegExp(`^${name}`) })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();

    await button.click();
    await nav.getByRole('link', { name: /^Press/ }).click();
    await expect(page).toHaveURL(/\/en\/press$/, { timeout: 15_000 });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone layout only');

  test('groups Services and Company pages', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.getByRole('navigation', { name: 'Main navigation' }).last();
    await expect(menu.getByRole('region', { name: 'Company' })).toBeVisible();
    await menu.getByRole('link', { name: 'Offices' }).click();
    await expect(page).toHaveURL(/\/en\/offices$/, { timeout: 15_000 });
  });
});
