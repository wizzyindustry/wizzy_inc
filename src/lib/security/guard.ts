import 'server-only';
import { headers } from 'next/headers';
import { verifyAppCheck } from './app-check';
import { getClientIp } from './client-ip';
import { isHoneypotTripped } from './honeypot';
import { checkRateLimit } from './rate-limit';
import type { RateLimitAction } from './rate-limit-window';

export type GuardResult = { ok: true } | { ok: false; reason: 'spam' | 'appCheck' | 'rateLimited' };

type GuardInput = {
  action: RateLimitAction;
  honeypot: unknown;
  appCheckToken: string | null | undefined;
};

/**
 * Run every public-form protection (ARCHITECTURE-ESSENTIAL §4) in a Server Action,
 * BEFORE validating or storing anything. Order: cheap checks first.
 * Zod validation is done separately by the action with the shared schema.
 *
 * Callers should answer `spam` with a normal-looking success so bots learn nothing.
 */
export async function guardPublicForm({
  action,
  honeypot,
  appCheckToken,
}: GuardInput): Promise<GuardResult> {
  if (isHoneypotTripped(honeypot)) return { ok: false, reason: 'spam' };
  if (!(await verifyAppCheck(appCheckToken))) return { ok: false, reason: 'appCheck' };
  if (!(await checkRateLimit(action, getClientIp(await headers())))) {
    return { ok: false, reason: 'rateLimited' };
  }
  return { ok: true };
}
