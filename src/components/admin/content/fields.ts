import type { SiteImageKind } from '@/lib/schemas/common';
import type { ContentCollection } from '@/lib/schemas/content-admin';

/*
 * Field lists for the generic content editor. `path` is the property in the Firestore
 * document ("hero.headline", "turnaroundDays.min"). Labels and hints are translated with
 * the path as key (dots -> "_"), see messages Admin.content.fields / .hints.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'bilingual' // { en, sw } one line each
  | 'bilingualLong' // { en, sw } multi-line (markdown where noted)
  | 'bilingualList' // { en: string[], sw: string[] } one item per line
  | 'lines' // string[] one item per line
  | 'services' // string[] of service slugs (checkboxes)
  | 'portfolioRef' // optional portfolio item id
  | 'image' // one Storage path
  | 'gallery' // Storage paths
  | 'faq' // { q: {en,sw}, a: {en,sw} }[]
  | 'points' // { title: {en,sw}, text: {en,sw} }[] — home "Why choose us"
  | 'tools' // { name, logo? }[] — About page "Tools we use" cards
  | 'list'; // object[] — each item edited with `itemFields` (partners, offices, …)

export type FieldDef = {
  path: string;
  type: FieldType;
  optional?: boolean;
  hint?: boolean;
  options?: readonly string[];
  numeric?: boolean; // select whose values are numbers
  /** Label/hint translation key when two editors use the same path differently. */
  labelKey?: string;
  /** Image fields outside the portfolio: where the upload goes (Storage site/…). */
  siteImage?: SiteImageKind;
  /** Number with decimals and minus sign (map coordinates). */
  decimal?: boolean;
  /** `list` fields: the fields of one item (paths relative to the item). */
  itemFields?: FieldDef[];
  /** Only shown (and saved) when another field has one of these values. */
  showWhen?: { path: string; values: readonly string[] };
};

/** Single documents in the `settings` collection (one editor page each, never deleted). */
export const SINGLE_DOCS = {
  settings: { id: 'site', heading: 'settingsHeading', publicPath: null },
  about: { id: 'about', heading: 'aboutHeading', publicPath: '/en/about' },
  legal: { id: 'legal', heading: 'legalHeading', publicPath: '/en/privacy' },
  company: { id: 'company', heading: 'companyHeading', publicPath: '/en' },
} as const;
export type SingleDocKind = keyof typeof SINGLE_DOCS;
export const isSingleDoc = (kind: string): kind is SingleDocKind => kind in SINGLE_DOCS;

export type EditorKind = ContentCollection | SingleDocKind;

const CATEGORY = ['graphic-design', 'web-development'] as const;
const WEB_ONLY = { path: 'category', values: ['web-development'] } as const;
const DESIGN_ONLY = { path: 'category', values: ['graphic-design'] } as const;

