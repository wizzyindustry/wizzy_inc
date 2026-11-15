import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ContentList } from '@/components/admin/content/ContentList';
import { isContentCollection } from '@/lib/schemas/content-admin';

type Props = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  const t = await getTranslations('Admin.nav');
  return { title: isContentCollection(collection) ? t(collection) : undefined };
}

/** Services, packages, portfolio or testimonials (A4–A6). */
export default async function AdminContentListPage({ params }: Props) {
  const { collection } = await params;
  if (!isContentCollection(collection)) notFound();
  const t = await getTranslations('Admin.nav');
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">{t(collection)}</h1>
      <ContentList kind={collection} />
    </div>
  );
}
