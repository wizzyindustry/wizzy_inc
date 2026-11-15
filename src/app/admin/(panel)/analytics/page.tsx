import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { getServiceTitles } from '@/lib/data/service-titles';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.analytics');
  return { title: t('heading') };
}

/** Basic analytics (A7). The numbers load in the browser with the admin's sign-in. */
export default async function AdminAnalyticsPage() {
  const t = await getTranslations('Admin.analytics');
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-bold">{t('heading')}</h1>
      <AnalyticsDashboard serviceTitles={await getServiceTitles()} />
    </div>
  );
}
