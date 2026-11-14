import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { Button } from '@/components/ui/Button';
import { Markdown } from '@/components/ui/Markdown';
import { getPortfolioForService } from '@/lib/data/portfolio';
import { orFallback } from '@/lib/data/read';
import { getPublishedServices, getServiceBySlug } from '@/lib/data/services';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';
import { formatTZS } from '@/lib/utils/format-tzs';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Pre-render known services when Firestore is reachable; others render on first request (ISR). */
export async function generateStaticParams() {
  const services = await orFallback(getPublishedServices(), [], 'services (static params)');
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requested, slug } = await params;
  const locale = toLocale(requested);
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: localized(service.title, locale),
    description: localized(service.summary, locale),
  });
}

/** Service detail (F3): description, inclusions, turnaround, price, related work, FAQ, CTA. */
export default async function ServiceDetailPage({ params }: Props) {
  const { locale: requested, slug } = await params;
  const locale = toLocale(requested);
  setRequestLocale(locale);

  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const t = await getTranslations('Services');
  const related = await orFallback(getPortfolioForService(slug), [], 'related portfolio');
  const inclusions = service.inclusions[locale].length
    ? service.inclusions[locale]
    : service.inclusions.en;
  const quoteHref = { pathname: '/quote', query: { service: service.slug } };

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/services" className="text-sm text-primary underline-offset-4 hover:underline">
        ← {t('backToServices')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
        {localized(service.title, locale)}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">{localized(service.summary, locale)}</p>

      <dl className="mt-8 grid gap-4 rounded-lg bg-muted p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">{t('startingPrice')}</dt>
          <dd className="text-2xl font-bold">{formatTZS(service.startingPriceTZS, locale)}</dd>
          <dd className="text-xs text-muted-foreground">{t('priceNote')}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{t('turnaround')}</dt>
          <dd className="text-2xl font-bold">{t('days', service.turnaroundDays)}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <Markdown>{localized(service.body, locale)}</Markdown>
      </div>

      {inclusions.length > 0 && (
        <section aria-labelledby="inclusions-heading" className="mt-8">
          <h2 id="inclusions-heading" className="text-xl font-semibold">
            {t('inclusions')}
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            {inclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10">
        <Button asChild>
          <Link href={quoteHref}>{t('requestQuote')}</Link>
        </Button>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14">
          <h2 id="related-heading" className="text-xl font-semibold">
            {t('relatedWork')}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <PortfolioCard item={item} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {service.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="mt-14">
          <h2 id="faq-heading" className="text-xl font-semibold">
            {t('faq')}
          </h2>
          <div className="mt-4 divide-y divide-border rounded-lg border border-border">
            {service.faq.map((item) => (
              <details key={item.q.en} className="group p-4">
                <summary className="cursor-pointer font-medium">
                  {localized(item.q, locale)}
                </summary>
                <p className="mt-2 text-muted-foreground">{localized(item.a, locale)}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
