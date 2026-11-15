import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { aboutPageSchema, type AboutPage } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/**
 * About page text (F8) from `settings/about`. Null until the owner saves it in admin —
 * the page then shows its built-in text. A read failure also degrades to null.
 */
export const getAboutPage = cache(async (): Promise<AboutPage | null> =>
  orFallback(
    adminDb()
      .doc('settings/about')
      .get()
      .then((snap) => parseDoc(aboutPageSchema, snap)),
    null,
    'settings/about',
  ),
);
