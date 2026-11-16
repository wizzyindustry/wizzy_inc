import { describe, expect, it } from 'vitest';
import { parseConsent } from '@/lib/cookies/consent';

describe('cookie consent', () => {
  it('reads the saved choice among other cookies', () => {
    expect(parseConsent('NEXT_LOCALE=sw; wz_cookie_consent=all')).toBe('all');
    expect(parseConsent('wz_cookie_consent=essential')).toBe('essential');
  });

  it('treats a missing or unknown value as "not chosen yet"', () => {
    expect(parseConsent('')).toBeNull();
    expect(parseConsent('NEXT_LOCALE=en')).toBeNull();
    expect(parseConsent('wz_cookie_consent=maybe')).toBeNull();
  });
});
