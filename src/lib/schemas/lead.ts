import { z } from 'zod';
import { normalizeTzPhone } from '@/lib/utils/format-phone';
import { localeSchema, priceTZSSchema, slugSchema } from './common';

// ---- Attachment limits (FR-3) — enforced in UI, server and storage.rules ----
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

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

/** Tanzanian phone: accepts +255… / 0…, outputs normalised +255XXXXXXXXX. */
export const tzPhoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizeTzPhone(value);
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'invalidPhone' });
      return z.NEVER;
    }
    return normalized;
  });

// ---- Budget ranges offered in the quote form (owner-approved 2026-11-15) ----
export const BUDGET_RANGES = [
  { id: 'under-100k', min: 0, max: 100_000 },
  { id: '100k-300k', min: 100_000, max: 300_000 },
  { id: '300k-1m', min: 300_000, max: 1_000_000 },
  { id: 'over-1m', min: 1_000_000 },
] as const satisfies readonly { id: string; min: number; max?: number }[];
export type BudgetRangeId = (typeof BUDGET_RANGES)[number]['id'];
const budgetRangeIds = BUDGET_RANGES.map((r) => r.id) as [BudgetRangeId, ...BudgetRangeId[]];

export function budgetRangeById(id: BudgetRangeId): { min: number; max?: number } {
  const range = BUDGET_RANGES.find((r) => r.id === id);
  if (!range) throw new RangeError(`Unknown budget range ${id}`);
  return 'max' in range ? { min: range.min, max: range.max } : { min: range.min };
}

/** Form inputs send "" for "not chosen"; treat that as undefined. */
const emptyToUndefined = z.literal('').transform(() => undefined);

/**
 * What the visitor submits in the quote form (FR-2). Used on the client (UX) AND
 * re-run on the server (security). Error messages are i18n keys, not display text.
 */
export const quoteInputSchema = z.object({
  serviceSlug: slugSchema.or(z.literal('')).refine((v) => v !== '', 'serviceRequired'),
  packageId: z.string().min(1).max(100).optional().or(emptyToUndefined),
  description: z.string().trim().min(20, 'descriptionTooShort').max(5000, 'descriptionTooLong'),
  budgetRange: z.enum(budgetRangeIds).optional().or(emptyToUndefined),
  deadline: z.iso.date('invalidDate').optional().or(emptyToUndefined), // YYYY-MM-DD
  name: z.string().trim().min(2, 'nameRequired').max(100),
  phone: tzPhoneSchema,
  email: z.email('invalidEmail').optional().or(emptyToUndefined),
  preferredContact: preferredContactSchema,
  locale: localeSchema,
});
export type QuoteInput = z.input<typeof quoteInputSchema>;
export type QuoteData = z.output<typeof quoteInputSchema>;

/** Minimal file info, available both from browser `File` and server `File`. */
type FileLike = { name: string; size: number; type: string };

/** Validate attachments (FR-3). Returns an i18n error key, or null when fine. */
export function attachmentError(files: FileLike[]): string | null {
  if (files.length > MAX_ATTACHMENTS) return 'tooManyFiles';
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) return 'fileTooLarge';
    if (!(ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(file.type)) return 'fileType';
  }
  return null;
}

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
