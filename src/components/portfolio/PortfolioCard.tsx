import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getPortfolioCategories } from '@/lib/data/portfolio-categories';
import { localized } from '@/lib/i18n/localized';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import { categoryName } from '@/lib/portfolio/categories';
import type { PortfolioItem } from '@/lib/schemas/content';
import { storageUrl } from '@/lib/utils/storage-url';

type Props = { item: PortfolioItem; locale: Locale };

export async function PortfolioCard({ item, locale }: Props) {
  const t = await getTranslations('Portfolio');
  const categories = await getPortfolioCategories();
  const title = localized(item.title, locale);

  return (
    <article className="lift group overflow-hidden rounded-lg border border-border">
      <Link href={`/portfolio/${item.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={storageUrl(item.coverImage)}
            alt={t('coverAlt', { title })}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-2 p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {categoryName(item.category, categories, locale)}
          </p>
          <h3 className="font-semibold group-hover:text-primary">{title}</h3>
          {item.isPersonalProject && (
            <p className="w-fit rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {t('personalProject')}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
