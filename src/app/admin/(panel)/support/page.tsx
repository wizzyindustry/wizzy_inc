import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('support') };
}

/** Support page text and help topics (settings/support). */
export default function AdminSupportPage() {
  return <ContentEditor kind="support" id="support" />;
}
