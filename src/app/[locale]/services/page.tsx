import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ServiceCard } from '@/components/services/ServiceCard';
import { orFallback } from '@/lib/data/read';
import { getPublishedServices } from '@/lib/data/services';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import type { ServiceCategory } from '@/lib/schemas/common';

type Props = { params: Promise<{ locale: string }> };

const CATEGORIES: ServiceCategory[] = ['graphic-design', 'web-development'];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Services.meta' });
  return pageMetadata({
    locale,
    path: '/services',
    title: t('title'),
    description: t('description'),
  });
}

/** Services overview (F2): both categories with their published sub-services. */
export default async function ServicesPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Services');
  const tCat = await getTranslations('Categories');
  const services = await orFallback(getPublishedServices(), [], 'services');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>

      {services.length === 0 && <p className="mt-10 rounded-md bg-muted p-4">{t('empty')}</p>}

      {CATEGORIES.map((category) => {
        const items = services.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <section
            key={category}
            id={category}
            aria-labelledby={`${category}-heading`}
            className="mt-12 scroll-mt-24"
          >
            <h2 id={`${category}-heading`} className="font-display text-2xl font-bold">
              {tCat(`${category}.title`)}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {tCat(`${category}.description`)}
            </p>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service) => (
                <li key={service.id}>
                  <ServiceCard service={service} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
