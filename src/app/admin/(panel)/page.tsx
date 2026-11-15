import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminWelcome } from '@/components/admin/AdminWelcome';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.dashboard');
  return { title: t('heading') };
}

/** Admin home. Leads inbox (slice 14) and content management (slice 15) link from here. */
export default async function AdminDashboardPage() {
  const t = await getTranslations('Admin.dashboard');
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-bold">{t('heading')}</h1>
      <AdminWelcome />
      <p className="text-muted-foreground">{t('comingSoon')}</p>
    </div>
  );
}
