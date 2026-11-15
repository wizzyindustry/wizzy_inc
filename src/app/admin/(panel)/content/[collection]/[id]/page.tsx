import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';
import { docIdSchema, isContentCollection } from '@/lib/schemas/content-admin';

type Props = { params: Promise<{ collection: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  const t = await getTranslations('Admin.content.edit');
  return { title: isContentCollection(collection) ? t(collection) : undefined };
}

/** Edit one item; /new creates one. */
export default async function AdminContentEditPage({ params }: Props) {
  const { collection, id } = await params;
  if (!isContentCollection(collection) || (id !== 'new' && !docIdSchema.safeParse(id).success)) {
    notFound();
  }
  return <ContentEditor key={`${collection}/${id}`} kind={collection} id={id} />;
}
