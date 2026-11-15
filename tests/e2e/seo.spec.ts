import { expect, test } from '@playwright/test';

test('sitemap.xml lists public pages in both locales (FR-11)', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.ok()).toBe(true);
  const xml = await res.text();
  for (const path of ['/en', '/sw', '/en/services', '/sw/contact', '/en/pricing']) {
    expect(xml).toContain(`${path}</loc>`);
  }
  expect(xml).toContain('hreflang="x-default"');
  expect(xml).not.toContain('/quote/success');
});

test('robots.txt allows the site, blocks admin, and points to the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.ok()).toBe(true);
  const txt = await res.text();
  expect(txt).toContain('Allow: /');
  expect(txt).toContain('Disallow: /admin');
  expect(txt).toMatch(/Sitemap: .+\/sitemap\.xml/);
});

for (const path of ['/en', '/sw/services', '/en/about', '/sw/contact', '/en/pricing', '/sw/faq']) {
  test(`${path} has title, description, canonical, hreflang and Open Graph tags`, async ({
    page,
  }) => {
    await page.goto(path);
    const head = page.locator('head');
    await expect(page).toHaveTitle(/.+/);
    await expect(head.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${path}$`),
    );
    await expect(head.locator('link[rel="alternate"][hreflang="sw"]')).toHaveCount(1);
    await expect(head.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(head.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(head.locator('meta[property="og:image"]').first()).toHaveAttribute(
      'content',
      /\/opengraph-image/,
    );
    await expect(head.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon/);
  });
}

test('share image and favicon are PNGs', async ({ request }) => {
  for (const url of ['/en/opengraph-image', '/sw/opengraph-image', '/en/icon']) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect(res.headers()['content-type'], url).toContain('image/png');
  }
});

test('home page has LocalBusiness structured data for Dodoma', async ({ page }) => {
  await page.goto('/en');
  const json = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(json ?? '{}');
  expect(data['@type']).toBe('ProfessionalService');
  expect(data.address.addressLocality).toBe('Dodoma');
});

test('case study uses its own cover as the share image', async ({ page }) => {
  await page.goto('/en/portfolio');
  const first = page.locator('a[href^="/en/portfolio/"]').first();
  test.skip((await first.count()) === 0, 'No portfolio items in this environment');
  await page.goto((await first.getAttribute('href')) ?? '/en/portfolio');
  const images = await page
    .locator('head meta[property="og:image"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('content')));
  expect(images[0]).not.toMatch(/opengraph-image/);
  const types = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')['@type']));
  expect(types).toContain('CreativeWork');
});
