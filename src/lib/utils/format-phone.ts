/**
 * Normalise a Tanzanian phone number to +255XXXXXXXXX.
 * Accepts "+255XXXXXXXXX", "255XXXXXXXXX" and "0XXXXXXXXX", ignoring spaces, dashes and brackets.
 * Returns null when the input is not a valid Tanzanian number.
 */
export function normalizeTzPhone(input: string): string | null {
  const compact = input.replace(/[\s\-()]/g, '');
  const match = /^(?:\+?255|0)(\d{9})$/.exec(compact);
  return match ? `+255${match[1]}` : null;
}

/** Display form: +255 712 345 678 */
export function formatPhone(normalized: string): string {
  const m = /^\+255(\d{3})(\d{3})(\d{3})$/.exec(normalized);
  return m ? `+255 ${m[1]} ${m[2]} ${m[3]}` : normalized;
}
