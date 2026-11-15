'use server';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { leadNoteInputSchema, leadStatusInputSchema } from '@/lib/schemas/lead-admin';
import { requireAdmin } from '@/lib/security/require-admin';
import { zodFieldErrors, type ActionResult } from '@/lib/utils/action-result';

/*
 * Lead changes (A2, FR-10). Every action re-verifies the admin's ID token on the server
 * (ARCHITECTURE-ESSENTIAL §4) and writes with the Admin SDK. Personal data is never logged.
 */

type Result = ActionResult<{ changed: boolean }>;

function logFailure(action: string, error: unknown) {
  console.error(`[admin] ${action} failed:`, error instanceof Error ? error.message : 'unknown');
}

/** Move a lead to a new status and record when it happened. */
export async function updateLeadStatus(
  idToken: string,
  input: { leadId: string; status: string },
): Promise<Result> {
  if (!(await requireAdmin(idToken))) return { ok: false, error: 'unauthorized' };
  const parsed = leadStatusInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'validation' };
  const { leadId, status } = parsed.data;

  try {
    const db = adminDb();
    const ref = db.collection('leads').doc(leadId);
    const outcome = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return 'notFound' as const;
      if (snap.get('status') === status) return 'unchanged' as const;
      tx.update(ref, {
        status,
        statusHistory: FieldValue.arrayUnion({ status, at: Timestamp.now() }),
      });
      return 'changed' as const;
    });
    if (outcome === 'notFound') return { ok: false, error: 'notFound' };
    return { ok: true, data: { changed: outcome === 'changed' } };
  } catch (error) {
    logFailure('updateLeadStatus', error);
    return { ok: false, error: 'server' };
  }
}

/** Add a private note to a lead. */
export async function addLeadNote(
  idToken: string,
  input: { leadId: string; text: string },
): Promise<Result> {
  if (!(await requireAdmin(idToken))) return { ok: false, error: 'unauthorized' };
  const parsed = leadNoteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'validation', fieldErrors: zodFieldErrors(parsed.error) };
  }
  const { leadId, text } = parsed.data;

  try {
    const ref = adminDb().collection('leads').doc(leadId);
    const snap = await ref.get();
    if (!snap.exists) return { ok: false, error: 'notFound' };
    await ref.update({ notes: FieldValue.arrayUnion({ text, at: Timestamp.now() }) });
    return { ok: true, data: { changed: true } };
  } catch (error) {
    logFailure('addLeadNote', error);
    return { ok: false, error: 'server' };
  }
}
