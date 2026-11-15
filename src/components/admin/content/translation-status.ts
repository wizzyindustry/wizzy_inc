import type { FieldDef } from './fields';
import { getPath, type Values } from './form-values';

/*
 * Translation drift check (PRD risk "Inconsistent content"; G5, FR-9). The public site
 * falls back to English when Swahili is empty, so nothing breaks — but the owner should
 * see which items still need Swahili text.
 */

const filled = (v: unknown) => typeof v === 'string' && v.trim() !== '';
const hasItems = (v: unknown) => Array.isArray(v) && v.some(filled);

/** Paths of bilingual fields where English has text and Swahili is empty. */
export function missingSwahili(fields: FieldDef[], data: Values): string[] {
  const missing: string[] = [];
  for (const field of fields) {
    const value = getPath(data, field.path);
    if (field.type === 'bilingual' || field.type === 'bilingualLong') {
      const v = value as { en?: unknown; sw?: unknown } | undefined;
      if (filled(v?.en) && !filled(v?.sw)) missing.push(field.path);
    } else if (field.type === 'bilingualList') {
      const v = value as { en?: unknown; sw?: unknown } | undefined;
      if (hasItems(v?.en) && !hasItems(v?.sw)) missing.push(field.path);
    } else if (field.type === 'faq' && Array.isArray(value)) {
      const items = value as {
        q?: { en?: unknown; sw?: unknown };
        a?: { en?: unknown; sw?: unknown };
      }[];
      const gap = items.some(
        (i) => (filled(i.q?.en) && !filled(i.q?.sw)) || (filled(i.a?.en) && !filled(i.a?.sw)),
      );
      if (gap) missing.push(field.path);
    }
  }
  return missing;
}
