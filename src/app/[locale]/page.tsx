import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SubscribeForm } from '@/components/forms/SubscribeForm';
import { GithubProjects } from '@/components/portfolio/GithubProjects';
import { JsonLd } from '@/components/seo/JsonLd';
import { FeaturedWork } from '@/components/sections/FeaturedWork';
import { GetInTouch } from '@/components/sections/GetInTouch';
import { Hero } from '@/components/sections/Hero';
import { HomeFaq } from '@/components/sections/HomeFaq';
import { ImpactNumbers } from '@/components/sections/ImpactNumbers';
import { OurStory } from '@/components/sections/OurStory';
import { PartnersMarquee } from '@/components/sections/PartnersMarquee';
import { ProcessSteps } from '@/components/sections/ProcessSteps';
import { ServiceFlipCards } from '@/components/sections/ServiceFlipCards';
import { Testimonials } from '@/components/sections/Testimonials';
import { VisitOffice } from '@/components/sections/VisitOffice';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { getAboutPage } from '@/lib/data/about';
import { getCompany } from '@/lib/data/company';
import { getGithubProjects } from '@/lib/data/github';
import { getFeaturedPortfolio } from '@/lib/data/portfolio';
import { orFallback } from '@/lib/data/read';
import { getPublishedServices } from '@/lib/data/services';
import { getSiteSettings } from '@/lib/data/settings';
import { getPublishedTestimonials } from '@/lib/data/testimonials';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { businessJsonLd } from '@/lib/seo/json-ld';
import { resolveWhatsAppNumber } from '@/lib/utils/whatsapp';

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
  const tAbout = await getTranslations('About');

  const [settings, about, company, services, featured, testimonials, github] = await Promise.all([
    getSiteSettings(),
    getAboutPage(),
    getCompany(),
    orFallback(getPublishedServices(), [], 'services'),
    orFallback(getFeaturedPortfolio(), [], 'featured portfolio'),
    orFallback(getPublishedTestimonials(), [], 'testimonials'),
    getGithubProjects(),
  ]);
  const text = (value: { en: string; sw: string } | undefined) =>
    value ? localized(value, locale) || undefined : undefined;
  // "Our story" until the owner writes it: the About introduction.
  const story = text(company?.story) ?? (about ? localized(about.intro, locale) : tAbout('intro'));

  return (
    <>
      <JsonLd data={businessJsonLd(settings, locale, tMeta('description'))} />
      <Hero
        headline={settings ? localized(settings.hero.headline, locale) : t('headline')}
        subheadline={settings ? localized(settings.hero.subheadline, locale) : t('subheadline')}
        image={settings?.hero.image}
      />
      <OurStory
        story={story}
        foundedYear={company?.foundedYear}
        headquarters={text(company?.headquarters)}
        founderName={company?.founderName || undefined}
      />
      <ServiceFlipCards services={services} locale={locale} />
      <PartnersMarquee partners={company?.partners ?? []} />
      <ImpactNumbers
        stats={(company?.impact ?? []).map((s) => ({
          value: s.value,
          label: localized(s.label, locale),
        }))}
      />
      <WhyChooseUs
        points={(settings?.whyChooseUs ?? []).map((p) => ({
          title: localized(p.title, locale),
          text: localized(p.text, locale),
        }))}
      />
      <FeaturedWork items={featured} locale={locale} />
      <GithubProjects
        repos={github.repos.slice(0, github.settings?.homeCount ?? 0)}
        username={github.settings?.username ?? ''}
        locale={locale}
        variant="home"
      />
      <ProcessSteps />
      <Testimonials testimonials={testimonials} locale={locale} />
      <HomeFaq
        items={(settings?.faq ?? []).map((item) => ({
          q: localized(item.q, locale),
          a: localized(item.a, locale),
        }))}
      />
      <VisitOffice
        offices={(company?.offices ?? []).map((o) => ({
          name: localized(o.name, locale),
          address: localized(o.address, locale),
          hours: text(o.hours),
          phone: o.phone || undefined,
          latitude: o.latitude,
          longitude: o.longitude,
        }))}
      />
      <GetInTouch
        phone={settings?.phone || undefined}
        email={settings?.email || undefined}
        whatsappNumber={resolveWhatsAppNumber(
          settings?.whatsappNumber,
          process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        )}
        location={text(settings?.location)}
        workingHours={text(settings?.workingHours)}
      >
        <SubscribeForm source="home" />
      </GetInTouch>
    </>
  );
}
