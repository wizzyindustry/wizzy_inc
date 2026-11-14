import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { PortfolioFilter } from '@/components/portfolio/PortfolioFilter';
import { getPublishedPortfolio } from '@/lib/data/portfolio';
import { orFallback } from '@/lib/data/read';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import type { ServiceCategory } from '@/lib/schemas/common';

type Props = { params: Promise<{ locale: string }> };

const CATEGORIES: ServiceCategory[] = ['graphic-design', 'web-development'];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Portfolio.meta' });
  return pageMetadata({
    locale,
    path: '/portfolio',
    title: t('title'),
    description: t('description'),
  });
}

/** Portfolio grid (F4) with client-side category filter (FR-7). */
export default async function PortfolioPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Portfolio');
  const tCat = await getTranslations('Categories');
  const items = await orFallback(getPublishedPortfolio(), [], 'portfolio');

  // Status text is pre-translated for every possible count so the client needs no messages.
  const statusByCount = Object.fromEntries(
    Array.from({ length: items.length + 1 }, (_, n) => [n, t('showing', { count: n })]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>

      {items.length === 0 ? (
        <p className="mt-10 rounded-md bg-muted p-4">{t('empty')}</p>
      ) : (
        <div className="mt-8">
          <PortfolioFilter
            groupLabel={t('filterLabel')}
            options={[
              { id: 'all', label: t('all') },
              ...CATEGORIES.map((c) => ({ id: c, label: tCat(`${c}.title`) })),
            ]}
            statusByCount={statusByCount}
            items={items.map((item) => ({
              id: item.id,
              category: item.category,
              card: <PortfolioCard item={item} locale={locale} />,
            }))}
          />
        </div>
      )}
    </div>
  );
}
