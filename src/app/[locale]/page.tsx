import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
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
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { businessJsonLd } from '@/lib/seo/json-ld';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'HomePage.meta' });
  return pageMetadata({ locale, path: '', title: t('title'), description: t('description') });
}

/** Home page (F1). Every section is optional so a missing collection never breaks the page. */
export default async function HomePage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('HomePage.hero');
  const tMeta = await getTranslations('HomePage.meta');

  const [settings, services, featured, testimonials] = await Promise.all([
    getSiteSettings(),
    orFallback(getPublishedServices(), [], 'services'),
    orFallback(getFeaturedPortfolio(), [], 'featured portfolio'),
    orFallback(getPublishedTestimonials(), [], 'testimonials'),
  ]);

  return (
    <>
      <JsonLd data={businessJsonLd(settings, locale, tMeta('description'))} />
      <Hero
        headline={settings ? localized(settings.hero.headline, locale) : t('headline')}
        subheadline={settings ? localized(settings.hero.subheadline, locale) : t('subheadline')}
        image={settings?.hero.image}
      />
      <ServiceCategoryCards services={services} locale={locale} />
      <FeaturedWork items={featured} locale={locale} />
      <ProcessSteps />
      <Testimonials testimonials={testimonials} locale={locale} />
      <CtaBanner />
    </>
  );
}
