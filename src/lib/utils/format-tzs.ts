import { intlLocale, type Locale } from '@/lib/i18n/routing';

/** Format an integer TZS amount for display, e.g. 50000 -> "TSh 50,000". */
export function formatTZS(amount: number, locale: Locale): string {
  if (!Number.isInteger(amount)) {
    throw new RangeError('formatTZS expects an integer amount in TZS');
  }
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(amount);
}
