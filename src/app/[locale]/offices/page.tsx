import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OfficeMap } from '@/components/sections/OfficeMap';
import { Button } from '@/components/ui/Button';
import { getCompany } from '@/lib/data/company';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'OfficesPage.meta' });
  return pageMetadata({
    locale,
    path: '/offices',
    title: t('title'),
    description: t('description'),
  });
}

/** Office locations (Company menu): every office with its address and an OpenStreetMap map. */
export default async function OfficesPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('OfficesPage');
  const offices = (await getCompany())?.offices ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>

      {offices.length === 0 ? (
        <p className="mt-8 rounded-md bg-muted p-4">{t('empty')}</p>
      ) : (
        <div className="mt-8">
          <OfficeMap
            offices={offices.map((o) => ({
              name: localized(o.name, locale),
              address: localized(o.address, locale),
              hours: o.hours ? localized(o.hours, locale) || undefined : undefined,
              phone: o.phone || undefined,
              latitude: o.latitude,
              longitude: o.longitude,
            }))}
          />
        </div>
      )}

      <section aria-labelledby="offices-contact" className="mt-12 rounded-lg bg-muted p-6">
        <h2 id="offices-contact" className="font-display text-xl font-bold">
          {t('contactHeading')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('contactText')}</p>
        <Button asChild className="mt-4">
          <Link href="/contact">{t('contactButton')}</Link>
        </Button>
      </section>
    </div>
  );
}
