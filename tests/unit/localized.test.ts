import { describe, expect, it } from 'vitest';
import { localized } from '@/lib/i18n/localized';

describe('localized', () => {
  it('returns the requested locale when present', () => {
    expect(localized({ en: 'Logo design', sw: 'Usanifu wa nembo' }, 'sw')).toBe('Usanifu wa nembo');
    expect(localized({ en: 'Logo design', sw: 'Usanifu wa nembo' }, 'en')).toBe('Logo design');
  });

  it('falls back to English when Swahili is empty or whitespace', () => {
    expect(localized({ en: 'Logo design', sw: '' }, 'sw')).toBe('Logo design');
    expect(localized({ en: 'Logo design', sw: '   ' }, 'sw')).toBe('Logo design');
  });
});
