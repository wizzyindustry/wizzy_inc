import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SubscribersList } from '@/components/admin/SubscribersList';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.subscribers');
  return { title: t('heading') };
}

/** Newsletter subscribers ("Stay updated" form). Loads in the browser with the admin's sign-in. */
export default async function AdminSubscribersPage() {
  const t = await getTranslations('Admin.subscribers');
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">{t('heading')}</h1>
      <p className="max-w-3xl text-muted-foreground">{t('intro')}</p>
      <SubscribersList />
    </div>
  );
}
