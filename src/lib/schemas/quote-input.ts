import * as z from 'zod/mini';
import { normalizeTzPhone } from '@/lib/utils/format-phone';
import { BUDGET_RANGES, type BudgetRangeId } from './quote-constants';

/*
 * Quote form input — shared by the browser (UX) and the Server Action (security).
 * Written with `zod/mini` (same Zod v4 engine, tree-shakable) and the browser loads it lazily
 * (see QuoteForm) to keep the quote page inside the 150 KB JS budget. Server-only shapes (the stored lead) live in ./lead.ts.
 * Error messages are i18n keys, translated in the UI.
 */

export * from './quote-constants';

const budgetRangeIds = BUDGET_RANGES.map((r) => r.id) as [BudgetRangeId, ...BudgetRangeId[]];

// ---- Schema ----
/** Form inputs send "" for "not chosen"; treat that as undefined. */
const emptyToUndefined = z.pipe(
  z.literal(''),
  z.transform(() => undefined),
);
const slug = z.string().check(z.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));

/** Tanzanian phone: accepts +255… / 0…, outputs normalised +255XXXXXXXXX. */
const tzPhone = z.pipe(
  z.string(),
  z.transform((value, ctx) => {
    const normalized = normalizeTzPhone(value.trim());
    if (!normalized) {
      ctx.issues.push({ code: 'custom', message: 'invalidPhone', input: value });
      return z.NEVER;
    }
    return normalized;
  }),
);

export const quoteInputSchema = z.object({
  serviceSlug: z.union([slug, z.literal('')]).check(z.refine((v) => v !== '', 'serviceRequired')),
  packageId: z.union([
    z.optional(z.string().check(z.minLength(1), z.maxLength(100))),
    emptyToUndefined,
  ]),
  description: z
    .string()
    .check(
      z.trim(),
      z.minLength(20, 'descriptionTooShort'),
      z.maxLength(5000, 'descriptionTooLong'),
    ),
  budgetRange: z.union([z.optional(z.enum(budgetRangeIds)), emptyToUndefined]),
  deadline: z.union([z.optional(z.iso.date('invalidDate')), emptyToUndefined]), // YYYY-MM-DD
  name: z.string().check(z.trim(), z.minLength(2, 'nameRequired'), z.maxLength(100)),
  phone: tzPhone,
  email: z.union([z.optional(z.email('invalidEmail')), emptyToUndefined]),
  preferredContact: z.enum(['whatsapp', 'phone', 'email']),
  locale: z.enum(['en', 'sw']),
});
export type QuoteInput = z.input<typeof quoteInputSchema>;
export type QuoteData = z.output<typeof quoteInputSchema>;
