import 'server-only';
import { FieldValue, Timestamp, type DocumentReference } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { deleteFile, saveFile } from '@/lib/media/file-store';
import {
  budgetRangeById,
  formatLeadRef,
  nextLeadNumber,
  type Attachment,
  type QuoteData,
} from '@/lib/schemas/lead';
import type { ContactData } from '@/lib/schemas/contact-input';
import { tanzaniaDateToUtc, yearInTanzania } from '@/lib/utils/format-date';
import { safeFileName } from '@/lib/utils/safe-file-name';

export type UploadFile = { name: string; size: number; type: string; bytes: Buffer };

/** Status fields every new lead starts with. */
function newLeadFields(now: Timestamp) {
  return {
    status: 'new',
    statusHistory: [{ status: 'new', at: now }],
    notes: [],
    createdAt: FieldValue.serverTimestamp(),
  };
}

/** In ONE transaction: take the next WZ-YYYY-NNNN number and create the lead doc. */
async function insertWithRef(
  leadRef: DocumentReference,
  lead: Record<string, unknown>,
): Promise<string> {
  const db = adminDb();
  return db.runTransaction(async (tx) => {
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
}

/**
 * Create a lead (server only, Admin SDK — browsers can never write leads).
 * 1. Upload attachments to quotes/{leadId}/…
 * 2. In ONE transaction: take the next WZ-YYYY-NNNN number and create the lead doc.
 * If step 2 fails, the uploaded files are deleted again.
 */
export async function createQuoteLead(
  data: QuoteData,
  files: UploadFile[],
): Promise<{ id: string; ref: string }> {
  const db = adminDb();
  const leadRef = db.collection('leads').doc();
  const uploaded: string[] = [];

  try {
    const attachments: Attachment[] = [];
    for (const [i, file] of files.entries()) {
      const path = `quotes/${leadRef.id}/${i + 1}-${safeFileName(file.name)}`;
      await saveFile(path, file.bytes, file.type, { privateFile: true });
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
      kind: 'quote',
      name: data.name,
      phone: data.phone,
      preferredContact: data.preferredContact,
      locale: data.locale,
      serviceSlug: data.serviceSlug,
      description: data.description,
      attachments,
      ...newLeadFields(now),
      // Optional fields only when present (Firestore rejects `undefined`).
      ...(data.email && { email: data.email }),
      ...(data.packageId && { packageId: data.packageId }),
      ...(data.budgetRange && { budgetRangeTZS: budgetRangeById(data.budgetRange) }),
      ...(data.deadline && { deadline: Timestamp.fromDate(tanzaniaDateToUtc(data.deadline)) }),
    };

    const ref = await insertWithRef(leadRef, lead);
    return { id: leadRef.id, ref };
  } catch (error) {
    await Promise.allSettled(uploaded.map((path) => deleteFile(path, { privateFile: true })));
    throw error;
  }
}

/**
 * Contact page message (F9) stored as a lead with kind "contact" (no service, no files),
 * so it gets a reference number, the owner email and a place in the admin inbox.
 */
export async function createContactLead(data: ContactData): Promise<{ id: string; ref: string }> {
  const leadRef = adminDb().collection('leads').doc();
  const ref = await insertWithRef(leadRef, {
    kind: 'contact',
    name: data.name,
    phone: data.phone,
    preferredContact: data.preferredContact,
    locale: data.locale,
    description: data.message,
    attachments: [],
    ...newLeadFields(Timestamp.now()),
    ...(data.email && { email: data.email }),
  });
  return { id: leadRef.id, ref };
}
