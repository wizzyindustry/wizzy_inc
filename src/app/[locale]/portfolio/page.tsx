import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GithubProjects } from '@/components/portfolio/GithubProjects';
import { PinterestPins } from '@/components/portfolio/PinterestPins';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { PortfolioFilter } from '@/components/portfolio/PortfolioFilter';
import { getGithubProjects } from '@/lib/data/github';
import { getPinterestPins } from '@/lib/data/pinterest';
import { getPublishedPortfolio } from '@/lib/data/portfolio';
import { getPortfolioCategories } from '@/lib/data/portfolio-categories';
import { orFallback } from '@/lib/data/read';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { categoryName } from '@/lib/portfolio/categories';

type Props = { params: Promise<{ locale: string }> };

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

/** Portfolio grid (F4) with category filter (FR-7), then Pinterest pins and GitHub repos. */
export default async function PortfolioPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Portfolio');
  const [items, categories, github, pinterest] = await Promise.all([
    orFallback(getPublishedPortfolio(), [], 'portfolio'),
    getPortfolioCategories(),
    getGithubProjects(),
    getPinterestPins(),
  ]);
  // Filter buttons: categories in the admin's order that have at least one project.
  const used = new Set(items.map((item) => item.category));
  const options = [
    ...categories.filter((c) => used.has(c.slug)).map((c) => c.slug),
    ...[...used].filter((slug) => !categories.some((c) => c.slug === slug)), // deleted categories
  ].map((slug) => ({ id: slug, label: categoryName(slug, categories, locale) }));

  // Status text is pre-translated for every possible count so the client needs no messages.
  const statusByCount = Object.fromEntries(
    Array.from({ length: items.length + 1 }, (_, n) => [n, t('showing', { count: n })]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>

      {items.length === 0 ? (
        github.repos.length === 0 &&
        pinterest.pins.length === 0 && <p className="mt-10 rounded-md bg-muted p-4">{t('empty')}</p>
      ) : (
        <div className="mt-8">
          <PortfolioFilter
            groupLabel={t('filterLabel')}
            options={[{ id: 'all', label: t('all') }, ...options]}
            statusByCount={statusByCount}
            items={items.map((item) => ({
              id: item.id,
              category: item.category,
              card: <PortfolioCard item={item} locale={locale} />,
            }))}
          />
        </div>
      )}

      <PinterestPins
        pins={pinterest.pins}
        username={pinterest.settings?.username ?? ''}
        variant="portfolio"
      />
      <GithubProjects
        repos={github.repos}
        username={github.settings?.username ?? ''}
        locale={locale}
        variant="portfolio"
      />
    </div>
  );
}
