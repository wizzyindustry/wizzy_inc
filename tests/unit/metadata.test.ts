import { describe, expect, it } from 'vitest';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';

describe('pageMetadata', () => {
  it('sets canonical, hreflang alternates and Open Graph for the locale', () => {
    const meta = pageMetadata({
      locale: 'sw',
      path: '/services/logo-design',
      title: 'T',
      description: 'D',
    });
    expect(meta.alternates?.canonical).toBe('/sw/services/logo-design');
    expect(meta.alternates?.languages).toEqual({
      en: '/en/services/logo-design',
      sw: '/sw/services/logo-design',
      'x-default': '/en/services/logo-design',
    });
    expect(meta.openGraph).toMatchObject({ url: '/sw/services/logo-design', locale: 'sw_TZ' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', title: 'T' });
  });
});

describe('toLocale', () => {
  it('keeps supported locales and falls back to en', () => {
    expect(toLocale('sw')).toBe('sw');
    expect(toLocale('fr')).toBe('en');
  });
});
