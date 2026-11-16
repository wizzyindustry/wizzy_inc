import { expect as baseExpect, test, type Page } from '@playwright/test';

// Sign-in and saves go through the emulators, which are slow when both browser projects
// run in parallel. Allow 15 s per assertion here.
const expect = baseExpect.configure({ timeout: 15_000 });

test.beforeEach(() => {
  test.skip(!process.env.FIRESTORE_EMULATOR_HOST, 'Needs the emulators and `pnpm seed`');
});

/** Unique per run and browser project, so parallel runs never touch the same item. */
const unique = (name: string) => `e2e-${name.includes('mobile') ? 'm' : 'd'}-${Date.now()}`;

/** 1×1 PNG. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

async function signInAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@example.test');
  await page.locator('#password').fill('emulator-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

/**
 * Open a public page until it shows a saved change. While other tests save in parallel, the
 * page refreshes overlap and can briefly serve the previous version; a reload then shows it.
 */
async function openUntil(page: Page, path: string, check: () => Promise<void>) {
  await expect(async () => {
    await page.goto(path);
    await check();
  }).toPass({ timeout: 20_000 });
}

const quick = baseExpect.configure({ timeout: 2_000 });

async function save(page: Page) {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved. The public site is updated.')).toBeVisible();
}

async function deleteItem(page: Page) {
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
}

test('create, publish and delete a service; the public site follows (A4)', async ({
  page,
}, testInfo) => {
  const slug = unique(testInfo.project.name);
  const title = `E2E service ${slug}`;

  await signInAsAdmin(page);
  await page.goto('/admin/content/services/new');
  await page.locator('#field-title-en').fill(title);
  await page.locator('#field-slug').fill(slug);
  await page.locator('#field-summary-en').fill('E2E summary');
  await page.locator('#field-body-en').fill('E2E **body**');
  await page.locator('#field-inclusions-en').fill('One\nTwo');
  await page.locator('#field-startingPriceTZS').fill('12345');
  await page.locator('#field-turnaroundDays_min').fill('2');
  await page.locator('#field-turnaroundDays_max').fill('4');
  await page.locator('#field-icon').fill('palette');
  await page.locator('#field-published').check();
  await save(page);
  await expect(page).toHaveURL(/\/admin\/content\/services\/[\w-]+$/);

  // The new page exists straight away (on-demand revalidation).
  const publicPage = await page.context().newPage();
  await publicPage.goto(`/en/services/${slug}`);
  await expect(publicPage.getByRole('heading', { level: 1 })).toHaveText(title);

  await deleteItem(page);
  await expect(page).toHaveURL(/\/admin\/content\/services$/);
  const gone = await publicPage.goto(`/en/services/${slug}`);
  expect(gone?.status()).toBe(404);
});

test('invalid input is rejected with field errors (A4)', async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto('/admin/content/services/new');
  await page.locator('#field-slug').fill('Not A Slug!');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('main p[role="alert"]')).toHaveText(
    'Please fix the highlighted fields.',
  );
  await expect(page.locator('#field-slug')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#field-title-en')).toHaveAttribute('aria-invalid', 'true');
});

test('portfolio item with an uploaded cover image (A5)', async ({ page }, testInfo) => {
  const slug = unique(testInfo.project.name);
  await signInAsAdmin(page);
  await page.goto('/admin/content/portfolio/new');

  // A fake "PNG" (wrong content) is refused by the server.
  await page.locator('#field-coverImage').setInputFiles({
    name: 'fake.png',
    mimeType: 'image/png',
    buffer: Buffer.from('not really an image'),
  });
  await expect(page.getByText('Only JPG, PNG or WebP images are allowed.')).toBeVisible();

  await page
    .locator('#field-coverImage')
    .setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();

  await page.locator('#field-title-en').fill(`E2E work ${slug}`);
  await page.locator('#field-slug').fill(slug);
  await page.locator('#field-clientType').fill('E2E client type');
  await page.locator('#field-problem-en').fill('E2E problem');
  await page.locator('#field-solution-en').fill('E2E solution');

  // Link fields follow the category: design link for graphic design, site + Git for web.
  await page.locator('#field-category').selectOption('graphic-design');
  await expect(page.locator('#field-designUrl')).toBeVisible();
  await expect(page.locator('#field-repoUrl')).toHaveCount(0);
  await page.locator('#field-category').selectOption('web-development');
  await expect(page.locator('#field-designUrl')).toHaveCount(0);
  await page.locator('#field-liveUrl').fill('https://example.com/');
  await page.locator('#field-repoUrl').fill('https://example.com/e2e-repo');

  await page.locator('#field-published').check();
  await save(page);

  const publicPage = await page.context().newPage();
  await publicPage.goto(`/en/portfolio/${slug}`);
  await expect(publicPage.getByRole('heading', { level: 1 })).toHaveText(`E2E work ${slug}`);
  await expect(publicPage.locator('main img').first()).toBeVisible();
  await expect(publicPage.getByRole('link', { name: /View Git repo/ })).toHaveAttribute(
    'href',
    'https://example.com/e2e-repo',
  );

  await deleteItem(page);
  await expect(page).toHaveURL(/\/admin\/content\/portfolio$/);
});

