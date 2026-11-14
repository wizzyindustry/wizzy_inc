import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PackageCard } from '@/components/pricing/PackageCard';
import { Button } from '@/components/ui/Button';
import { getPublishedPackages } from '@/lib/data/packages';
import { orFallback } from '@/lib/data/read';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';
import type { ServiceCategory } from '@/lib/schemas/common';

type Props = { params: Promise<{ locale: string }> };

const CATEGORIES: ServiceCategory[] = ['graphic-design', 'web-development'];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Pricing.meta' });
  return pageMetadata({
    locale,
    path: '/pricing',
    title: t('title'),
    description: t('description'),
  });
}

/** Pricing (F5): Basic / Standard / Premium per category, prices from Firestore (FR-1). */
export default async function PricingPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Pricing');
  const tCat = await getTranslations('Categories');
  const packages = await orFallback(getPublishedPackages(), [], 'packages');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>

      {packages.length === 0 && <p className="mt-10 rounded-md bg-muted p-4">{t('empty')}</p>}

      {CATEGORIES.map((category) => {
        const tiers = packages.filter((p) => p.category === category);
        if (tiers.length === 0) return null;
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
            <ul className="mt-8 grid gap-8 md:grid-cols-3">
              {tiers.map((pkg) => (
                <li key={pkg.id}>
                  <PackageCard pkg={pkg} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-14 rounded-lg bg-muted p-6">
        <h2 className="text-xl font-semibold">{t('custom.heading')}</h2>
        <p className="mt-2 text-muted-foreground">{t('custom.description')}</p>
        <Button asChild className="mt-4">
          <Link href="/quote">{t('custom.button')}</Link>
        </Button>
      </section>

      <p className="mt-6 text-sm text-muted-foreground">{t('note')}</p>
    </div>
  );
}
