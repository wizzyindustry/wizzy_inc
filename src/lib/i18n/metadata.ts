import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { routing, type Locale } from './routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Narrow a route param to a supported locale (layout already 404s unknown ones). */
export function toLocale(requested: string): Locale {
  return hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
}

type PageMeta = { locale: Locale; path: string; title: string; description: string };

/**
 * Standard metadata for a public page: canonical, hreflang alternates and Open Graph.
 * `path` is locale-less, e.g. "" for home or "/services/logo-design".
 */
export function pageMetadata({ locale, path, title, description }: PageMeta): Metadata {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`]));
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages },
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      locale: locale === 'sw' ? 'sw_TZ' : 'en_TZ',
      type: 'website',
    },
  };
}
