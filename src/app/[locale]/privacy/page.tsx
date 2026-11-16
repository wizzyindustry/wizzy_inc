import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalDocument, legalMetadata } from '@/components/sections/LegalDocument';
import { toLocale } from '@/lib/i18n/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata('privacy', toLocale((await params).locale));
}

/** Legal page, edited in Admin → Legal pages. */
export default async function PrivacyPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  return <LegalDocument page="privacy" locale={locale} />;
}
