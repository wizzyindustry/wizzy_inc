import { describe, expect, it } from 'vitest';
import { formatMonthYear } from '@/lib/utils/format-date';

describe('formatMonthYear', () => {
  it('formats month and year in Tanzania time', () => {
    // 22:30 UTC on 31 Jan is already 1 Feb in Dar es Salaam (UTC+3)
    const date = new Date('2026-01-31T22:30:00Z');
    expect(formatMonthYear(date, 'en')).toMatch(/February 2026/);
    expect(formatMonthYear(date, 'sw')).toMatch(/2026/);
  });
});
