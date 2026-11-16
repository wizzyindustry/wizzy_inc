import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Markdown } from '@/components/ui/Markdown';
import { getLegalPages } from '@/lib/data/legal';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata } from '@/lib/i18n/metadata';
import type { Locale } from '@/lib/i18n/routing';
import type { LegalPage } from '@/lib/schemas/content';
import { formatLongDate } from '@/lib/utils/format-date';

/** Shared metadata for /privacy, /terms and /cookies. */
export async function legalMetadata(page: LegalPage, locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `Legal.${page}` });
  return pageMetadata({
    locale,
    path: `/${page}`,
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

/**
 * One legal page (Privacy Policy, Terms & Conditions or Cookie Policy). The text is owner
 * content from Admin → Legal pages (markdown, rendered on the server); drafts until saved.
 */
export async function LegalDocument({ page, locale }: { page: LegalPage; locale: Locale }) {
  const t = await getTranslations('Legal');
  const legal = await getLegalPages();
  const text = legal[page];
  const englishOnly = locale !== 'en' && text.sw.trim() === '';

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t(`${page}.heading`)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('lastUpdated', {
          date: formatLongDate(new Date(`${legal.lastUpdated}T12:00:00Z`), locale),
        })}
      </p>
      {englishOnly && (
        <p lang={locale} className="mt-6 rounded-md bg-muted p-4 text-sm">
          {t('englishOnly')}
        </p>
      )}
      <div lang={englishOnly ? 'en' : undefined} className="mt-8">
        <Markdown>{localized(text, locale)}</Markdown>
      </div>
    </article>
  );
}
