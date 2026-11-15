import type { Lead, LeadStatus } from '@/lib/schemas/lead';
import { LEAD_PIPELINE } from '@/lib/schemas/lead-admin';

/*
 * Basic lead analytics (A7): leads per month, by service, by type and status, and
 * conversion = Won ÷ total (the PRD's definition). Pure functions so they can be tested.
 * Months follow Tanzania time.
 */

const TZ = 'Africa/Dar_es_Salaam';
const monthFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
});

/** "2026-11" for a date, in Tanzania time. */
export function monthKey(date: Date): string {
  return monthFmt.format(date).slice(0, 7);
}

/** The last `count` month keys ending with the month of `now`, oldest first. */
export function lastMonths(now: Date, count: number): string[] {
  const [y, m] = monthKey(now).split('-').map(Number) as [number, number];
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

/** First instant of the oldest month in the window (for the Firestore query). */
export function windowStart(now: Date, months: number): Date {
  const [y, m] = lastMonths(now, months)[0]!.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(y, m - 1, 1) - 3 * 60 * 60 * 1000); // midnight EAT (UTC+3)
}

export type Count = { key: string; count: number };

export type LeadStats = {
  total: number;
  won: number;
  /** Won ÷ total, 0–1; null when there are no leads. */
  conversion: number | null;
  perMonth: Count[]; // oldest -> newest, every month present (zeros included)
  byService: Count[]; // quote requests only, largest first
  byKind: Count[]; // quote, contact
  byStatus: Count[]; // pipeline order
};

const CONTACT = 'contact';

export function computeLeadStats(leads: Lead[], now: Date, months = 12): LeadStats {
  const keys = lastMonths(now, months);
  const inWindow = leads.filter((l) => keys.includes(monthKey(l.createdAt)));

  const tally = (pick: (l: Lead) => string | undefined) => {
    const map = new Map<string, number>();
    for (const lead of inWindow) {
      const key = pick(lead);
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  };

  const perMonth = tally((l) => monthKey(l.createdAt));
  const services = tally((l) => (l.kind === 'quote' ? (l.serviceSlug ?? 'unknown') : undefined));
  const kinds = tally((l) => l.kind);
  const statuses = tally((l) => l.status);
  const won = statuses.get('won') ?? 0;

  return {
    total: inWindow.length,
    won,
    conversion: inWindow.length ? won / inWindow.length : null,
    perMonth: keys.map((key) => ({ key, count: perMonth.get(key) ?? 0 })),
    byService: [...services]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
    byKind: ['quote', CONTACT].map((key) => ({ key, count: kinds.get(key) ?? 0 })),
    byStatus: LEAD_PIPELINE.map((key: LeadStatus) => ({ key, count: statuses.get(key) ?? 0 })),
  };
}

/** Clean axis maximum: the smallest of 1, 2, 5 × 10^n at or above `max` (minimum 4). */
export function niceMax(max: number): number {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 2, 5, 10]) if (step * pow >= max) return step * pow;
  return 10 * pow;
}
