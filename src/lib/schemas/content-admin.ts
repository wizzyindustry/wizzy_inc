import { z } from 'zod';
import { tanzaniaDateToUtc } from '@/lib/utils/format-date';
import {
  aboutPageSchema,
  legalPagesSchema,
  packageSchema,
  portfolioItemSchema,
  serviceSchema,
  siteSettingsSchema,
  testimonialSchema,
} from './content';

/*
 * What the admin editors send to the server (A4, A5, A6). Built from the public content
 * schemas (the single source of truth) minus server-managed fields. Empty optional
 * fields are removed by the editor before sending.
 */

export const CONTENT_COLLECTIONS = ['services', 'packages', 'portfolio', 'testimonials'] as const;
export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];

export function isContentCollection(value: string): value is ContentCollection {
  return (CONTENT_COLLECTIONS as readonly string[]).includes(value);
}

/** Firestore auto-ids and our seed ids: letters, digits, dash, underscore. */
export const docIdSchema = z.string().regex(/^[\w-]{1,128}$/);

export const contentInputSchemas = {
  services: serviceSchema.omit({ id: true, updatedAt: true }),
  packages: packageSchema.omit({ id: true }),
  portfolio: portfolioItemSchema
    .omit({ id: true })
    .extend({ completedAt: z.iso.date().transform(tanzaniaDateToUtc) }), // YYYY-MM-DD in the form
  testimonials: testimonialSchema.omit({ id: true }),
} satisfies Record<ContentCollection, z.ZodType>;

export const settingsInputSchema = siteSettingsSchema;
export const aboutInputSchema = aboutPageSchema;
export const legalInputSchema = legalPagesSchema;

/** Collections whose `slug` must be unique (it is the public URL). */
export const SLUG_COLLECTIONS: readonly ContentCollection[] = ['services', 'portfolio'];

/** Portfolio images must live in the item's own folder (no pointing at other files). */
export function portfolioPathsValid(itemId: string, paths: string[]): boolean {
  const prefix = `portfolio/${itemId}/`;
  return paths.every((p) => p.startsWith(prefix) && !p.includes('..') && p.length < 300);
}

/** Field path ("title.en", "faq.0.q.en") -> generic message key for the editor. */
export function contentFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in result)) result[path] = 'invalidField';
  }
  return result;
}
