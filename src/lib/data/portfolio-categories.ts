import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { BUILT_IN_CATEGORIES } from '@/lib/portfolio/categories';
import { portfolioCategoriesSchema, type PortfolioCategory } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/**
 * Portfolio categories in display order (settings/categories). The built-in two until the
 * owner saves the list, or if it can't be read. Cached per request (cards share one read).
 */
export const getPortfolioCategories = cache(async (): Promise<PortfolioCategory[]> =>
  orFallback(
    adminDb()
      .doc('settings/categories')
      .get()
      .then((snap) => parseDoc(portfolioCategoriesSchema, snap)?.items ?? BUILT_IN_CATEGORIES),
    BUILT_IN_CATEGORIES,
    'settings/categories',
  ),
);
