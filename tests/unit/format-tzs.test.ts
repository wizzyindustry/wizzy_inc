import { describe, expect, it } from 'vitest';
import { formatTZS } from '@/lib/utils/format-tzs';

describe('formatTZS', () => {
  it('formats whole shillings with grouping and no decimals', () => {
    for (const locale of ['en', 'sw'] as const) {
      const out = formatTZS(50000, locale);
      expect(out).toMatch(/50[,.  ]000/);
      expect(out).toMatch(/TSh|TZS/);
      expect(out).not.toMatch(/[.,]00$/);
    }
  });

  it('rejects non-integer amounts', () => {
    expect(() => formatTZS(1000.5, 'en')).toThrow(RangeError);
  });
});
