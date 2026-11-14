import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CtaBanner } from '@/components/sections/CtaBanner';
import { FeaturedWork } from '@/components/sections/FeaturedWork';
import { Hero } from '@/components/sections/Hero';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { ServiceCategoryCards } from '@/components/sections/ServiceCategoryCards';
import { Testimonials } from '@/components/sections/Testimonials';
import { getFeaturedPortfolio } from '@/lib/data/portfolio';
import { orFallback } from '@/lib/data/read';
import { getPublishedServices } from '@/lib/data/services';
import { getSiteSettings } from '@/lib/data/settings';
import { getPublishedTestimonials } from '@/lib/data/testimonials';
import { localized } from '@/lib/i18n/localized';
import { routing, type Locale } from '@/lib/i18n/routing';

type Props = { params: Promise<{ locale: string }> };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

function toLocale(requested: string): Locale {
  return hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
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

/** Home page (F1). Every section is optional so a missing collection never breaks the page. */
export default async function HomePage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('HomePage.hero');

  const [settings, services, featured, testimonials] = await Promise.all([
    getSiteSettings(),
    orFallback(getPublishedServices(), [], 'services'),
    orFallback(getFeaturedPortfolio(), [], 'featured portfolio'),
    orFallback(getPublishedTestimonials(), [], 'testimonials'),
  ]);

  return (
    <>
      <Hero
        headline={settings ? localized(settings.hero.headline, locale) : t('headline')}
        subheadline={settings ? localized(settings.hero.subheadline, locale) : t('subheadline')}
      />
      <ServiceCategoryCards services={services} locale={locale} />
      <FeaturedWork items={featured} locale={locale} />
      <ProcessSteps />
      <Testimonials testimonials={testimonials} locale={locale} />
      <CtaBanner />
    </>
  );
}
