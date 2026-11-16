'use server';

import { adminDb } from '@/lib/firebase/admin';
import { docIdSchema } from '@/lib/schemas/content-admin';
import { requireAdmin } from '@/lib/security/require-admin';
import type { ActionResult } from '@/lib/utils/action-result';

/** Remove one newsletter subscriber (Admin → Subscribers). Emails are never logged. */
export async function removeSubscriber(
  idToken: string,
  input: { id: string },
): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin(idToken))) return { ok: false, error: 'unauthorized' };
  if (!docIdSchema.safeParse(input.id).success) return { ok: false, error: 'validation' };
  try {
    await adminDb().collection('subscribers').doc(input.id).delete();
    return { ok: true, data: { id: input.id } };
  } catch (error) {
    console.error(
      '[admin] removeSubscriber failed:',
      error instanceof Error ? error.message : 'unknown',
    );
    return { ok: false, error: 'server' };
  }
}
