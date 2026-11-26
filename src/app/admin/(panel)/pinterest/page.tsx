import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('pinterest') };
}

/** Pins from public Pinterest boards on the portfolio and home pages (settings/pinterest). */
export default function AdminPinterestPage() {
  return <ContentEditor kind="pinterest" id="pinterest" />;
}
