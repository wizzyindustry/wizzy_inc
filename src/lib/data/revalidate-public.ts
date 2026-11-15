import 'server-only';
import { revalidatePath } from 'next/cache';

/**
 * Refresh every public page (both locales) and the sitemap after content changes, so
 * admin edits appear straight away instead of after the hourly ISR refresh.
 */
export function revalidatePublicPages(): void {
  revalidatePath('/[locale]', 'layout');
  revalidatePath('/sitemap.xml');
}
