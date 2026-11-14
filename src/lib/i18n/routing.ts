import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'sw'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

/** Locale tag for Intl formatting (routes use `sw`, Intl uses `sw-TZ`). */
export function intlLocale(locale: Locale): 'en-TZ' | 'sw-TZ' {
  return locale === 'sw' ? 'sw-TZ' : 'en-TZ';
}
