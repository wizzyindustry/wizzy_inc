import { describe, expect, it } from 'vitest';
import {
  computeLeadStats,
  lastMonths,
  monthKey,
  niceMax,
  windowStart,
} from '@/lib/analytics/lead-stats';
import type { Lead } from '@/lib/schemas/lead';

const NOW = new Date('2026-11-15T09:00:00Z');

function lead(overrides: Partial<Lead>): Lead {
  return {
    id: Math.random().toString(36).slice(2),
    ref: 'WZ-2026-0001',
    kind: 'quote',
    name: 'X',
    phone: '+255700000000',
    preferredContact: 'whatsapp',
    locale: 'en',
    serviceSlug: 'logo-design',
    description: 'x',
    attachments: [],
    status: 'new',
    statusHistory: [],
    notes: [],
    createdAt: NOW,
    ...overrides,
  };
}

describe('months (Tanzania time)', () => {
  it('a lead at 22:30 UTC on 31 Oct counts in November (EAT is UTC+3)', () => {
    expect(monthKey(new Date('2026-10-31T22:30:00Z'))).toBe('2026-11');
  });

  it('lists the last 12 months, oldest first, across a year boundary', () => {
    const months = lastMonths(NOW, 12);
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2025-12');
    expect(months[11]).toBe('2026-11');
  });

  it('window starts at midnight Tanzania time on the 1st of the oldest month', () => {
    expect(windowStart(NOW, 12).toISOString()).toBe('2025-11-30T21:00:00.000Z');
  });
});

describe('computeLeadStats (A7)', () => {
  const leads = [
    lead({ status: 'won' }),
    lead({ status: 'won', serviceSlug: 'business-website' }),
    lead({ status: 'lost', serviceSlug: 'business-website' }),
    lead({
      status: 'contacted',
      serviceSlug: 'business-website',
      createdAt: new Date('2026-06-10T09:00:00Z'),
    }),
    lead({ kind: 'contact', serviceSlug: undefined }),
    lead({ createdAt: new Date('2024-01-01T09:00:00Z') }), // outside the 12-month window
  ];
  const stats = computeLeadStats(leads, NOW);

  it('counts only the last 12 months; conversion is Won ÷ total', () => {
    expect(stats.total).toBe(5);
    expect(stats.won).toBe(2);
    expect(stats.conversion).toBeCloseTo(0.4);
  });

  it('has every month, including empty ones', () => {
    expect(stats.perMonth).toHaveLength(12);
    expect(stats.perMonth.find((m) => m.key === '2026-11')?.count).toBe(4);
    expect(stats.perMonth.find((m) => m.key === '2026-06')?.count).toBe(1);
    expect(stats.perMonth.find((m) => m.key === '2026-07')?.count).toBe(0);
  });

  it('services are quote requests only, largest first', () => {
    expect(stats.byService).toEqual([
      { key: 'business-website', count: 3 },
      { key: 'logo-design', count: 1 },
    ]);
  });

  it('type and status breakdowns keep a fixed order', () => {
    expect(stats.byKind).toEqual([
      { key: 'quote', count: 4 },
      { key: 'contact', count: 1 },
    ]);
    expect(stats.byStatus.map((s) => s.key)).toEqual(['new', 'contacted', 'quoted', 'won', 'lost']);
  });

  it('no leads -> conversion is null, not 0 or NaN', () => {
    expect(computeLeadStats([], NOW).conversion).toBeNull();
  });
});

describe('niceMax', () => {
  it.each([
    [0, 4],
    [3, 4],
    [7, 10],
    [13, 20],
    [48, 50],
    [120, 200],
  ])('%i -> %i', (input, expected) => {
    expect(niceMax(input)).toBe(expected);
  });
});
