import { describe, expect, it } from 'vitest';
import { hasAdminClaim } from '@/lib/security/admin-claims';

describe('hasAdminClaim (A1, FR-8)', () => {
  it('is true only for the boolean claim admin: true', () => {
    expect(hasAdminClaim({ admin: true })).toBe(true);
    for (const claims of [
      { admin: 'true' },
      { admin: 1 },
      { admin: false },
      { role: 'admin' },
      { email: 'owner@example.test' },
      {},
      null,
      undefined,
    ]) {
      expect(hasAdminClaim(claims as Record<string, unknown> | null | undefined)).toBe(false);
    }
  });
});
