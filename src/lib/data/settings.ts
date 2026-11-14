import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { siteSettingsSchema, type SiteSettings } from '@/lib/schemas/content';
import { parseDoc } from './read';

/** Site-wide settings (contact details, hero text). Null until the owner fills them in via admin. */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snap = await adminDb().doc('settings/site').get();
  return parseDoc(siteSettingsSchema, snap);
}
