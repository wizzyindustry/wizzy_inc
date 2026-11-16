import { expect, test } from '@playwright/test';

test('home page explains the business: our story, why choose us, FAQ', async ({ page }) => {
  await page.goto('/en');
  // "Our story" comes right after the hero.
  const sections = page.getByRole('main').locator('section');
  await expect(sections.nth(1)).toHaveAttribute('aria-labelledby', 'story-heading');
  const story = page.getByRole('region', { name: 'Our story' });
  await expect(story).toBeVisible();
  await story.getByRole('link', { name: 'More about us' }).click();
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

test('company facts, partners, impact and office map come from admin', async ({ page }) => {
  await page.goto('/en');
  const facts = page.getByRole('region', { name: 'Our story' }).locator('dl');
  test.skip((await facts.count()) === 0, 'No company info in this environment');
  await expect(facts.getByText('Headquarters')).toBeVisible();
  await expect(facts.getByText('Founder & CEO')).toBeVisible();

  const partners = page.getByRole('region', { name: 'Brands we work with' });
  // Logos are listed once for screen readers (the moving copy is hidden).
  await expect(partners.getByRole('listitem')).not.toHaveCount(0);
  await expect(partners.locator('ul[aria-hidden="true"]')).toHaveCount(1);

  const impact = page.getByRole('region', { name: 'Our impact in numbers' });
  await impact.scrollIntoViewIfNeeded();
  await expect(impact.locator('dd').first()).toContainText(/\d/);

  const visit = page.getByRole('region', { name: 'Visit our office' });
  const map = visit.locator('iframe');
  await expect(map).toHaveAttribute('src', /openstreetmap\.org\/export\/embed\.html/);
  await expect(map).toHaveAttribute('title', /^Map: /);
  await expect(
    visit.getByRole('link', { name: /Open map and directions/ }).first(),
  ).toHaveAttribute('target', '_blank');
});

test('service cards turn over to explain the service', async ({ page }) => {
  await page.goto('/en');
  const services = page.getByRole('region', { name: 'Our services' });
  const card = services.getByRole('listitem').first();
  await card.hover();
  await expect(card.locator('.flip-inner')).toHaveCSS('transform', /matrix3d/);
  await card.getByRole('link', { name: /^Learn more/ }).click();
  await expect(page).toHaveURL(/\/en\/services/, { timeout: 15_000 });
});

test('get in touch offers the quote and contact pages', async ({ page }) => {
  await page.goto('/en');
  const contact = page.getByRole('region', { name: 'Get in touch' });
  await expect(contact.getByRole('link', { name: 'Request a quote' })).toHaveAttribute(
    'href',
    '/en/quote',
  );
  await contact.getByRole('link', { name: 'Send a message' }).click();
  await expect(page).toHaveURL(/\/en\/contact$/, { timeout: 15_000 });
});

test('Swahili home page has the same sections', async ({ page }) => {
  await page.goto('/sw');
  await expect(page.getByRole('heading', { name: 'Historia yetu' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Huduma zetu' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kwa nini utuchague' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wasiliana nasi' })).toBeVisible();
});

test('sections fade in as they scroll into view', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveClass(/reveal-ready/);
  const last = page.getByRole('main').locator('section').last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveClass(/is-visible/);
  await expect(last).toHaveCSS('opacity', '1');
});

test('with "reduce motion" nothing is hidden for animations', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/en');
  await expect(page.locator('html')).not.toHaveClass(/reveal-ready/);
  await expect(page.getByRole('main').locator('section').last()).toHaveCSS('opacity', '1');
  await context.close();
});
