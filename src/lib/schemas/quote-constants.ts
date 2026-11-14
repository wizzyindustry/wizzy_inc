/*
 * Quote form constants and checks with NO Zod import, so the quote page can render
 * without loading the validation library up front (performance budget).
 */

// ---- Attachment limits (FR-3) — enforced in UI, server and storage.rules ----
export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/** Minimal file info, available both from browser `File` and server `File`. */
type FileLike = { name: string; size: number; type: string };

/** Validate attachments (FR-3). Returns an i18n error key, or null when fine. */
export function attachmentError(files: FileLike[]): string | null {
  if (files.length > MAX_ATTACHMENTS) return 'tooManyFiles';
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) return 'fileTooLarge';
    if (!(ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(file.type)) return 'fileType';
  }
  return null;
}

// ---- Budget ranges offered in the quote form (owner-approved 2026-11-15) ----
export const BUDGET_RANGES = [
  { id: 'under-100k', min: 0, max: 100_000 },
  { id: '100k-300k', min: 100_000, max: 300_000 },
  { id: '300k-1m', min: 300_000, max: 1_000_000 },
  { id: 'over-1m', min: 1_000_000 },
] as const satisfies readonly { id: string; min: number; max?: number }[];
export type BudgetRangeId = (typeof BUDGET_RANGES)[number]['id'];
export function budgetRangeById(id: BudgetRangeId): { min: number; max?: number } {
  const range = BUDGET_RANGES.find((r) => r.id === id);
  if (!range) throw new RangeError(`Unknown budget range ${id}`);
  return 'max' in range ? { min: range.min, max: range.max } : { min: range.min };
}
