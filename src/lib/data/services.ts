import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import type { ServiceCategory } from '@/lib/schemas/common';
import { serviceSchema, type Service } from '@/lib/schemas/content';
import { queryDocs } from './read';

export async function getPublishedServices(category?: ServiceCategory): Promise<Service[]> {
  let query = adminDb().collection('services').where('published', '==', true);
  if (category) query = query.where('category', '==', category);
  return queryDocs(serviceSchema, query.orderBy('order'));
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const query = adminDb()
    .collection('services')
    .where('published', '==', true)
    .where('slug', '==', slug)
    .limit(1);
  const [service] = await queryDocs(serviceSchema, query);
  return service ?? null;
}
