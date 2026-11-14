import { intlLocale, type Locale } from '@/lib/i18n/routing';

/** Optional USD reference price for international clients, e.g. "US$40". */
export function formatUSD(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
