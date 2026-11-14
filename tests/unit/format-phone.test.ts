import { describe, expect, it } from 'vitest';
import { formatPhone, normalizeTzPhone } from '@/lib/utils/format-phone';

describe('normalizeTzPhone', () => {
  it.each([
    ['+255712345678', '+255712345678'],
    ['255712345678', '+255712345678'],
    ['0712345678', '+255712345678'],
    ['0712 345 678', '+255712345678'],
    ['+255 (712) 345-678', '+255712345678'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeTzPhone(input)).toBe(expected);
  });

  it.each(['', '712345678', '07123456789', '+254712345678', '071234567a', '+2550712345678'])(
    'rejects %j',
    (input) => {
      expect(normalizeTzPhone(input)).toBeNull();
    },
  );
});

describe('formatPhone', () => {
  it('groups digits for display', () => {
    expect(formatPhone('+255712345678')).toBe('+255 712 345 678');
  });
});
