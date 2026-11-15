import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Service, SiteSettings } from '@/lib/schemas/content';
import { businessJsonLd, faqJsonLd, serializeJsonLd, serviceJsonLd } from '@/lib/seo/json-ld';
import { OG_COLORS } from '@/lib/seo/og-colors';
import { absoluteUrl } from '@/lib/seo/site-url';
import { buildSitemap, STATIC_PATHS } from '@/lib/seo/sitemap';

const BASE = 'https://example.test';

describe('buildSitemap (FR-11)', () => {
  it('lists every path in both locales with hreflang alternates', () => {
    const updated = new Date('2026-11-01T00:00:00Z');
    const entries = buildSitemap(
      [{ path: '' }, { path: '/services/logo-design', lastModified: updated }],
      BASE,
    );
    expect(entries.map((e) => e.url)).toEqual([
      'https://example.test/en',
      'https://example.test/sw',
      'https://example.test/en/services/logo-design',
      'https://example.test/sw/services/logo-design',
    ]);
    expect(entries[3]?.alternates?.languages).toEqual({
      en: 'https://example.test/en/services/logo-design',
      sw: 'https://example.test/sw/services/logo-design',
      'x-default': 'https://example.test/en/services/logo-design',
    });
    expect(entries[2]?.lastModified).toEqual(updated);
    expect(entries[0]).not.toHaveProperty('lastModified');
  });

  it('includes every public page but not the noindex thank-you page', () => {
    expect(STATIC_PATHS).toEqual(
      expect.arrayContaining([
        '',
        '/services',
        '/portfolio',
        '/pricing',
        '/about',
        '/contact',
        '/faq',
      ]),
    );
    expect(STATIC_PATHS).not.toContain('/quote/success');
  });
});

describe('absoluteUrl', () => {
  it('joins base and path with exactly one slash', () => {
    expect(absoluteUrl('/en', BASE)).toBe('https://example.test/en');
    expect(absoluteUrl('sitemap.xml', BASE)).toBe('https://example.test/sitemap.xml');
  });
});

describe('JSON-LD', () => {
  it('escapes "<" so stored text cannot close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });

  it('business: Dodoma address always; phone, email and socials only from settings', () => {
    const bare = businessJsonLd(null, 'sw', 'D');
    expect(bare).toMatchObject({
      '@type': 'ProfessionalService',
      address: { addressLocality: 'Dodoma', addressCountry: 'TZ' },
    });
    expect(bare).not.toHaveProperty('telephone');
    expect(bare).not.toHaveProperty('sameAs');

    const settings = {
      phone: '+255700000000',
      email: 'hello@example.test',
      socialLinks: { instagram: 'https://instagram.com/example' },
    } as unknown as SiteSettings;
    expect(businessJsonLd(settings, 'en', 'D')).toMatchObject({
      telephone: '+255700000000',
      email: 'hello@example.test',
      sameAs: ['https://instagram.com/example'],
    });
  });

  const service = {
    slug: 'logo-design',
    title: { en: 'Logo design', sw: 'Usanifu wa nembo' },
    summary: { en: 'Logos', sw: '' },
    startingPriceTZS: 50_000,
    faq: [{ q: { en: 'How long?', sw: 'Muda gani?' }, a: { en: 'A week.', sw: 'Wiki.' } }],
  } as unknown as Service;

  it('service: localized name, starting price in TZS', () => {
    expect(serviceJsonLd(service, 'sw')).toMatchObject({
      '@type': 'Service',
      name: 'Usanifu wa nembo',
      description: 'Logos', // empty sw falls back to en
      offers: { priceSpecification: { minPrice: 50_000, priceCurrency: 'TZS' } },
    });
  });

  it('FAQ: one Question per item, none when empty', () => {
    expect(faqJsonLd(service.faq, 'en')).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [{ name: 'How long?', acceptedAnswer: { text: 'A week.' } }],
    });
    expect(faqJsonLd([], 'en')).toBeNull();
  });
});

describe('generated image colours', () => {
  it('match the theme tokens', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8');
    const token = (name: string) =>
      css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]?.toLowerCase();
    expect(OG_COLORS.primary).toBe(token('primary'));
    expect(OG_COLORS.primaryForeground).toBe(token('primary-foreground'));
  });
});
