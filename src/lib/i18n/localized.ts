import type { BilingualText } from '@/lib/schemas/common';
import type { Locale } from './routing';

/** Read a bilingual DB field for a locale, falling back to English when Swahili is empty (FR-9). */
export function localized(field: BilingualText, locale: Locale): string {
  const value = field[locale];
  return value.trim().length > 0 ? value : field.en;
}
