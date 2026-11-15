import 'server-only';
import { adminAuth } from '@/lib/firebase/admin';
import { hasAdminClaim } from './admin-claims';

export type AdminIdentity = { uid: string; email: string | null };

/**
 * Server-side admin check for EVERY admin Server Action / route (FR-8, ARCHITECTURE §6).
 * Verifies the Firebase ID token (signature, expiry, revocation) and the `admin` claim.
 * Returns null instead of throwing so callers can answer `{ ok: false, error: 'unauthorized' }`.
 */
export async function requireAdmin(idToken: unknown): Promise<AdminIdentity | null> {
  if (typeof idToken !== 'string' || idToken.length === 0 || idToken.length > 4096) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(idToken, true);
    if (!hasAdminClaim(decoded)) return null;
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    // Invalid, expired or revoked token. Details are not logged (no personal data).
    return null;
  }
}
