import 'server-only';
import { localized } from '@/lib/i18n/localized';
import { orFallback } from './read';
import { getPublishedServices } from './services';

/** slug -> English title, for showing services by name in the admin. */
export async function getServiceTitles(): Promise<Record<string, string>> {
  const services = await orFallback(getPublishedServices(), [], 'service titles');
  return Object.fromEntries(services.map((s) => [s.slug, localized(s.title, 'en')]));
}
