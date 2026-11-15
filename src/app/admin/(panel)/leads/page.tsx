import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LeadsInbox } from '@/components/admin/LeadsInbox';
import { getServiceTitles } from '@/lib/data/service-titles';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.leads');
  return { title: t('heading') };
}

/** Leads inbox (A2). The list itself loads in the browser with the admin's sign-in. */
export default async function AdminLeadsPage() {
  const t = await getTranslations('Admin.leads');
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">{t('heading')}</h1>
      <LeadsInbox serviceTitles={await getServiceTitles()} />
    </div>
  );
}
