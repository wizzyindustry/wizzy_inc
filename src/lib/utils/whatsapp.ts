const WHATSAPP_NUMBER = /^255\d{9}$/;

/** Pick the WhatsApp number: site settings first, then the env fallback. Null if neither is valid. */
export function resolveWhatsAppNumber(
  fromSettings?: string | null,
  fromEnv?: string,
): string | null {
  for (const candidate of [fromSettings, fromEnv]) {
    if (candidate && WHATSAPP_NUMBER.test(candidate)) return candidate;
  }
  return null;
}

/** Click-to-chat link. `number` is 255XXXXXXXXX (no "+"). */
export function buildWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
