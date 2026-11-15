import { z } from 'zod';
import { toPlain } from '@/lib/data/to-plain';
import { leadSchema, leadStatusSchema, type Lead, type LeadStatus } from './lead';

/** Pipeline order shown in the admin (FR-10): new → contacted → quoted → won | lost. */
export const LEAD_PIPELINE: readonly LeadStatus[] = leadStatusSchema.options;

/** Internal note on a lead (A2). Only admins ever see notes. */
export const leadNoteInputSchema = z.object({
  leadId: z.string().regex(/^[\w-]{1,128}$/),
  text: z.string().trim().min(1, 'noteRequired').max(2000, 'noteTooLong'),
});

export const leadStatusInputSchema = z.object({
  leadId: z.string().regex(/^[\w-]{1,128}$/),
  status: leadStatusSchema,
});

/** Firestore document -> Lead (works with browser and server Timestamps). Null if malformed. */
export function parseLeadDoc(id: string, data: unknown): Lead | null {
  const parsed = leadSchema.safeParse({ ...(toPlain(data) as object), id });
  return parsed.success ? parsed.data : null;
}

/** Free-text search over the fields the owner remembers: ref, name, phone, email. */
export function leadMatches(lead: Lead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  // Phones are stored as +255…; let "0712 345" match too.
  const digits = q.replace(/\D/g, '').replace(/^0/, '255');
  return (
    lead.ref.toLowerCase().includes(q) ||
    lead.name.toLowerCase().includes(q) ||
    (lead.email?.toLowerCase().includes(q) ?? false) ||
    (digits.length >= 3 && lead.phone.replace(/\D/g, '').includes(digits))
  );
}
