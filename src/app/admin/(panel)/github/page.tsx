import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('github') };
}

/** Public GitHub repos on the portfolio and home pages (settings/github). */
export default function AdminGithubPage() {
  return <ContentEditor kind="github" id="github" />;
}
