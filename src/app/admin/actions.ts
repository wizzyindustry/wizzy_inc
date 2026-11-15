'use server';

import { requireAdmin } from '@/lib/security/require-admin';
import type { ActionResult } from '@/lib/utils/action-result';

/**
 * Confirms on the server that the signed-in user is an admin (A1, FR-8).
 * The admin panel calls this before showing anything; every later admin action
 * repeats the same `requireAdmin` check itself.
 */
export async function verifyAdminSession(
  idToken: string,
): Promise<ActionResult<{ email: string | null }>> {
  const admin = await requireAdmin(idToken);
  if (!admin) return { ok: false, error: 'unauthorized' };
  return { ok: true, data: { email: admin.email } };
}
