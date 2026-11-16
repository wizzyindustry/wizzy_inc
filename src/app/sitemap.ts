import type { MetadataRoute } from 'next';
import { getPublishedPortfolio } from '@/lib/data/portfolio';
import { getPublishedPosts } from '@/lib/data/posts';
import { orFallback } from '@/lib/data/read';
import { getPublishedServices } from '@/lib/data/services';
import { buildSitemap, STATIC_PATHS } from '@/lib/seo/sitemap';

export const revalidate = 3600;

/** /sitemap.xml (FR-11): static pages plus every published service, portfolio item and post. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, portfolio, posts] = await Promise.all([
    orFallback(getPublishedServices(), [], 'sitemap services'),
    orFallback(getPublishedPortfolio(), [], 'sitemap portfolio'),
    orFallback(getPublishedPosts(), [], 'sitemap posts'),
  ]);

  return buildSitemap([
    ...STATIC_PATHS.map((path) => ({ path })),
    ...services.map((s) => ({ path: `/services/${s.slug}`, lastModified: s.updatedAt })),
    ...portfolio.map((p) => ({ path: `/portfolio/${p.slug}` })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, lastModified: p.publishedAt })),
  ]);
}
