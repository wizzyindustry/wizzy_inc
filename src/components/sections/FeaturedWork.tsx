import { getTranslations } from 'next-intl/server';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { PortfolioItem } from '@/lib/schemas/content';

type Props = { items: PortfolioItem[]; locale: Locale };

/** Featured portfolio items. Renders nothing until the owner features real work. */
export async function FeaturedWork({ items, locale }: Props) {
  if (items.length === 0) return null;
  const t = await getTranslations('HomePage.featured');

  return (
    <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="featured-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <Link
          href="/portfolio"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('viewAll')}
        </Link>
      </div>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <PortfolioCard item={item} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
