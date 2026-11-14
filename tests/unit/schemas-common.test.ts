import { describe, expect, it } from 'vitest';
import { bilingualTextSchema, priceTZSSchema } from '@/lib/schemas/common';

describe('common schemas', () => {
  it('requires English text but allows empty Swahili', () => {
    expect(bilingualTextSchema.safeParse({ en: 'Hi', sw: '' }).success).toBe(true);
    expect(bilingualTextSchema.safeParse({ en: '', sw: 'Habari' }).success).toBe(false);
  });

  it('accepts only non-negative integer TZS prices', () => {
    expect(priceTZSSchema.safeParse(50000).success).toBe(true);
    expect(priceTZSSchema.safeParse(-1).success).toBe(false);
    expect(priceTZSSchema.safeParse(99.9).success).toBe(false);
  });
});
