import { describe, expect, it } from 'vitest';
import { serviceSchema, siteSettingsSchema, testimonialSchema } from '@/lib/schemas/content';

// Clearly fake fixture data for tests only.
const service = {
  id: 's1',
  slug: 'logo-design',
  category: 'graphic-design',
  title: { en: 'Test service', sw: '' },
  summary: { en: 'Summary', sw: '' },
  body: { en: 'Body', sw: '' },
  inclusions: { en: ['One'], sw: [] },
  turnaroundDays: { min: 2, max: 5 },
  startingPriceTZS: 1000,
  icon: 'pen',
  order: 1,
  published: true,
};

describe('serviceSchema', () => {
  it('accepts a valid service and defaults faq to []', () => {
    expect(serviceSchema.parse(service).faq).toEqual([]);
  });

  it('rejects bad slugs, decimal prices and inverted turnaround', () => {
    expect(serviceSchema.safeParse({ ...service, slug: 'Logo Design' }).success).toBe(false);
    expect(serviceSchema.safeParse({ ...service, startingPriceTZS: 10.5 }).success).toBe(false);
    expect(
      serviceSchema.safeParse({ ...service, turnaroundDays: { min: 5, max: 2 } }).success,
    ).toBe(false);
  });
});

describe('testimonialSchema', () => {
  it('requires recorded consent', () => {
    const t = {
      id: 't1',
      name: 'Test',
      role: 'Owner',
      quote: { en: 'Q', sw: '' },
      published: true,
    };
    expect(testimonialSchema.safeParse({ ...t, consentGiven: true }).success).toBe(true);
    expect(testimonialSchema.safeParse({ ...t, consentGiven: false }).success).toBe(false);
  });
});

describe('siteSettingsSchema FAQ (F12)', () => {
  const base = {
    phone: '+255700000000',
    whatsappNumber: '255700000000',
    email: 'owner@example.test',
    location: { en: 'Dodoma', sw: '' },
    workingHours: { en: 'Mon–Sat', sw: '' },
    hero: { headline: { en: 'H', sw: '' }, subheadline: { en: 'S', sw: '' } },
  };

  it('defaults to no questions for settings saved before the FAQ existed', () => {
    expect(siteSettingsSchema.parse(base).faq).toEqual([]);
  });

  it('requires English for each question and answer', () => {
    const faq = [{ q: { en: 'How do I pay?', sw: '' }, a: { en: '', sw: 'Jibu' } }];
    expect(siteSettingsSchema.safeParse({ ...base, faq }).success).toBe(false);
  });
});
