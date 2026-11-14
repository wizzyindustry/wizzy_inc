import { getTranslations } from 'next-intl/server';
import { localized } from '@/lib/i18n/localized';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { Service } from '@/lib/schemas/content';
import { formatTZS } from '@/lib/utils/format-tzs';

type Props = { service: Service; locale: Locale };

export async function ServiceCard({ service, locale }: Props) {
  const t = await getTranslations('Services');

  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold">
        <Link href={`/services/${service.slug}`} className="hover:text-primary">
          {localized(service.title, locale)}
        </Link>
      </h3>
      <p className="flex-1 text-muted-foreground">{localized(service.summary, locale)}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">{t('startingPrice')}</dt>
          <dd className="font-semibold">{formatTZS(service.startingPriceTZS, locale)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('turnaround')}</dt>
          <dd className="font-semibold">{t('days', service.turnaroundDays)}</dd>
        </div>
      </dl>
      <Link
        href={`/services/${service.slug}`}
        className="font-medium text-primary underline-offset-4 hover:underline"
        aria-label={t('viewDetailsFor', { title: localized(service.title, locale) })}
      >
        {t('viewDetails')}
      </Link>
    </article>
  );
}
