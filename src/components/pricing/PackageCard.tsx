import { Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { localized } from '@/lib/i18n/localized';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/routing';
import type { Package } from '@/lib/schemas/content';
import { cn } from '@/lib/utils/cn';
import { formatTZS } from '@/lib/utils/format-tzs';
import { formatUSD } from '@/lib/utils/format-usd';

type Props = { pkg: Package; locale: Locale };

/** One Basic / Standard / Premium tier (F5). "Request this package" pre-fills the quote form (FR-6). */
export async function PackageCard({ pkg, locale }: Props) {
  const t = await getTranslations('Pricing');
  const name = localized(pkg.name, locale);
  const features = pkg.features[locale].length ? pkg.features[locale] : pkg.features.en;
  const headingId = `package-${pkg.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        'relative flex h-full flex-col gap-5 rounded-lg border p-6',
        pkg.highlighted ? 'border-primary border-2 shadow-md' : 'border-border',
      )}
    >
      {pkg.highlighted && (
        <p className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          {t('popular')}
        </p>
      )}
      <h3 id={headingId} className="text-xl font-semibold">
        {name}
      </h3>

      <div>
        <p className="text-sm text-muted-foreground">{t('from')}</p>
        <p className="text-3xl font-bold">{formatTZS(pkg.priceTZS, locale)}</p>
        {pkg.priceUSD !== undefined && (
          <p className="text-sm text-muted-foreground">
            {t('approxUsd', { price: formatUSD(pkg.priceUSD, locale) })}
          </p>
        )}
      </div>

      <ul className="flex-1 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-2 gap-2 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-muted-foreground">{t('revisions')}</dt>
          <dd className="font-semibold">{pkg.revisions}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('delivery')}</dt>
          <dd className="font-semibold">{t('days', { count: pkg.deliveryDays })}</dd>
        </div>
      </dl>

      <Button asChild variant={pkg.highlighted ? 'primary' : 'outline'}>
        <Link
          href={{ pathname: '/quote', query: { package: pkg.id } }}
          aria-label={t('requestPackageFor', { name })}
        >
          {t('requestPackage')}
        </Link>
      </Button>
    </article>
  );
}
