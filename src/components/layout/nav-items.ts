/** Main navigation. `key` is a translation key in the `Nav` namespace. */
export const NAV_ITEMS = [
  { href: '/services', key: 'services' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/pricing', key: 'pricing' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

/** Secondary pages: in the mobile menu and footer, not the desktop header (keeps it uncrowded). */
export const SECONDARY_NAV_ITEMS = [{ href: '/faq', key: 'faq' }] as const;

export const ALL_NAV_ITEMS = [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS];
