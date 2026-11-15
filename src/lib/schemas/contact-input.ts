import * as z from 'zod/mini';
import { formLocale, optionalEmail, personName, preferredContact, tzPhone } from './form-fields';

/**
 * Contact page form (F9) — shared by the browser (UX) and `submitContact` (security).
 * A contact message is stored as a lead with `kind: "contact"` (owner decision, slice 11).
 */
export const contactInputSchema = z.object({
  name: personName,
  phone: tzPhone,
  email: optionalEmail,
  preferredContact,
  message: z
    .string()
    .check(z.trim(), z.minLength(10, 'messageTooShort'), z.maxLength(2000, 'messageTooLong')),
  locale: formLocale,
});
export type ContactInput = z.input<typeof contactInputSchema>;
export type ContactData = z.output<typeof contactInputSchema>;
