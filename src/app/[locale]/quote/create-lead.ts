import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import {
  budgetRangeById,
  formatLeadRef,
  nextLeadNumber,
  type Attachment,
  type QuoteData,
} from '@/lib/schemas/lead';
import { tanzaniaDateToUtc, yearInTanzania } from '@/lib/utils/format-date';

export type UploadFile = { name: string; size: number; type: string; bytes: Buffer };

/** Keep storage paths safe and readable: letters, digits, dot, dash, underscore. */
function safeFileName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_');
  return cleaned.slice(-80) || 'file';
}

/**
 * Create a lead (server only, Admin SDK — browsers can never write leads).
 * 1. Upload attachments to quotes/{leadId}/…
 * 2. In ONE transaction: take the next WZ-YYYY-NNNN number and create the lead doc.
 * If step 2 fails, the uploaded files are deleted again.
 */
export async function createLead(
  data: QuoteData,
  files: UploadFile[],
): Promise<{ id: string; ref: string }> {
  const db = adminDb();
  const bucket = adminStorage().bucket();
  const leadRef = db.collection('leads').doc();
  const uploaded: string[] = [];

  try {
    const attachments: Attachment[] = [];
    for (const [i, file] of files.entries()) {
      const path = `quotes/${leadRef.id}/${i + 1}-${safeFileName(file.name)}`;
      await bucket.file(path).save(file.bytes, { contentType: file.type, resumable: false });
      uploaded.push(path);
      attachments.push({
        path,
        name: file.name.slice(0, 200),
        size: file.size,
        contentType: file.type as Attachment['contentType'],
      });
    }

    const now = Timestamp.now(); // server clock (arrays can't hold serverTimestamp())
    const lead = {
      name: data.name,
      phone: data.phone,
      preferredContact: data.preferredContact,
      locale: data.locale,
      serviceSlug: data.serviceSlug,
      description: data.description,
      attachments,
      status: 'new',
      statusHistory: [{ status: 'new', at: now }],
      notes: [],
      createdAt: FieldValue.serverTimestamp(),
      // Optional fields only when present (Firestore rejects `undefined`).
      ...(data.email && { email: data.email }),
      ...(data.packageId && { packageId: data.packageId }),
      ...(data.budgetRange && { budgetRangeTZS: budgetRangeById(data.budgetRange) }),
      ...(data.deadline && { deadline: Timestamp.fromDate(tanzaniaDateToUtc(data.deadline)) }),
    };

    const ref = await db.runTransaction(async (tx) => {
      const counterRef = db.doc('counters/leads');
      const snap = await tx.get(counterRef);
      const previous = snap.exists
        ? { year: Number(snap.get('year')), value: Number(snap.get('value')) }
        : null;
      const next = nextLeadNumber(previous, yearInTanzania());
      const leadNumber = formatLeadRef(next.year, next.value);
      tx.set(counterRef, next);
      tx.create(leadRef, { ...lead, ref: leadNumber });
      return leadNumber;
    });

    return { id: leadRef.id, ref };
  } catch (error) {
    await Promise.allSettled(uploaded.map((path) => bucket.file(path).delete()));
    throw error;
  }
}
