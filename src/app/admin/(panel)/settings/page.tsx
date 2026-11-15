import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.nav');
  return { title: t('settings') };
}

/** Site settings: contact details, WhatsApp number, social links, hero text. */
export default function AdminSettingsPage() {
  return <ContentEditor kind="settings" id="site" />;
}
