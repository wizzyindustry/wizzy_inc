import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import type { ServiceCategory } from '@/lib/schemas/common';
import { serviceSchema, type Service } from '@/lib/schemas/content';
import { queryDocs } from './read';

export async function getPublishedServices(category?: ServiceCategory): Promise<Service[]> {
  let query = adminDb().collection('services').where('published', '==', true);
  if (category) query = query.where('category', '==', category);
  return queryDocs(serviceSchema, query.orderBy('order'));
}

/** Cached per request so generateMetadata and the page share one read. */
export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const query = adminDb()
    .collection('services')
    .where('published', '==', true)
    .where('slug', '==', slug)
    .limit(1);
  const [service] = await queryDocs(serviceSchema, query);
  return service ?? null;
});
