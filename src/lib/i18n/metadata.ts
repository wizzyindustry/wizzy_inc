import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { SITE_URL } from '@/lib/seo/site-url';
import { routing, type Locale } from './routing';

/** Narrow a route param to a supported locale (layout already 404s unknown ones). */
export function toLocale(requested: string): Locale {
  return hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
}

type PageMeta = { locale: Locale; path: string; title: string; description: string };

/**
 * Standard metadata for a public page: canonical, hreflang alternates, Open Graph and
 * Twitter card. Default share image: [locale]/opengraph-image (pages may replace it).
 * `path` is locale-less, e.g. "" for home or "/services/logo-design".
 */
export function pageMetadata({ locale, path, title, description }: PageMeta): Metadata {
  const languages = {
    ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
    'x-default': `/${routing.defaultLocale}${path}`,
  };
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages },
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      locale: locale === 'sw' ? 'sw_TZ' : 'en_TZ',
      siteName: 'Wizzy Inc',
      type: 'website',
      // A page's openGraph replaces its parent's, so the default share image is set here.
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: 'Wizzy Inc' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
