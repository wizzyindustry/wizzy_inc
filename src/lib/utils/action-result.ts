/**
 * Shape every Server Action returns (CLAUDE.md conventions): never throw raw errors to the
 * client. `error` and `fieldErrors` values are i18n keys, translated in the UI.
 */
export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** i18n keys our schemas use as messages; anything else becomes the generic "invalid". */
export const FORM_ERROR_KEYS = [
  'serviceRequired',
  'invalidPackage',
  'descriptionTooShort',
  'descriptionTooLong',
  'invalidDate',
  'deadlinePast',
  'nameRequired',
  'invalidPhone',
  'invalidEmail',
  'tooManyFiles',
  'fileTooLarge',
  'fileType',
  'messageTooShort',
  'messageTooLong',
] as const;

/** First error per top-level field, as an i18n key. */
/** Works with errors from both `zod` and `zod/mini` (same v4 issue format). */
type IssueList = { issues: readonly { path: readonly PropertyKey[]; message: string }[] };

export function zodFieldErrors(error: IssueList): Record<string, string> {
  const known = new Set<string>(FORM_ERROR_KEYS);
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    if (!(field in result)) result[field] = known.has(issue.message) ? issue.message : 'invalid';
  }
  return result;
}
