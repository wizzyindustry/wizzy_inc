import { z } from 'zod';

/** Bilingual text stored in Firestore. English is required; Swahili may be empty (falls back to English). */
export const bilingualTextSchema = z.object({
  en: z.string().min(1),
  sw: z.string(),
});
export type BilingualText = z.infer<typeof bilingualTextSchema>;

/** Bilingual list (e.g. inclusions, package features). */
export const bilingualListSchema = z.object({
  en: z.array(z.string().min(1)),
  sw: z.array(z.string()),
});
export type BilingualList = z.infer<typeof bilingualListSchema>;

/**
 * A web link that is safe to put in an href: only http(s) — never `javascript:` or `data:`.
 */
export const webUrlSchema = z.httpUrl();

/** A Storage path of an uploaded site image, e.g. "site/hero/1700000000-bg.webp". */
export const siteImagePathSchema = (folder: 'site/hero' | 'site/tools') =>
  z.string().regex(new RegExp(`^${folder}/[A-Za-z0-9._-]+$`), 'Invalid image');

export const localeSchema = z.enum(['en', 'sw']);

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

export const serviceCategorySchema = z.enum(['graphic-design', 'web-development']);
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;

/** Prices are whole Tanzanian shillings. */
export const priceTZSSchema = z.number().int().nonnegative();
