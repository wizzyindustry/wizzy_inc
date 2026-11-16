/*
 * Cookie consent (Phase 1.2). The choice is stored in an essential cookie for a year.
 * Today the site only sets essential cookies, so nothing else changes with the choice yet —
 * any future optional cookie (e.g. visitor statistics) must check `hasOptionalConsent()`.
 */

export const CONSENT_COOKIE = 'wz_cookie_consent';
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, in seconds
export type Consent = 'all' | 'essential';

/** Fired on window when the choice changes, and when "Cookie settings" asks to reopen. */
export const CONSENT_CHANGED = 'wz-consent-changed';
export const CONSENT_REOPEN = 'wz-consent-reopen';

/** The saved choice in a cookie string, or null when the visitor has not chosen yet. */
export function parseConsent(cookieString: string): Consent | null {
  for (const part of cookieString.split(';')) {
    const [name, value] = part.trim().split('=');
    if (name === CONSENT_COOKIE && (value === 'all' || value === 'essential')) return value;
  }
  return null;
}

export function readConsent(): Consent | null {
  return parseConsent(document.cookie);
}

export function saveConsent(choice: Consent): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CONSENT_CHANGED));
}

/** For future optional cookies/scripts: only true after "Accept all". */
export function hasOptionalConsent(): boolean {
  return readConsent() === 'all';
}
