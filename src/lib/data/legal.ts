import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { LEGAL_DRAFT_DATE, LEGAL_DRAFTS } from '@/lib/legal/drafts';
import { legalPagesSchema, type LegalPages } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

const DRAFTS: LegalPages = { ...LEGAL_DRAFTS, lastUpdated: LEGAL_DRAFT_DATE };

/**
 * Legal pages from `settings/legal`. Until the owner saves them in admin (or if the read
 * fails), the built-in drafts are shown, so the pages are never empty.
 */
export const getLegalPages = cache(
  async (): Promise<LegalPages> =>
    (await orFallback(
      adminDb()
        .doc('settings/legal')
        .get()
        .then((snap) => parseDoc(legalPagesSchema, snap)),
      null,
      'settings/legal',
    )) ?? DRAFTS,
);
