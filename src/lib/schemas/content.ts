import { z } from 'zod';
import {
  bilingualListSchema,
  bilingualTextSchema,
  priceTZSSchema,
  serviceCategorySchema,
  siteImagePathSchema,
  slugSchema,
  webUrlSchema,
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
  /** Web development: "View project" (live site) and "View Git repo". */
  liveUrl: webUrlSchema.optional(),
  repoUrl: webUrlSchema.optional(),
  /** Graphic design: "View design" (e.g. Behance, Dribbble or a shared PDF). */
  designUrl: webUrlSchema.optional(),
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
    .partialRecord(
      z.enum(['instagram', 'facebook', 'tiktok', 'x', 'linkedin', 'github']),
      webUrlSchema,
    )
    .default({}),
  hero: z.object({
    headline: bilingualTextSchema,
    subheadline: bilingualTextSchema,
    /** Optional background photo (Storage path). Text sits on a dark overlay for contrast. */
    image: siteImagePathSchema('site/hero').optional(),
  }),
  /** Home page "Why choose us" points (Phase 1.2). Empty = built-in points are shown. */
  whyChooseUs: z
    .array(z.object({ title: bilingualTextSchema, text: bilingualTextSchema }))
    .default([]),
  /** FAQ page (F12): payment, revisions, timelines, file formats, hosting — owner content. */
  faq: z.array(faqItemSchema).default([]),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/** Privacy Policy, Terms & Conditions and Cookie Policy (markdown), edited in admin. */
export const legalPagesSchema = z.object({
  privacy: bilingualTextSchema,
  terms: bilingualTextSchema,
  cookies: bilingualTextSchema,
  /** "Last updated" shown on the pages, YYYY-MM-DD. */
  lastUpdated: z.iso.date(),
});
export type LegalPages = z.infer<typeof legalPagesSchema>;
export const LEGAL_PAGES = ['privacy', 'terms', 'cookies'] as const;
export type LegalPage = (typeof LEGAL_PAGES)[number];

/** One "Tools we use" card. Older documents stored just the name, so a plain string is accepted. */
export const aboutToolSchema = z.union([
  z
    .string()
    .min(1)
    .transform((name) => ({ name })),
  z.object({ name: z.string().min(1), logo: siteImagePathSchema('site/tools').optional() }),
]);
export type AboutTool = { name: string; logo?: string };

/**
 * About page text (F8), edited in admin (Firestore `settings/about`). Until it is saved,
 * the page shows the built-in text from messages/*.json.
 */
export const aboutPageSchema = z.object({
  intro: bilingualTextSchema,
  graphicDesign: bilingualTextSchema,
  webDevelopment: bilingualTextSchema,
  tools: z.array(aboutToolSchema).default([]),
});
export type AboutPage = z.infer<typeof aboutPageSchema>;
