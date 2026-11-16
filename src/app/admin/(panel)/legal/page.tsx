import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('legal') };
}

/** Privacy Policy, Terms & Conditions and Cookie Policy (settings/legal). */
export default function AdminLegalPage() {
  return <ContentEditor kind="legal" id="legal" />;
}
