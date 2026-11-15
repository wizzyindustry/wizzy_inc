import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import { getSiteSettings } from '@/lib/data/settings';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import { Link } from '@/lib/i18n/navigation';
import { faqJsonLd } from '@/lib/seo/json-ld';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Faq.meta' });
  return pageMetadata({ locale, path: '/faq', title: t('title'), description: t('description') });
}

/**
 * FAQ (F12): payment terms, revisions, timelines, file formats, hosting. Questions and
 * answers are owner content, edited on the admin Settings page (settings/site.faq).
 * Uses <details> so it works without JavaScript.
 */
export default async function FaqPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Faq');
  const faq = (await getSiteSettings())?.faq ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={faqJsonLd(faq, locale)} />
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t('intro')}</p>

      {faq.length === 0 ? (
        <p className="mt-8 rounded-md bg-muted p-4">{t('empty')}</p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {faq.map((item, i) => (
            <details key={i} className="group rounded-lg border border-border p-4">
              <summary className="cursor-pointer list-none font-semibold marker:hidden [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-ring">
                <span className="flex items-start justify-between gap-4">
                  {localized(item.q, locale)}
                  <span
                    aria-hidden="true"
                    className="text-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">
                {localized(item.a, locale)}
              </p>
            </details>
          ))}
        </div>
      )}

      <section aria-labelledby="more-heading" className="mt-12 rounded-lg bg-muted p-6">
        <h2 id="more-heading" className="font-display text-xl font-bold">
          {t('moreHeading')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('moreText')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/quote">{t('quoteButton')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">{t('contactButton')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
