import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import type { ServiceCategory } from '@/lib/schemas/common';
import { portfolioItemSchema, type PortfolioItem } from '@/lib/schemas/content';
import { queryDocs } from './read';

const published = () => adminDb().collection('portfolio').where('published', '==', true);

export async function getPublishedPortfolio(category?: ServiceCategory): Promise<PortfolioItem[]> {
  const query = category ? published().where('category', '==', category) : published();
  return queryDocs(portfolioItemSchema, query.orderBy('order'));
}

export async function getFeaturedPortfolio(limit = 6): Promise<PortfolioItem[]> {
  const items = await queryDocs(portfolioItemSchema, published().where('featured', '==', true));
  return items.sort((a, b) => a.order - b.order).slice(0, limit);
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  const [item] = await queryDocs(
    portfolioItemSchema,
    published().where('slug', '==', slug).limit(1),
  );
  return item ?? null;
}

export async function getPortfolioForService(
  serviceSlug: string,
  limit = 3,
): Promise<PortfolioItem[]> {
  const query = published().where('serviceSlugs', 'array-contains', serviceSlug);
  const items = await queryDocs(portfolioItemSchema, query);
  return items.sort((a, b) => a.order - b.order).slice(0, limit);
}
