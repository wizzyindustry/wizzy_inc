import { intlLocale, type Locale } from '@/lib/i18n/routing';

/** "March 2026" / "Machi 2026" — month and year, in Tanzania's time zone. */
export function formatMonthYear(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Dar_es_Salaam',
  }).format(date);
}
