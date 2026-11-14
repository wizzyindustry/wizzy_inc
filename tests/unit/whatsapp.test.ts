import { describe, expect, it } from 'vitest';
import { buildWhatsAppLink, resolveWhatsAppNumber } from '@/lib/utils/whatsapp';

describe('resolveWhatsAppNumber', () => {
  it('prefers a valid settings number over the env fallback', () => {
    expect(resolveWhatsAppNumber('255700000001', '255700000002')).toBe('255700000001');
  });

  it('falls back to env, and rejects invalid formats', () => {
    expect(resolveWhatsAppNumber(null, '255700000002')).toBe('255700000002');
    expect(resolveWhatsAppNumber('+255700000001', undefined)).toBeNull();
    expect(resolveWhatsAppNumber(undefined, '0700000002')).toBeNull();
  });
});

describe('buildWhatsAppLink', () => {
  it('builds a wa.me link with an encoded message', () => {
    expect(buildWhatsAppLink('255700000001', 'Habari, bei?')).toBe(
      'https://wa.me/255700000001?text=Habari%2C%20bei%3F',
    );
  });
});
