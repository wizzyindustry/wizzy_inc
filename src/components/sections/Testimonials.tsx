import { getTranslations } from 'next-intl/server';
import { localized } from '@/lib/i18n/localized';
import type { Locale } from '@/lib/i18n/routing';
import type { Testimonial } from '@/lib/schemas/content';

type Props = { testimonials: Testimonial[]; locale: Locale };

/** Real, consented client quotes only (F11). Renders nothing when there are none. */
export async function Testimonials({ testimonials, locale }: Props) {
  if (testimonials.length === 0) return null;
  const t = await getTranslations('HomePage.testimonials');

  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-6xl px-4 py-14">
      <h2 id="testimonials-heading" className="font-display text-2xl font-bold sm:text-3xl">
        {t('heading')}
      </h2>
      <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <li key={item.id}>
            <figure className="lift flex h-full flex-col gap-4 rounded-lg border border-border p-6">
              {item.rating && (
                <p aria-label={t('rating', { rating: item.rating })} className="text-accent">
                  {'★'.repeat(item.rating)}
                </p>
              )}
              <blockquote className="flex-1">
                <p>“{localized(item.quote, locale)}”</p>
              </blockquote>
              <figcaption className="text-sm">
                <span className="font-semibold">{item.name}</span>
                <span className="text-muted-foreground">
                  {' — '}
                  {[item.role, item.company].filter(Boolean).join(', ')}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
