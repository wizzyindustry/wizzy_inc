import type { PortfolioCategory } from '@/lib/schemas/content';

/*
 * Portfolio categories. The owner manages them in Admin → Categories (settings/categories).
 * Until that list is saved the site uses these two built-in ones (same names as the
 * "Categories" messages), so existing projects keep working. Browser-safe (no server code).
 */
export const BUILT_IN_CATEGORIES: PortfolioCategory[] = [
  { slug: 'graphic-design', name: { en: 'Graphic Design', sw: 'Usanifu wa Michoro' } },
  { slug: 'web-development', name: { en: 'Web Development', sw: 'Utengenezaji wa Tovuti' } },
];

/** "mobile-apps" -> "Mobile apps": label for a project whose category was deleted. */
export function slugToLabel(slug: string): string {
  const text = slug.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Display name of a category slug in the visitor's language (Swahili falls back to English). */
export function categoryName(
  slug: string,
  categories: readonly PortfolioCategory[],
  locale: string,
): string {
  const found = categories.find((c) => c.slug === slug);
  if (!found) return slugToLabel(slug);
  return (locale === 'sw' && found.name.sw.trim()) || found.name.en;
}
