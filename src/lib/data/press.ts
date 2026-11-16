import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { pressPageSchema, type PressPage } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/** Press page content from `settings/press`; null until the owner saves it. */
export const getPressPage = cache(async (): Promise<PressPage | null> =>
  orFallback(
    adminDb()
      .doc('settings/press')
      .get()
      .then((snap) => parseDoc(pressPageSchema, snap)),
    null,
    'settings/press',
  ),
);
