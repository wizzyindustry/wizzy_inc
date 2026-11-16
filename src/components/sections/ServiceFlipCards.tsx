import { getTranslations } from 'next-intl/server';
import { localized } from '@/lib/i18n/localized';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { ServiceCategory } from '@/lib/schemas/common';
import type { Service } from '@/lib/schemas/content';
import { formatTZS } from '@/lib/utils/format-tzs';
import { serviceIcon } from './service-icons';

type Card = {
  key: string;
  title: string;
  summary: string;
  href: string;
  category: ServiceCategory;
  icon?: string;
  price?: string;
};

type Props = { services: Service[]; locale: Locale };

/**
 * Home page "Our services": one card per service. The front shows the icon and name; on
 * hover, tap or keyboard focus the card turns over to a short explanation and a link.
 * Until services exist, the two service categories are shown instead.
 */
export async function ServiceFlipCards({ services, locale }: Props) {
  const t = await getTranslations('HomePage.services');
  const tCat = await getTranslations('Categories');

  const cards: Card[] = services.length
    ? services.map((s) => ({
        key: s.id,
        title: localized(s.title, locale),
        summary: localized(s.summary, locale),
        href: `/services/${s.slug}`,
        category: s.category,
        icon: s.icon,
        price: t('fromPrice', { price: formatTZS(s.startingPriceTZS, locale) }),
      }))
    : (['graphic-design', 'web-development'] as const).map((id) => ({
        key: id,
        title: tCat(`${id}.title`),
        summary: tCat(`${id}.description`),
        href: `/services#${id}`,
        category: id,
      }));

  return (
    <section aria-labelledby="services-heading" className="bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="services-heading" className="font-display text-2xl font-bold sm:text-3xl">
          {t('heading')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('flipHint')}</p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = serviceIcon(card.icon, card.category);
            return (
              // tabIndex -1: a tap gives the card focus, which turns it over on phones.
              <li key={card.key} className="flip-card" tabIndex={-1}>
                <div className="flip-inner min-h-56">
                  <div className="flip-face flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-background p-6 text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-muted">
                      <Icon aria-hidden="true" className="size-8 text-primary" />
                    </span>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tCat(`${card.category}.title`)}
                    </p>
                  </div>
                  <div className="flip-face flip-back flex flex-col justify-center gap-3 rounded-lg bg-primary p-6 text-primary-foreground">
                    <p className="font-semibold">{card.title}</p>
                    <p className="text-sm">{card.summary}</p>
                    {card.price && <p className="text-sm font-semibold">{card.price}</p>}
                    <Link
                      href={card.href}
                      className="mt-auto font-medium underline underline-offset-4"
                      aria-label={t('learnMoreAbout', { name: card.title })}
                    >
                      {t('learnMore')}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link
          href="/services"
          className="mt-8 inline-block font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('all')}
        </Link>
      </div>
    </section>
  );
}
