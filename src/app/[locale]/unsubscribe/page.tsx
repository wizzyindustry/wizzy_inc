import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { toLocale } from '@/lib/i18n/metadata';
import { UnsubscribeButton } from './UnsubscribeButton';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Unsubscribe' });
  // Personal link from an email: never in search results.
  return { title: t('title'), robots: { index: false, follow: false } };
}

/**
 * Opened from the link in every newsletter email. Removing happens only when the visitor
 * presses the button — email link checkers that open links automatically remove nothing.
 */
export default async function UnsubscribePage({ params, searchParams }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Unsubscribe');
  const token = (await searchParams).t ?? '';

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold">{t('title')}</h1>
      <p className="mt-3 text-muted-foreground">{t('intro')}</p>
      <UnsubscribeButton token={token} />
    </div>
  );
}
