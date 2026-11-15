import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import { getPortfolioBySlug, getPublishedPortfolio } from '@/lib/data/portfolio';
import { orFallback } from '@/lib/data/read';
import { getPublishedServices } from '@/lib/data/services';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';
import { creativeWorkJsonLd } from '@/lib/seo/json-ld';
import { formatMonthYear } from '@/lib/utils/format-date';
import { storageUrl } from '@/lib/utils/storage-url';

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Pre-render known items when Firestore is reachable; others render on first request (ISR). */
export async function generateStaticParams() {
  const items = await orFallback(getPublishedPortfolio(), [], 'portfolio (static params)');
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requested, slug } = await params;
  const locale = toLocale(requested);
  const item = await getPortfolioBySlug(slug);
  if (!item) return {};
  const meta = pageMetadata({
    locale,
    path: `/portfolio/${slug}`,
    title: localized(item.title, locale),
    description: localized(item.problem, locale),
  });
  return { ...meta, openGraph: { ...meta.openGraph, images: [storageUrl(item.coverImage)] } };
}

/** Case study (F4): images, client type, problem, solution, result, tools, live link. */
export default async function CaseStudyPage({ params }: Props) {
  const { locale: requested, slug } = await params;
  const locale = toLocale(requested);
  setRequestLocale(locale);

  const item = await getPortfolioBySlug(slug);
  if (!item) notFound();

  const t = await getTranslations('Portfolio');
  const tCat = await getTranslations('Categories');
  const title = localized(item.title, locale);
  const services = await orFallback(getPublishedServices(), [], 'services');
  const relatedServices = services.filter((s) => item.serviceSlugs.includes(s.slug));

  const sections = [
    { key: 'problem', text: localized(item.problem, locale) },
    { key: 'solution', text: localized(item.solution, locale) },
    ...(item.result ? [{ key: 'result', text: localized(item.result, locale) }] : []),
  ] as const;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <JsonLd data={creativeWorkJsonLd(item, locale)} />
      <Link href="/portfolio" className="text-sm text-primary underline-offset-4 hover:underline">
        ← {t('backToPortfolio')}
      </Link>
      <p className="mt-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {tCat(`${item.category}.title`)}
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      {item.isPersonalProject && (
        <p className="mt-3 w-fit rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          {t('personalProject')}
        </p>
      )}

      <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-lg bg-muted">
        <Image
          src={storageUrl(item.coverImage)}
          alt={t('coverAlt', { title })}
          fill
          priority
          sizes="(min-width: 896px) 896px, 100vw"
          className="object-cover"
        />
      </div>

      <dl className="mt-8 grid gap-4 rounded-lg bg-muted p-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">{t('clientType')}</dt>
          <dd className="font-semibold">{item.clientType}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{t('completed')}</dt>
          <dd className="font-semibold">{formatMonthYear(item.completedAt, locale)}</dd>
        </div>
        {item.tools.length > 0 && (
          <div>
            <dt className="text-sm text-muted-foreground">{t('tools')}</dt>
            <dd className="font-semibold">{item.tools.join(', ')}</dd>
          </div>
        )}
      </dl>

      {sections.map((section) => (
        <section key={section.key} className="mt-8">
          <h2 className="text-xl font-semibold">{t(section.key)}</h2>
          <p className="mt-2 leading-relaxed whitespace-pre-line">{section.text}</p>
        </section>
      ))}

      {item.gallery.length > 0 && (
        <section aria-labelledby="gallery-heading" className="mt-10">
          <h2 id="gallery-heading" className="text-xl font-semibold">
            {t('gallery')}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {item.gallery.map((path, i) => (
              <li key={path} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <Image
                  src={storageUrl(path)}
                  alt={t('galleryAlt', { title, number: i + 1 })}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        {item.liveUrl && (
          <Button asChild variant="outline">
            <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">
              {t('liveSite')}
            </a>
          </Button>
        )}
        <Button asChild>
          <Link href={{ pathname: '/quote', query: { service: item.serviceSlugs[0] } }}>
            {t('similarProject')}
          </Link>
        </Button>
      </div>

      {relatedServices.length > 0 && (
        <section aria-labelledby="services-heading" className="mt-10">
          <h2 id="services-heading" className="text-lg font-semibold">
            {t('relatedServices')}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relatedServices.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-block rounded-full border border-border px-3 py-1 text-sm hover:bg-muted"
                >
                  {localized(s.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