test('a testimonial cannot be saved without client consent (F11)', async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto('/admin/content/testimonials/new');
  await page.locator('#field-name').fill('E2E client');
  await page.locator('#field-role').fill('Owner');
  await page.locator('#field-quote-en').fill('Great work');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('#field-consentGiven')).toHaveAttribute('aria-invalid', 'true');
});

// Settings and About are single shared documents, and each save refreshes every public
// page — run these one after another so they never overlap.
test.describe('shared site documents', () => {
  test.describe.configure({ mode: 'serial' });

  test('site settings update the home page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Shared document: run in one project only');
    const headline = `E2E headline ${Date.now()}`;
    await signInAsAdmin(page);
    await page.goto('/admin/settings');
    const field = page.locator('#field-hero_headline-en');
    const original = await field.inputValue();
    await field.fill(headline);
    await save(page);

    await openUntil(page, '/en', () =>
      quick(page.getByRole('heading', { level: 1 })).toHaveText(headline),
    );

    // Put the original headline back, so local review data is left as it was.
    await page.goto('/admin/settings');
    await page.locator('#field-hero_headline-en').fill(original);
    await save(page);
  });

  test('a hero background image is uploaded in settings', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Shared document: run in one project only');
    await signInAsAdmin(page);
    await page.goto('/admin/settings');
    const hero = page.getByRole('group', { name: 'Hero background image' });
    await page
      .locator('#field-hero_image')
      .setInputFiles({ name: 'hero.png', mimeType: 'image/png', buffer: PNG });
    await expect(hero.locator('img')).toBeVisible(); // preview
    await save(page);

    const heroImage = () => page.getByRole('main').locator('section').first().locator('img');
    await openUntil(page, '/en', () =>
      quick(heroImage()).toHaveAttribute('src', /site%(25)?2Fhero/),
    );

    // Remove it again, so local review data is left as it was.
    await page.goto('/admin/settings');
    await hero.getByRole('button', { name: 'Remove', exact: true }).click();
    await save(page);
    await openUntil(page, '/en', () => quick(heroImage()).toHaveCount(0));
  });

  test('the About page text is edited in admin', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Shared document: run in one project only');
    const intro = `E2E about intro ${Date.now()}`;
    await signInAsAdmin(page);
    await page.goto('/admin/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About page');
    const field = page.locator('#field-intro-en');
    const original = await field.inputValue();
    await field.fill(intro);

    // Add a tool card with an SVG logo; an SVG with a script is refused.
    const tools = page.getByRole('group', { name: 'Tools we use' });
    const rows = tools.locator('ol > li'); // one per tool
    const before = await rows.count();
    await tools.getByRole('button', { name: 'Add a tool' }).click();
    await page.locator(`#field-tools-${before}-name`).fill('E2E tool');
    const logo = page.locator(`#field-tools-${before}-logo`);
    await logo.setInputFiles({
      name: 'bad.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg onload="alert(1)"></svg>'),
    });
    await expect(page.getByText('SVG files must not contain scripts or links.')).toBeVisible();
    await logo.setInputFiles({
      name: 'logo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect width="4" height="4"/></svg>',
      ),
    });
    await expect(rows.last().locator('img')).toBeVisible(); // logo preview
    await save(page);

    await openUntil(page, '/en/about', async () => {
      await quick(page.getByText(intro)).toBeVisible();
      await quick(page.getByRole('img', { name: 'E2E tool logo' })).toBeVisible();
    });

    // Put everything back, so local review data is left as it was.
    await page.goto('/admin/about');
    await page.locator('#field-intro-en').fill(original);
    await rows.last().getByRole('button', { name: 'Remove tool' }).click();
    await expect(rows).toHaveCount(before);
    await save(page);
  });

  test('"Why choose us" points are edited in settings', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Shared document: run in one project only');
    const title = `E2E point ${Date.now()}`;
    await signInAsAdmin(page);
    await page.goto('/admin/settings');
    const points = page.getByRole('group', { name: 'Home page: "Why choose us" points' });
    await points.getByRole('button', { name: 'Add a point' }).click();
    await points.getByLabel('Title (EN)').last().fill(title);
    await points.getByLabel('Text (EN)').last().fill('E2E point text.');
    await save(page);

    await openUntil(page, '/en', () =>
      quick(
        page.getByRole('region', { name: 'Why choose us' }).getByRole('heading', { name: title }),
      ).toBeVisible(),
    );

    // Remove it again, so local review data is left as it was.
    await page.goto('/admin/settings');
    await points.getByRole('button', { name: 'Remove this point' }).last().click();
    await save(page);
  });

  test('legal pages are edited in admin (starting from the drafts)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Shared document: run in one project only');
    const marker = `E2E privacy line ${Date.now()}`;
    await signInAsAdmin(page);
    await page.goto('/admin/legal');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Legal pages');
    const privacy = page.locator('#field-privacy-en');
    await expect(privacy).toHaveValue(/DRAFT – review before launch/);
    const original = await privacy.inputValue();
    await privacy.fill(`${original}\n\n${marker}`);
    await save(page);

    await openUntil(page, '/en/privacy', () => quick(page.getByText(marker)).toBeVisible());

    // Put the text back, so local review data is left as it was.
    await page.goto('/admin/legal');
    await page.locator('#field-privacy-en').fill(original);
    await save(page);
  });

  test('company info: impact numbers are edited in admin', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Shared document: run in one project only');
    const label = `E2E projects ${Date.now()}`;
    await signInAsAdmin(page);
    await page.goto('/admin/company');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Company info');
    const impact = page.getByRole('group', { name: 'Impact numbers' });
    await impact.getByRole('button', { name: 'Add: Number' }).click();
    const item = impact.locator('ol > li').last();
    await item.getByRole('textbox', { name: 'Number' }).fill('42+');
    await item.getByLabel('English', { exact: true }).fill(label);
    await save(page);

    await openUntil(page, '/en', () =>
      quick(
        page.getByRole('region', { name: 'Our impact in numbers' }).getByText(label),
      ).toBeVisible(),
    );
    await expect(
      page.getByRole('region', { name: 'Our impact in numbers' }).getByText('42+').first(),
    ).toBeVisible();

    // Remove it again, so local review data is left as it was.
    await page.goto('/admin/company');
    await impact
      .locator('ol > li')
      .last()
      .getByRole('button', { name: /^Remove Number/ })
      .click();
    await save(page);
  });
});

test('/api/revalidate refuses requests without the secret', async ({ request }) => {
  const res = await request.post('/api/revalidate');
  expect(res.status()).toBe(401);
});

test('missing Swahili is flagged in lists and the editor (FR-9)', async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto('/admin/content/services');
  // SAMPLE services have English-only summaries, so they are flagged.
  await expect(page.getByText('Swahili missing').first()).toBeVisible();
  await expect(page.getByText(/items still need Swahili text/)).toBeVisible();

  await page.goto('/admin/content/services/new');
  await page.locator('#field-title-en').fill('Only English');
  const notice = page.getByText('Swahili text is missing in these fields', { exact: false });
  await expect(notice).toBeVisible();
  await expect(notice.locator('xpath=following-sibling::p[1]')).toHaveText('Title');
  await page.locator('#field-title-sw').fill('Kiswahili pia');
  await expect(notice).toBeHidden();
});
