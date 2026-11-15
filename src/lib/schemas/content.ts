import { z } from 'zod';
import {
  bilingualListSchema,
  bilingualTextSchema,
  priceTZSSchema,
  serviceCategorySchema,
  slugSchema,
} from './common';

// Shapes of public content documents AFTER they are read by the data layer
// (Firestore Timestamps converted to Date, document id added as `id`).

/** One question and answer (service pages and the FAQ page). */
export const faqItemSchema = z.object({ q: bilingualTextSchema, a: bilingualTextSchema });
export type FaqItem = z.infer<typeof faqItemSchema>;

export const serviceSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  category: serviceCategorySchema,
  title: bilingualTextSchema,
  summary: bilingualTextSchema,
  body: bilingualTextSchema, // markdown
  inclusions: bilingualListSchema,
  turnaroundDays: z
    .object({ min: z.number().int().positive(), max: z.number().int().positive() })
    .refine((d) => d.max >= d.min, 'max must be >= min'),
  startingPriceTZS: priceTZSSchema,
  icon: z.string(),
  order: z.number().int(),
  published: z.boolean(),
  faq: z.array(faqItemSchema).default([]),
  updatedAt: z.date().optional(),
});
export type Service = z.infer<typeof serviceSchema>;

export const packageTierSchema = z.enum(['basic', 'standard', 'premium']);

export const packageSchema = z.object({
  id: z.string(),
  category: serviceCategorySchema,
  tier: packageTierSchema,
  name: bilingualTextSchema,
  priceTZS: priceTZSSchema,
  priceUSD: z.number().nonnegative().optional(),
  features: bilingualListSchema,
  revisions: z.number().int().nonnegative(),
  deliveryDays: z.number().int().positive(),
  highlighted: z.boolean(),
  order: z.number().int(),
  published: z.boolean(),
});
export type Package = z.infer<typeof packageSchema>;

export const portfolioItemSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  category: serviceCategorySchema,
  serviceSlugs: z.array(slugSchema),
  title: bilingualTextSchema,
  clientType: z.string(),
  problem: bilingualTextSchema,
  solution: bilingualTextSchema,
  result: bilingualTextSchema.optional(),
  tools: z.array(z.string()),
  coverImage: z.string().min(1), // Storage path
  gallery: z.array(z.string()),
  liveUrl: z.url().optional(),
  featured: z.boolean(),
  isPersonalProject: z.boolean(),
  published: z.boolean(),
  completedAt: z.date(),
  order: z.number().int(),
});
export type PortfolioItem = z.infer<typeof portfolioItemSchema>;

export const testimonialSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string(),
  company: z.string().optional(),
  quote: bilingualTextSchema,
  rating: z.number().int().min(1).max(5).optional(),
  portfolioId: z.string().optional(),
  consentGiven: z.literal(true), // never publish a testimonial without consent
  published: z.boolean(),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

export const siteSettingsSchema = z.object({
  phone: z.string(),
  whatsappNumber: z.string().regex(/^255\d{9}$/, 'Use 255XXXXXXXXX (no +)'),
  email: z.email(),
  location: bilingualTextSchema,
  workingHours: bilingualTextSchema,
  socialLinks: z
    .partialRecord(z.enum(['instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'github']), z.url())
    .default({}),
  hero: z.object({ headline: bilingualTextSchema, subheadline: bilingualTextSchema }),
  /** FAQ page (F12): payment, revisions, timelines, file formats, hosting — owner content. */
  faq: z.array(faqItemSchema).default([]),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/**
 * About page text (F8), edited in admin (Firestore `settings/about`). Until it is saved,
 * the page shows the built-in text from messages/*.json.
 */
export const aboutPageSchema = z.object({
  intro: bilingualTextSchema,
  graphicDesign: bilingualTextSchema,
  webDevelopment: bilingualTextSchema,
  tools: z.array(z.string().min(1)).default([]),
});
export type AboutPage = z.infer<typeof aboutPageSchema>;
