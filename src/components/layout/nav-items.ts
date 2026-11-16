/** Main navigation. `key` is a translation key in the `Nav` namespace. */

/** Plain links in the desktop header (Services and Company are dropdown menus). */
export const NAV_ITEMS = [
  { href: '/portfolio', key: 'portfolio' },
  { href: '/pricing', key: 'pricing' },
  { href: '/contact', key: 'contact' },
] as const;

/** The "Company" dropdown: about the business, news, help, offices and press material. */
export const COMPANY_ITEMS = [
  { href: '/about', key: 'about' },
  { href: '/blog', key: 'blog' },
  { href: '/support', key: 'support' },
  { href: '/offices', key: 'offices' },
  { href: '/press', key: 'press' },
] as const;

/** Secondary pages: in the mobile menu and footer, not the desktop header (keeps it uncrowded). */
export const SECONDARY_NAV_ITEMS = [{ href: '/faq', key: 'faq' }] as const;

/** Every page, for the footer. */
export const ALL_NAV_ITEMS = [
  { href: '/services', key: 'services' },
  ...NAV_ITEMS,
  ...COMPANY_ITEMS,
  ...SECONDARY_NAV_ITEMS,
] as const;

/** A service link in the Services menu (title already in the visitor's language). */
export type ServiceMenuLink = {
  href: string;
  title: string;
  category: 'graphic-design' | 'web-development';
};
