import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'sw'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // F10: remember the visitor's language for a year (default is a session cookie, which
  // phones forget when the browser closes). Stores only "en" or "sw" — no personal data.
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});

export type Locale = (typeof routing.locales)[number];

/** Locale tag for Intl formatting (routes use `sw`, Intl uses `sw-TZ`). */
export function intlLocale(locale: Locale): 'en-TZ' | 'sw-TZ' {
  return locale === 'sw' ? 'sw-TZ' : 'en-TZ';
}
