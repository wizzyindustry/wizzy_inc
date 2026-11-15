import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AdminWelcome } from '@/components/admin/AdminWelcome';
import { Button } from '@/components/ui/Button';

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
      <Button asChild className="self-start">
        <Link href="/admin/leads">{t('openLeads')}</Link>
      </Button>
      <p className="text-muted-foreground">{t('comingSoon')}</p>
    </div>
  );
}
