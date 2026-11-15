import { describe, expect, it } from 'vitest';
import { BUDGET_RANGES } from '@/lib/schemas/lead';
import { FORM_ERROR_KEYS } from '@/lib/utils/action-result';
import en from '../../messages/en.json';
import sw from '../../messages/sw.json';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('translations', () => {
  it('en.json and sw.json have exactly the same keys', () => {
    expect(keys(sw).sort()).toEqual(keys(en).sort());
  });

  const actionErrors = ['invalid', 'validation', 'appCheck', 'rateLimited', 'server', 'network'];

  it('every error key the quote form can receive has a message', () => {
    const errorKeys = [...FORM_ERROR_KEYS.filter((k) => !k.startsWith('message')), ...actionErrors];
    for (const key of errorKeys) {
      expect(en.QuoteForm.errors, key).toHaveProperty(key);
    }
  });

  it('every error key the contact form can receive has a message', () => {
    const keys = [
      'nameRequired',
      'invalidPhone',
      'invalidEmail',
      'messageTooShort',
      'messageTooLong',
    ];
    for (const key of [...keys, ...actionErrors]) {
      expect(en.ContactForm.errors, key).toHaveProperty(key);
    }
  });

  it('every budget range has a label', () => {
    for (const range of BUDGET_RANGES) expect(en.QuoteForm.budget).toHaveProperty(range.id);
  });
});
