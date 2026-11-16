import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { companySchema, type Company } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/**
 * Company facts from `settings/company` (story, fact cards, partners, impact, offices).
 * Null until the owner saves them in admin; a read failure also degrades to null.
 */
export const getCompany = cache(async (): Promise<Company | null> =>
  orFallback(
    adminDb()
      .doc('settings/company')
      .get()
      .then((snap) => parseDoc(companySchema, snap)),
    null,
    'settings/company',
  ),
);
