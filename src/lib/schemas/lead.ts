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

/**
 * What the visitor submits in the quote form (FR-2). Used on the client (UX) AND
 * re-run on the server (security). Error messages are i18n keys, not display text.
 */
export const quoteInputSchema = z.object({
  serviceSlug: slugSchema,
  packageId: z.string().min(1).optional(),
  description: z.string().trim().min(20, 'descriptionTooShort').max(5000),
  budgetRangeTZS: z
    .object({ min: priceTZSSchema, max: priceTZSSchema.optional() })
    .refine((b) => b.max === undefined || b.max >= b.min, 'invalidBudget')
    .optional(),
  deadline: z.iso.date().optional(), // YYYY-MM-DD from the date input
  name: z.string().trim().min(2, 'nameRequired').max(100),
  phone: tzPhoneSchema,
  email: z
    .email('invalidEmail')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  preferredContact: preferredContactSchema.default('whatsapp'),
  locale: localeSchema,
});
export type QuoteInput = z.input<typeof quoteInputSchema>;
export type QuoteData = z.output<typeof quoteInputSchema>;

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
