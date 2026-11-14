import { Code, Palette } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { localized } from '@/lib/i18n/localized';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { ServiceCategory } from '@/lib/schemas/common';
import type { Service } from '@/lib/schemas/content';
import { formatTZS } from '@/lib/utils/format-tzs';

const CATEGORIES: { id: ServiceCategory; Icon: typeof Palette }[] = [
  { id: 'graphic-design', Icon: Palette },
  { id: 'web-development', Icon: Code },
];

type Props = { services: Service[]; locale: Locale };

/** The two service cards (F1). Sub-services and "from" prices come from Firestore. */
export async function ServiceCategoryCards({ services, locale }: Props) {
  const t = await getTranslations('HomePage.services');
  const tCat = await getTranslations('Categories');

  return (
    <section aria-labelledby="services-heading" className="mx-auto max-w-6xl px-4 py-14">
      <h2 id="services-heading" className="font-display text-2xl font-bold sm:text-3xl">
        {t('heading')}
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {CATEGORIES.map(({ id, Icon }) => {
          const items = services.filter((s) => s.category === id);
          const minPrice = items.length ? Math.min(...items.map((s) => s.startingPriceTZS)) : null;
          return (
            <article key={id} className="flex flex-col gap-4 rounded-lg border border-border p-6">
              <Icon aria-hidden="true" className="size-8 text-primary" />
              <h3 className="text-xl font-semibold">{tCat(`${id}.title`)}</h3>
              <p className="text-muted-foreground">{tCat(`${id}.description`)}</p>
              {items.length > 0 && (
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {items.map((s) => (
                    <li key={s.id}>
                      <Link href={`/services/${s.slug}`} className="hover:text-primary">
                        {localized(s.title, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {minPrice !== null && (
                <p className="font-semibold">
                  {t('fromPrice', { price: formatTZS(minPrice, locale) })}
                </p>
              )}
              <Link
                href={`/services#${id}`}
                className="mt-auto font-medium text-primary underline-offset-4 hover:underline"
              >
                {t(`links.${id}`)}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
