import * as z from 'zod/mini';
import { normalizeTzPhone } from '@/lib/utils/format-phone';

/*
 * Field schemas shared by the public forms (quote, contact). Written with `zod/mini` so the
 * browser bundle stays small. Error messages are i18n keys, translated in the UI.
 */

/** Form inputs send "" for "not chosen"; treat that as undefined. */
export const emptyToUndefined = z.pipe(
  z.literal(''),
  z.transform(() => undefined),
);

/** Tanzanian phone: accepts +255… / 0…, outputs normalised +255XXXXXXXXX. */
export const tzPhone = z.pipe(
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

export const personName = z
  .string()
  .check(z.trim(), z.minLength(2, 'nameRequired'), z.maxLength(100));
export const optionalEmail = z.union([z.optional(z.email('invalidEmail')), emptyToUndefined]);
export const preferredContact = z.enum(['whatsapp', 'phone', 'email']);
export const formLocale = z.enum(['en', 'sw']);