export const CONTENT_FIELDS: Record<EditorKind, FieldDef[]> = {
  services: [
    { path: 'title', type: 'bilingual' },
    { path: 'slug', type: 'text', hint: true },
    { path: 'category', type: 'select', options: CATEGORY },
    { path: 'summary', type: 'bilingual' },
    { path: 'body', type: 'bilingualLong', hint: true },
    { path: 'inclusions', type: 'bilingualList', hint: true },
    { path: 'startingPriceTZS', type: 'number', hint: true },
    { path: 'turnaroundDays.min', type: 'number' },
    { path: 'turnaroundDays.max', type: 'number' },
    { path: 'faq', type: 'faq' },
    { path: 'icon', type: 'text', hint: true },
    { path: 'order', type: 'number', hint: true },
    { path: 'published', type: 'checkbox' },
  ],
  packages: [
    { path: 'name', type: 'bilingual' },
    { path: 'category', type: 'select', options: CATEGORY },
    { path: 'tier', type: 'select', options: ['basic', 'standard', 'premium'] },
    { path: 'priceTZS', type: 'number', hint: true },
    { path: 'priceUSD', type: 'number', optional: true },
    { path: 'features', type: 'bilingualList', hint: true },
    { path: 'revisions', type: 'number' },
    { path: 'deliveryDays', type: 'number' },
    { path: 'highlighted', type: 'checkbox' },
    { path: 'order', type: 'number', hint: true },
    { path: 'published', type: 'checkbox' },
  ],
  portfolio: [
    { path: 'title', type: 'bilingual' },
    { path: 'slug', type: 'text', hint: true },
    { path: 'category', type: 'select', options: CATEGORY },
    { path: 'serviceSlugs', type: 'services' },
    { path: 'clientType', type: 'text', hint: true },
    { path: 'isPersonalProject', type: 'checkbox', hint: true },
    { path: 'problem', type: 'bilingualLong' },
    { path: 'solution', type: 'bilingualLong' },
    { path: 'result', type: 'bilingualLong', optional: true },
    { path: 'tools', type: 'lines', hint: true },
    { path: 'coverImage', type: 'image' },
    { path: 'gallery', type: 'gallery' },
    { path: 'liveUrl', type: 'text', optional: true, hint: true, showWhen: WEB_ONLY },
    { path: 'repoUrl', type: 'text', optional: true, hint: true, showWhen: WEB_ONLY },
    { path: 'designUrl', type: 'text', optional: true, hint: true, showWhen: DESIGN_ONLY },
    { path: 'completedAt', type: 'date' },
    { path: 'featured', type: 'checkbox', hint: true },
    { path: 'order', type: 'number', hint: true },
    { path: 'published', type: 'checkbox' },
  ],
  testimonials: [
    { path: 'name', type: 'text' },
    { path: 'role', type: 'text' },
    { path: 'company', type: 'text', optional: true },
    { path: 'quote', type: 'bilingualLong' },
    {
      path: 'rating',
      type: 'select',
      optional: true,
      numeric: true,
      options: ['1', '2', '3', '4', '5'],
    },
    { path: 'portfolioId', type: 'portfolioRef', optional: true },
    { path: 'consentGiven', type: 'checkbox', hint: true },
    { path: 'published', type: 'checkbox' },
  ],
  posts: [
    { path: 'title', type: 'bilingual' },
    { path: 'slug', type: 'text', hint: true },
    { path: 'excerpt', type: 'bilingual', hint: true, labelKey: 'postExcerpt' },
    { path: 'body', type: 'bilingualLong', hint: true, labelKey: 'postBody' },
    { path: 'coverImage', type: 'image', optional: true, siteImage: 'blog', labelKey: 'postCover' },
    { path: 'author', type: 'text', optional: true },
    { path: 'publishedAt', type: 'date', hint: true },
    { path: 'published', type: 'checkbox' },
  ],
  settings: [
    { path: 'hero.headline', type: 'bilingual' },
    { path: 'hero.subheadline', type: 'bilingual' },
    { path: 'hero.image', type: 'image', optional: true, hint: true, siteImage: 'hero' },
    { path: 'phone', type: 'text', hint: true },
    { path: 'whatsappNumber', type: 'text', hint: true },
    { path: 'email', type: 'text' },
    { path: 'location', type: 'bilingual' },
    { path: 'workingHours', type: 'bilingual' },
    { path: 'whyChooseUs', type: 'points', hint: true },
    { path: 'faq', type: 'faq', hint: true },
    { path: 'socialLinks.instagram', type: 'text', optional: true },
    { path: 'socialLinks.facebook', type: 'text', optional: true },
    { path: 'socialLinks.tiktok', type: 'text', optional: true },
    { path: 'socialLinks.x', type: 'text', optional: true },
    { path: 'socialLinks.linkedin', type: 'text', optional: true },
    { path: 'socialLinks.github', type: 'text', optional: true },
  ],
  about: [
    { path: 'intro', type: 'bilingualLong', hint: true },
    { path: 'graphicDesign', type: 'bilingualLong', hint: true },
    { path: 'webDevelopment', type: 'bilingualLong', hint: true },
    { path: 'tools', type: 'tools', hint: true, labelKey: 'aboutTools' },
  ],
  company: [
    { path: 'story', type: 'bilingualLong', optional: true, hint: true },
    { path: 'foundedYear', type: 'number', optional: true, hint: true },
    { path: 'headquarters', type: 'bilingual', optional: true, hint: true },
    { path: 'founderName', type: 'text', optional: true, hint: true },
    {
      path: 'impact',
      type: 'list',
      hint: true,
      itemFields: [
        { path: 'value', type: 'text', hint: true },
        { path: 'label', type: 'bilingual' },
      ],
    },
    {
      path: 'partners',
      type: 'list',
      hint: true,
      itemFields: [
        { path: 'name', type: 'text' },
        { path: 'logo', type: 'image', optional: true, siteImage: 'partner' },
        { path: 'url', type: 'text', optional: true },
      ],
    },
    {
      path: 'offices',
      type: 'list',
      hint: true,
      itemFields: [
        { path: 'name', type: 'bilingual' },
        { path: 'address', type: 'bilingual' },
        { path: 'hours', type: 'bilingual', optional: true },
        { path: 'phone', type: 'text', optional: true },
        { path: 'latitude', type: 'number', decimal: true, hint: true },
        { path: 'longitude', type: 'number', decimal: true },
      ],
    },
  ],
  legal: [
    { path: 'lastUpdated', type: 'date', hint: true },
    { path: 'privacy', type: 'bilingualLong', hint: true },
    { path: 'terms', type: 'bilingualLong', hint: true },
    { path: 'cookies', type: 'bilingualLong', hint: true },
  ],
};

/** False for a field that does not apply, e.g. "View Git repo" on a graphic design project. */
export function fieldVisible(field: FieldDef, values: Record<string, unknown>): boolean {
  if (!field.showWhen) return true;
  const current = field.showWhen.path
    .split('.')
    .reduce<unknown>((v, k) => (v as Record<string, unknown> | undefined)?.[k], values);
  return field.showWhen.values.includes(String(current ?? ''));
}

/** Translation key for a field's label and hint (Admin.content.fields / .hints). */
export const fieldTextKey = (field: FieldDef) => field.labelKey ?? fieldKey(field.path);

/** Translation key for a field path: "hero.headline" -> "hero_headline". */
export const fieldKey = (path: string) => path.replace(/\./g, '_');
