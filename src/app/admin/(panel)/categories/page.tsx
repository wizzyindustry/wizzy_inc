import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('categories') };
}

/** Portfolio categories: the filter buttons on the portfolio page (settings/categories). */
export default function AdminCategoriesPage() {
  return <ContentEditor kind="categories" id="categories" />;
}
