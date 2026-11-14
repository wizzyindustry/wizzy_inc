/**
 * Honeypot field: rendered in every public form but hidden from people (and from screen
 * readers via aria-hidden + tabIndex -1). Humans leave it empty; many spam bots fill it in.
 * The name looks like a normal field on purpose.
 */
export const HONEYPOT_FIELD = 'website';

export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length > 0 : value != null;
}
