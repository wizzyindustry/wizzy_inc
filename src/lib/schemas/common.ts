import { z } from 'zod';

/** Bilingual text stored in Firestore. English is required; Swahili may be empty (falls back to English). */
export const bilingualTextSchema = z.object({
  en: z.string().min(1),
  sw: z.string(),
});
export type BilingualText = z.infer<typeof bilingualTextSchema>;

export const localeSchema = z.enum(['en', 'sw']);

export const serviceCategorySchema = z.enum(['graphic-design', 'web-development']);
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;

/** Prices are whole Tanzanian shillings. */
export const priceTZSSchema = z.number().int().nonnegative();
