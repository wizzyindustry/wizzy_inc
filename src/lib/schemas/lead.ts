import { z } from 'zod';
import { localeSchema, priceTZSSchema, slugSchema } from './common';
import { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES } from './quote-input';

// The quote form input (shared with the browser) lives in ./quote-input.ts. Re-exported
// here so server code has one import for everything lead-related.
export * from './quote-input';

export const attachmentSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1).max(200),
  size: z.number().int().positive().max(MAX_ATTACHMENT_BYTES),
  contentType: z.enum(ALLOWED_ATTACHMENT_TYPES),
});
export type Attachment = z.infer<typeof attachmentSchema>;

// ---- Lead pipeline (FR-10) ----
export const leadStatusSchema = z.enum(['new', 'contacted', 'quoted', 'won', 'lost']);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const preferredContactSchema = z.enum(['whatsapp', 'phone', 'email']);

/** Next counter value for reference numbers; numbering restarts each year. */
export function nextLeadNumber(
  counter: { year: number; value: number } | null,
  year: number,
): { year: number; value: number } {
  return counter && counter.year === year ? { year, value: counter.value + 1 } : { year, value: 1 };
}

/** A lead document as read by admin code (Timestamps converted to Date). */
export const leadSchema = z.object({
  id: z.string(),
  ref: z.string().regex(/^WZ-\d{4}-\d{4,}$/),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  preferredContact: preferredContactSchema,
  locale: localeSchema,
  serviceSlug: slugSchema,
  packageId: z.string().optional(),
  description: z.string(),
  budgetRangeTZS: z.object({ min: priceTZSSchema, max: priceTZSSchema.optional() }).optional(),
  deadline: z.date().optional(),
  attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS),
  status: leadStatusSchema,
  statusHistory: z.array(z.object({ status: leadStatusSchema, at: z.date() })),
  notes: z.array(z.object({ text: z.string(), at: z.date() })),
  source: z.string().optional(),
  createdAt: z.date(),
});
export type Lead = z.infer<typeof leadSchema>;

/** Reference number, e.g. formatLeadRef(2026, 42) -> "WZ-2026-0042". */
export function formatLeadRef(year: number, value: number): string {
  return `WZ-${year}-${String(value).padStart(4, '0')}`;
}
