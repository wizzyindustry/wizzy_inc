import * as z from 'zod/mini';
import {
  emptyToUndefined,
  formLocale,
  optionalEmail,
  personName,
  preferredContact,
  tzPhone,
} from './form-fields';
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
const slug = z.string().check(z.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));

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
  name: personName,
  phone: tzPhone,
  email: optionalEmail,
  preferredContact,
  locale: formLocale,
});
export type QuoteInput = z.input<typeof quoteInputSchema>;
export type QuoteData = z.output<typeof quoteInputSchema>;
