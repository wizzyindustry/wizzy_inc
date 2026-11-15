/**
 * Public site address (no trailing slash), used for canonical URLs, the sitemap and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in each environment; falls back to localhost for development.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/** "/en/services" -> "https://example.com/en/services" */
export function absoluteUrl(path: string, base: string = SITE_URL): string {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
