import type { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';
import { absoluteUrl } from '@/lib/seo/site-url';

/** /robots.txt (FR-11): everything public is crawlable; admin, API and thank-you pages are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', ...routing.locales.map((l) => `/${l}/quote/success`)],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
