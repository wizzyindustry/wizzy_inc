import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { siteSettingsSchema, type SiteSettings } from '@/lib/schemas/content';
import { parseDoc } from './read';

/**
 * Site-wide settings (contact details, hero text). Null until the owner fills them in via admin.
 * Used by the layout on every page, so a read failure (e.g. no Firestore during a CI build)
 * degrades to null instead of breaking every page. ISR refreshes it later.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const snap = await adminDb().doc('settings/site').get();
    return parseDoc(siteSettingsSchema, snap);
  } catch (error) {
    console.error('[data] settings/site unavailable:', (error as Error).message);
    return null;
  }
}
