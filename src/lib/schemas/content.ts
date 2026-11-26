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
  /** Slug of a portfolio category (settings/categories; built in: graphic-design, web-development). */
  category: slugSchema,
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

/** Blog post (Company → Blog). Body is markdown, like service pages. */
export const blogPostSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: bilingualTextSchema,
  excerpt: bilingualTextSchema,
  body: bilingualTextSchema, // markdown
  coverImage: siteImagePathSchema('site/blog').optional(),
  author: z.string().trim().optional(),
  publishedAt: z.date(),
  published: z.boolean(),
});
export type BlogPost = z.infer<typeof blogPostSchema>;

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

/** Home page "Our impact" number, e.g. value "120+" with label "Happy clients". */
export const impactStatSchema = z.object({
  value: z.string().trim().min(1).max(12),
  label: bilingualTextSchema,
});

/** A brand we work with (home page logo strip). */
export const partnerSchema = z.object({
  name: z.string().trim().min(1),
  logo: siteImagePathSchema('site/partners').optional(),
  url: webUrlSchema.optional(),
});

/** An office (home page "Visit our office" and the Offices page). Map = OpenStreetMap. */
export const officeSchema = z.object({
  name: bilingualTextSchema,
  address: bilingualTextSchema,
  hours: bilingualTextSchema.optional(),
  phone: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type Office = z.infer<typeof officeSchema>;

/**
 * Company facts (Firestore `settings/company`, Admin → Company info): "Our story", the fact
 * cards, partners, impact numbers and offices. Every part is optional — an empty part is
 * simply not shown (no invented numbers or names).
 */
export const companySchema = z.object({
  story: bilingualTextSchema.optional(),
  foundedYear: z.number().int().min(1900).max(2100).optional(),
  headquarters: bilingualTextSchema.optional(),
  founderName: z.string().trim().optional(),
  partners: z.array(partnerSchema).default([]),
  impact: z.array(impactStatSchema).default([]),
  offices: z.array(officeSchema).default([]),
});
export type Company = z.infer<typeof companySchema>;

/**
 * Support page (Company → Support), Firestore `settings/support`. Empty = built-in text.
 * Topics use the same { title, text } shape as the home "Why choose us" points.
 */
export const supportPageSchema = z.object({
  intro: bilingualTextSchema.optional(),
  topics: z.array(z.object({ title: bilingualTextSchema, text: bilingualTextSchema })).default([]),
});
export type SupportPage = z.infer<typeof supportPageSchema>;

/** Press page: one person in "Leadership". Social links are shown as icons. */
export const leaderSchema = z.object({
  name: z.string().trim().min(1),
  role: bilingualTextSchema,
  bio: bilingualTextSchema.optional(),
  photo: siteImagePathSchema('site/people').optional(),
  email: z.email().optional(),
  website: webUrlSchema.optional(),
  linkedin: webUrlSchema.optional(),
  x: webUrlSchema.optional(),
  instagram: webUrlSchema.optional(),
  facebook: webUrlSchema.optional(),
  tiktok: webUrlSchema.optional(),
  youtube: webUrlSchema.optional(),
  pinterest: webUrlSchema.optional(),
  behance: webUrlSchema.optional(),
  dribbble: webUrlSchema.optional(),
  github: webUrlSchema.optional(),
});
export type Leader = z.infer<typeof leaderSchema>;

/** Press page "Media resources": a logo, a document (e.g. licence PDF) or a photo. */
export const MEDIA_KINDS = ['logo', 'document', 'photo'] as const;
export const mediaResourceSchema = z.object({
  title: bilingualTextSchema,
  kind: z.enum(MEDIA_KINDS),
  file: siteImagePathSchema('site/press'),
  description: bilingualTextSchema.optional(),
});
export type MediaResource = z.infer<typeof mediaResourceSchema>;

/** Press page "Brand colours": the RGB value is worked out from the HEX code. */
export const brandColorSchema = z.object({
  name: z.string().trim().min(1),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Use #RRGGBB')
    .transform((hex) => hex.toUpperCase()),
  usage: bilingualTextSchema.optional(),
});
export type BrandColor = z.infer<typeof brandColorSchema>;

/** Press page (Company → Press), Firestore `settings/press`. Empty parts are hidden. */
export const pressPageSchema = z.object({
  leaders: z.array(leaderSchema).default([]),
  media: z.array(mediaResourceSchema).default([]),
  colors: z.array(brandColorSchema).default([]),
});
export type PressPage = z.infer<typeof pressPageSchema>;

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

/** One portfolio category: the slug is stored on projects and used in ?category= links. */
export const portfolioCategorySchema = z.object({
  slug: slugSchema,
  name: bilingualTextSchema,
});
export type PortfolioCategory = z.infer<typeof portfolioCategorySchema>;

/** Portfolio categories (Admin → Categories), Firestore `settings/categories`, in display order. */
export const portfolioCategoriesSchema = z
  .object({ items: z.array(portfolioCategorySchema).max(30) })
  .superRefine(({ items }, ctx) => {
    const seen = new Set<string>();
    items.forEach((item, i) => {
      if (seen.has(item.slug)) {
        ctx.addIssue({ code: 'custom', path: ['items', i, 'slug'], message: 'Duplicate slug' });
      }
      seen.add(item.slug);
    });
  });
export type PortfolioCategories = z.infer<typeof portfolioCategoriesSchema>;

/** A GitHub user or organisation name (letters, digits and single dashes, max 39). */
export const githubUsernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/, 'Invalid GitHub username');

/** GitHub projects (Admin → GitHub), Firestore `settings/github`. Public repos only. */
export const githubSettingsSchema = z.object({
  show: z.boolean(),
  username: githubUsernameSchema.optional(),
  /** How many of the latest repos the home page shows (0 hides the home section). */
  homeCount: z.number().int().min(0).max(6),
  /** Repo names the owner chose not to show. */
  hiddenRepos: z.array(z.string().trim().min(1).max(100)).max(200).default([]),
});
export type GithubSettings = z.infer<typeof githubSettingsSchema>;
