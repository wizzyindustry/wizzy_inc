import { describe, expect, it } from 'vitest';
import { CONTENT_FIELDS, fieldTextKey } from '@/components/admin/content/fields';
import { getPath, setPath, toFormValues, toSaveData } from '@/components/admin/content/form-values';
import {
  contentFieldErrors,
  contentInputSchemas,
  portfolioPathsValid,
  settingsInputSchema,
} from '@/lib/schemas/content-admin';
import en from '../../messages/en.json';
import sw from '../../messages/sw.json';

describe('path helpers', () => {
  it('get and set nested paths without mutating', () => {
    const original = { hero: { headline: { en: 'A', sw: '' } } };
    const next = setPath(original, 'hero.headline.en', 'B');
    expect(getPath(next, 'hero.headline.en')).toBe('B');
    expect(original.hero.headline.en).toBe('A');
  });
});

describe('editor values (A4)', () => {
  const service = {
    slug: 'logo-design',
    category: 'graphic-design',
    title: { en: 'Logo design', sw: 'Usanifu wa nembo' },
    summary: { en: 'Logos', sw: '' },
    body: { en: '**Bold**', sw: '' },
    inclusions: { en: ['3 concepts', 'Source files'], sw: [] },
    turnaroundDays: { min: 3, max: 7 },
    startingPriceTZS: 50_000,
    icon: 'palette',
    order: 1,
    published: true,
    faq: [{ q: { en: 'Q?', sw: '' }, a: { en: 'A.', sw: '' } }],
    updatedAt: new Date(),
  };

  it('round-trips a service through the form unchanged', () => {
    const fields = CONTENT_FIELDS.services;
    const form = toFormValues(fields, service);
    expect(getPath(form, 'startingPriceTZS')).toBe('50000'); // inputs hold strings
    expect(getPath(form, 'inclusions.en')).toBe('3 concepts\nSource files');
    const saved = toSaveData(fields, form);
    const expected: Record<string, unknown> = { ...service };
    delete expected.updatedAt; // set by the server, not the editor
    expect(saved).toEqual(expected);
    expect(contentInputSchemas.services.safeParse(saved).success).toBe(true);
  });

  it('a blank new service is rejected with field paths', () => {
    const saved = toSaveData(CONTENT_FIELDS.services, toFormValues(CONTENT_FIELDS.services, null));
    const result = contentInputSchemas.services.safeParse(saved);
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = contentFieldErrors(result.error);
    expect(errors).toHaveProperty(['title.en'], 'invalidField');
    expect(errors).toHaveProperty('slug');
  });

  it('portfolio: date becomes a Date; empty optional fields are dropped', () => {
    const fields = CONTENT_FIELDS.portfolio;
    let form = toFormValues(fields, null);
    for (const [path, value] of Object.entries({
      'title.en': 'Salon logo',
      slug: 'salon-logo',
      clientType: 'Salon',
      'problem.en': 'No brand',
      'solution.en': 'A logo',
      tools: 'Illustrator\n\nFigma ',
      coverImage: 'portfolio/abc/cover.png',
      completedAt: '2026-03-15',
    })) {
      form = setPath(form, path, value);
    }
    const saved = toSaveData(fields, form);
    expect(saved).not.toHaveProperty('result');
    expect(saved).not.toHaveProperty('liveUrl');
    expect(saved.tools).toEqual(['Illustrator', 'Figma']);
    const parsed = contentInputSchemas.portfolio.parse(saved);
    expect(parsed.completedAt).toBeInstanceOf(Date);
    expect(parsed.completedAt.toISOString()).toBe('2026-03-15T09:00:00.000Z');
  });

  it('portfolio links: only the fields for the category are saved', () => {
    const fields = CONTENT_FIELDS.portfolio;
    let form = toFormValues(fields, null);
    form = setPath(form, 'category', 'graphic-design');
    form = setPath(form, 'liveUrl', 'https://example.com/');
    form = setPath(form, 'repoUrl', 'https://example.com/repo');
    form = setPath(form, 'designUrl', 'https://example.com/design');
    const design = toSaveData(fields, form);
    expect(design.designUrl).toBe('https://example.com/design');
    expect(design).not.toHaveProperty('liveUrl');
    expect(design).not.toHaveProperty('repoUrl');

    const web = toSaveData(fields, setPath(form, 'category', 'web-development'));
    expect(web.liveUrl).toBe('https://example.com/');
    expect(web.repoUrl).toBe('https://example.com/repo');
    expect(web).not.toHaveProperty('designUrl');
  });

  it('links must be http(s) web addresses (no javascript: links)', () => {
    const links = contentInputSchemas.portfolio.shape.repoUrl;
    expect(links.safeParse('https://github.com/me/site').success).toBe(true);
    expect(links.safeParse('javascript:alert(1)').success).toBe(false);
    expect(links.safeParse('data:text/html,hi').success).toBe(false);
    expect(links.safeParse('github.com/me/site').success).toBe(false);
  });

  it('testimonial: rating select is numeric; consent is required', () => {
    const fields = CONTENT_FIELDS.testimonials;
    let form = toFormValues(fields, null);
    form = setPath(form, 'name', 'Client');
    form = setPath(form, 'quote', { en: 'Great work', sw: '' });
    form = setPath(form, 'rating', '5');
    const saved = toSaveData(fields, form);
    expect(saved.rating).toBe(5);
    expect(saved).not.toHaveProperty('company');
    expect(contentInputSchemas.testimonials.safeParse(saved).success).toBe(false); // no consent
    expect(
      contentInputSchemas.testimonials.safeParse({ ...saved, consentGiven: true }).success,
    ).toBe(true);
  });

  it('settings: empty social links are dropped, WhatsApp format is enforced', () => {
    const fields = CONTENT_FIELDS.settings;
    let form = toFormValues(fields, null);
    for (const [path, value] of Object.entries({
      'hero.headline.en': 'H',
      'hero.subheadline.en': 'S',
      phone: '+255 700 000 000',
      whatsappNumber: '255700000000',
      email: 'owner@example.test',
      'location.en': 'Dodoma',
      'workingHours.en': 'Mon–Sat',
      'socialLinks.instagram': 'https://instagram.com/example',
    })) {
      form = setPath(form, path, value);
    }
    const saved = toSaveData(fields, form);
    expect(saved.socialLinks).toEqual({ instagram: 'https://instagram.com/example' });
    expect(settingsInputSchema.safeParse(saved).success).toBe(true);
    expect(settingsInputSchema.safeParse({ ...saved, whatsappNumber: '+255 700' }).success).toBe(
      false,
    );
  });
});

describe('portfolioPathsValid (A5)', () => {
  it('only allows files inside the item folder', () => {
    expect(portfolioPathsValid('abc', ['portfolio/abc/1-cover.png'])).toBe(true);
    expect(portfolioPathsValid('abc', ['portfolio/other/1.png'])).toBe(false);
    expect(portfolioPathsValid('abc', ['quotes/abc/1.pdf'])).toBe(false);
    expect(portfolioPathsValid('abc', ['portfolio/abc/../../quotes/x.pdf'])).toBe(false);
  });
});

describe('editor labels', () => {
  it('every field has a label (and hint where used) in both languages', () => {
    for (const messages of [en, sw]) {
      const content = messages.Admin.content as {
        fields: Record<string, string>;
        hints: Record<string, string>;
      };
      for (const fields of Object.values(CONTENT_FIELDS)) {
        for (const field of fields) {
          const key = fieldTextKey(field);
          expect(content.fields, key).toHaveProperty(key);
          if (field.hint) expect(content.hints, key).toHaveProperty(key);
        }
      }
    }
  });
});
