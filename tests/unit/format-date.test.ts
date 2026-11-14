import { describe, expect, it } from 'vitest';
import {
  formatMonthYear,
  tanzaniaDateToUtc,
  todayInTanzania,
  yearInTanzania,
} from '@/lib/utils/format-date';

describe('Tanzania date helpers', () => {
  // 22:30 UTC on 31 Dec 2026 is already 1 Jan 2027 in Dar es Salaam (UTC+3)
  const newYearsEve = new Date('2026-12-31T22:30:00Z');

  it('use Tanzania local time for today and the year', () => {
    expect(todayInTanzania(newYearsEve)).toBe('2027-01-01');
    expect(yearInTanzania(newYearsEve)).toBe(2027);
  });

  it('turns a YYYY-MM-DD date into midday Tanzania time', () => {
    expect(tanzaniaDateToUtc('2026-11-20').toISOString()).toBe('2026-11-20T09:00:00.000Z');
  });
});

describe('formatMonthYear', () => {
  it('formats month and year in Tanzania time', () => {
    // 22:30 UTC on 31 Jan is already 1 Feb in Dar es Salaam (UTC+3)
    const date = new Date('2026-01-31T22:30:00Z');
    expect(formatMonthYear(date, 'en')).toMatch(/February 2026/);
    expect(formatMonthYear(date, 'sw')).toMatch(/2026/);
  });
});
