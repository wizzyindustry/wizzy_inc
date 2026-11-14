import { describe, expect, it } from 'vitest';
import { toPlain } from '@/lib/data/to-plain';

describe('toPlain', () => {
  it('converts nested Timestamp-like values to Date and leaves the rest alone', () => {
    const date = new Date('2026-01-02T03:04:05Z');
    const ts = { toDate: () => date };
    const out = toPlain({ a: ts, list: [{ at: ts }], n: 1, s: 'x', nil: null, d: date });
    expect(out).toEqual({ a: date, list: [{ at: date }], n: 1, s: 'x', nil: null, d: date });
  });
});
