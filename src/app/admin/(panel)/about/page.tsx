import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('about') };
}

/** About page text (F8): introduction, skills and tools, in English and Swahili. */
export default function AdminAboutPage() {
  return <ContentEditor kind="about" id="about" />;
}
