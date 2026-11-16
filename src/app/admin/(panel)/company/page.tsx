import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('company') };
}

/** Company facts: story, fact cards, partners, impact numbers, offices (settings/company). */
export default function AdminCompanyPage() {
  return <ContentEditor kind="company" id="company" />;
}
