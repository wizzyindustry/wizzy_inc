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

    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(headline);

    // Put the original headline back, so local review data is left as it was.
    await page.goto('/admin/settings');
    await page.locator('#field-hero_headline-en').fill(original);
    await save(page);
  });

  test('the About page text is edited in admin', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'Shared document: run in one project only');
    const intro = `E2E about intro ${Date.now()}`;
    await signInAsAdmin(page);
    await page.goto('/admin/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About page');
    const field = page.locator('#field-intro-en');
    const original = await field.inputValue();
    const tools = page.locator('#field-tools');
    const originalTools = await tools.inputValue();
    await field.fill(intro);
    await tools.fill('Adobe Illustrator\nE2E tool');
    await save(page);

    await page.goto('/en/about');
    await expect(page.getByText(intro)).toBeVisible();
    await expect(page.getByText('E2E tool', { exact: true })).toBeVisible();

    await page.goto('/admin/about');
    await page.locator('#field-intro-en').fill(original);
    await page.locator('#field-tools').fill(originalTools);
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
