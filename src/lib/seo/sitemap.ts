import type { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';
import { absoluteUrl } from './site-url';

/** Public pages that always exist (locale-less paths). Quote success is noindex, so not here. */
export const STATIC_PATHS = [
  '',
  '/services',
  '/portfolio',
  '/pricing',
  '/about',
  '/contact',
  '/faq',
  '/offices',
  '/quote',
  '/privacy',
  '/terms',
  '/cookies',
] as const;

export type SitemapPath = { path: string; lastModified?: Date };

/**
 * One sitemap entry per locale for each path, each listing all language versions
 * (hreflang) so search engines connect the English and Swahili pages (FR-11).
 */
export function buildSitemap(paths: SitemapPath[], base?: string): MetadataRoute.Sitemap {
  return paths.flatMap(({ path, lastModified }) => {
    const languages = {
      ...Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(`/${l}${path}`, base)])),
      'x-default': absoluteUrl(`/${routing.defaultLocale}${path}`, base),
    };
    return routing.locales.map((locale) => ({
      url: absoluteUrl(`/${locale}${path}`, base),
      ...(lastModified && { lastModified }),
      alternates: { languages },
    }));
  });
}
