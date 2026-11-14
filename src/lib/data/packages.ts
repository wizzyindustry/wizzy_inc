import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import type { ServiceCategory } from '@/lib/schemas/common';
import { packageSchema, type Package } from '@/lib/schemas/content';
import { queryDocs } from './read';

export async function getPublishedPackages(category?: ServiceCategory): Promise<Package[]> {
  let query = adminDb().collection('packages').where('published', '==', true);
  if (category) query = query.where('category', '==', category);
  const packages = await queryDocs(packageSchema, query);
  return packages.sort((a, b) => a.order - b.order);
}
