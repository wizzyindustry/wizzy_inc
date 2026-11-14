import 'server-only';
import { createHash } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { nextWindowState, RATE_LIMITS, type RateLimitAction } from './rate-limit-window';

/**
 * Raw IPs are personal data (PDPA 2022), so only a salted hash is stored.
 * Documents live in `rateLimits/*`: no client access (deny-by-default rules); `expiresAt`
 * lets a Firestore TTL policy delete old entries automatically.
 */
function bucketId(action: RateLimitAction, ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? '';
  return createHash('sha256').update(`${salt}:${action}:${ip}`).digest('hex');
}

/** Returns true if the request may proceed. Counts the request when allowed. */
export async function checkRateLimit(action: RateLimitAction, ip: string): Promise<boolean> {
  const policy = RATE_LIMITS[action];
  const ref = adminDb().collection('rateLimits').doc(bucketId(action, ip));

  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const previous =
      data && data.windowStart instanceof Timestamp
        ? { count: Number(data.count) || 0, windowStart: data.windowStart.toMillis() }
        : null;

    const { allowed, state } = nextWindowState(previous, Date.now(), policy);
    if (allowed) {
      tx.set(ref, {
        action,
        count: state.count,
        windowStart: Timestamp.fromMillis(state.windowStart),
        expiresAt: Timestamp.fromMillis(state.windowStart + policy.windowMs),
      });
    }
    return allowed;
  });
}
