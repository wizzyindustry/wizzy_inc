import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminWelcome } from '@/components/admin/AdminWelcome';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { getServiceTitles } from '@/lib/data/service-titles';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.dashboard');
  return { title: t('heading') };
}

/** Admin home: live lead activity, shortcuts and a content summary. */
export default async function AdminDashboardPage() {
  const t = await getTranslations('Admin.dashboard');
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold">{t('heading')}</h1>
        <AdminWelcome />
      </div>
      <DashboardOverview serviceTitles={await getServiceTitles()} />
    </div>
  );
}
