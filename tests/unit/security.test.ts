import { describe, expect, it } from 'vitest';
import { getClientIp } from '@/lib/security/client-ip';
import { isHoneypotTripped } from '@/lib/security/honeypot';
import { nextWindowState } from '@/lib/security/rate-limit-window';

describe('isHoneypotTripped', () => {
  it('passes empty values and trips on anything filled in', () => {
    expect(isHoneypotTripped('')).toBe(false);
    expect(isHoneypotTripped('   ')).toBe(false);
    expect(isHoneypotTripped(undefined)).toBe(false);
    expect(isHoneypotTripped(null)).toBe(false);
    expect(isHoneypotTripped('http://spam.example')).toBe(true);
  });
});

describe('getClientIp', () => {
  const h = (values: Record<string, string>) => new Headers(values);

  it('uses the first X-Forwarded-For entry', () => {
    expect(getClientIp(h({ 'x-forwarded-for': '41.59.1.2, 10.0.0.1' }))).toBe('41.59.1.2');
  });

  it('falls back to X-Real-IP, then "unknown"', () => {
    expect(getClientIp(h({ 'x-real-ip': '41.59.1.3' }))).toBe('41.59.1.3');
    expect(getClientIp(h({}))).toBe('unknown');
  });
});

describe('nextWindowState', () => {
  const policy = { limit: 3, windowMs: 1000 };

  it('allows up to the limit within a window, then blocks', () => {
    let state = null;
    const results: boolean[] = [];
    for (let i = 0; i < 4; i++) {
      const r = nextWindowState(state, 100 + i, policy);
      results.push(r.allowed);
      state = r.state;
    }
    expect(results).toEqual([true, true, true, false]);
    expect(state).toEqual({ count: 3, windowStart: 100 });
  });

  it('starts a fresh window once the old one has expired', () => {
    const r = nextWindowState({ count: 3, windowStart: 0 }, 1000, policy);
    expect(r).toEqual({ allowed: true, state: { count: 1, windowStart: 1000 } });
  });
});
