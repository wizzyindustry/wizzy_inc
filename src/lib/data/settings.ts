import 'server-only';
import { cache } from 'react';
import { adminDb } from '@/lib/firebase/admin';
import { siteSettingsSchema, type SiteSettings } from '@/lib/schemas/content';
import { orFallback, parseDoc } from './read';

/**
 * Site-wide settings (contact details, hero text). Null until the owner fills them in via admin.
 * Used by the layout on every page, so a read failure (e.g. no Firestore during a CI build)
 * degrades to null instead of breaking every page. ISR refreshes it later.
 * Wrapped in React `cache` so layout + page share one read per request.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> =>
  orFallback(
    adminDb()
      .doc('settings/site')
      .get()
      .then((snap) => parseDoc(siteSettingsSchema, snap)),
    null,
    'settings/site',
  ),
);
