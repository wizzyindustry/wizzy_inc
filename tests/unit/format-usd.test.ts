import { describe, expect, it } from 'vitest';
import { formatUSD } from '@/lib/utils/format-usd';

describe('formatUSD', () => {
  it('formats whole US dollars', () => {
    expect(formatUSD(40, 'en')).toMatch(/40/);
    expect(formatUSD(40, 'en')).toMatch(/\$|USD/);
    expect(formatUSD(1250, 'sw')).toMatch(/1[,.\u00a0]?250/);
  });
});
