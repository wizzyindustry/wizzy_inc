import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';

type Props = { params: Promise<{ locale: string }> };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'HomePage.meta' });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]));

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `/${locale}`, languages },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      locale: locale === 'sw' ? 'sw_TZ' : 'en_TZ',
      type: 'website',
    },
  };
}

// Phase 0 placeholder. The real home page (F1) is built in Phase 1.
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-foreground">{t('title')}</h1>
      <p className="text-lg text-muted-foreground">{t('tagline')}</p>
      <p className="rounded-md bg-muted px-4 py-3 text-muted-foreground">{t('comingSoon')}</p>
    </div>
  );
}
