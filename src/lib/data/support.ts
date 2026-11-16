import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { supportPageSchema, type SupportPage } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/** Support page text from `settings/support`; null until saved (built-in text is shown). */
export const getSupportPage = cache(async (): Promise<SupportPage | null> =>
  orFallback(
    adminDb()
      .doc('settings/support')
      .get()
      .then((snap) => parseDoc(supportPageSchema, snap)),
    null,
    'settings/support',
  ),
);
