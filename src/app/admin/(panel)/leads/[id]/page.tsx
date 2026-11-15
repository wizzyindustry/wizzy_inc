import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LeadDetail } from '@/components/admin/LeadDetail';
import { getServiceTitles } from '@/lib/data/service-titles';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.leads');
  return { title: t('detailTitle') };
}

/** One lead (A2, FR-10). Linked from the owner email: /admin/leads/{leadId}. */
export default async function AdminLeadPage({ params }: Props) {
  const { id } = await params;
  return <LeadDetail leadId={id} serviceTitles={await getServiceTitles()} />;
}
