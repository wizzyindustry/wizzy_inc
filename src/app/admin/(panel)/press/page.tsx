import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('press') };
}

/** Press page: leadership, media resources and brand colours (settings/press). */
export default function AdminPressPage() {
  return <ContentEditor kind="press" id="press" />;
}
