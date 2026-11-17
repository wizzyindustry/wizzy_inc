import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import type { SubscribeInput } from '@/lib/schemas/subscriber';

/** One document per email address: the id is a hash, so the address is not in the path. */
export const subscriberId = (email: string) =>
  createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 40);

/**
 * Add a newsletter subscriber (server only). Signing up twice changes nothing, and the
 * visitor sees the same answer either way, so the form cannot be used to find out who
 * is on the list. Returns the new document's id (null when already subscribed) so the
 * caller can send the welcome email (or the Cloud Function sends it, on the Blaze plan).
 */
export async function addSubscriber(input: SubscribeInput): Promise<string | null> {
  const db = adminDb();
  const ref = db.collection('subscribers').doc(subscriberId(input.email));
  return db.runTransaction(async (tx) => {
    if ((await tx.get(ref)).exists) return null;
    tx.create(ref, {
      ...input,
      unsubscribeToken: randomBytes(24).toString('base64url'), // 32 characters
      createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  });
}

/** Remove the subscriber with this unsubscribe token. False when no one has it (any more). */
export async function removeSubscriberByToken(token: string): Promise<boolean> {
  const found = await adminDb()
    .collection('subscribers')
    .where('unsubscribeToken', '==', token)
    .limit(1)
    .get();
  const doc = found.docs[0];
  if (!doc) return false;
  await doc.ref.delete();
  return true;
}
