import { intlLocale, type Locale } from '@/lib/i18n/routing';

const TZ = 'Africa/Dar_es_Salaam';

/** Today's date in Tanzania as YYYY-MM-DD (same format as <input type="date">). */
export function todayInTanzania(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now);
}

/** Calendar year in Tanzania (reference numbers restart on 1 January, local time). */
export function yearInTanzania(now: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: TZ }).format(now));
}

/** A YYYY-MM-DD date as midday in Tanzania (avoids off-by-one-day display issues). */
export function tanzaniaDateToUtc(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 9)); // 12:00 EAT = 09:00 UTC
}

/** "March 2026" / "Machi 2026" — month and year, in Tanzania's time zone. */
export function formatMonthYear(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Dar_es_Salaam',
  }).format(date);
}
