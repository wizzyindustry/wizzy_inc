import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { QuoteForm } from '@/components/forms/quote-form/QuoteForm';
import { getPublishedPackages } from '@/lib/data/packages';
import { orFallback } from '@/lib/data/read';
import { getPublishedServices } from '@/lib/data/services';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { formatTZS } from '@/lib/utils/format-tzs';
import { todayInTanzania } from '@/lib/utils/format-date';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string | string[]; package?: string | string[] }>;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'QuoteForm.meta' });
  return pageMetadata({ locale, path: '/quote', title: t('title'), description: t('description') });
}

/** Quote request (F6). Server-rendered shell; the steps are a client component. */
export default async function QuotePage({ params, searchParams }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const query = await searchParams;
  const t = await getTranslations('QuoteForm');
  const tCat = await getTranslations('Categories');
  const messages = await getMessages();

  const [services, packages] = await Promise.all([
    orFallback(getPublishedServices(), [], 'services'),
    orFallback(getPublishedPackages(), [], 'packages'),
  ]);

  // Only accept pre-fill values that really exist (FR-6).
  const requestedService = first(query.service);
  const requestedPackage = first(query.package);
  const initial = {
    serviceSlug: services.some((s) => s.slug === requestedService) ? requestedService : undefined,
    packageId: packages.some((p) => p.id === requestedPackage) ? requestedPackage : undefined,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t('intro')}</p>

      {services.length === 0 ? (
        <p className="mt-8 rounded-md bg-muted p-4">{t('unavailable')}</p>
      ) : (
        <div className="mt-8">
          <NextIntlClientProvider messages={{ QuoteForm: messages.QuoteForm }}>
            <QuoteForm
              locale={locale}
              today={todayInTanzania()}
              initial={initial}
              categoryLabels={{
                'graphic-design': tCat('graphic-design.title'),
                'web-development': tCat('web-development.title'),
              }}
              services={services.map((s) => ({
                slug: s.slug,
                title: localized(s.title, locale),
                category: s.category,
              }))}
              packages={packages.map((p) => ({
                id: p.id,
                category: p.category,
                label: `${localized(p.name, locale)} — ${t('fromPrice', {
                  price: formatTZS(p.priceTZS, locale),
                })}`,
              }))}
            />
          </NextIntlClientProvider>
        </div>
      )}
    </div>
  );
}
