/** Anything with a Firestore-style toDate() (Admin SDK Timestamp). */
type TimestampLike = { toDate: () => Date };

function isTimestampLike(value: unknown): value is TimestampLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<TimestampLike>).toDate === 'function'
  );
}

/** Recursively convert Firestore Timestamps to Date so documents can be Zod-parsed and serialised. */
export function toPlain(value: unknown): unknown {
  if (isTimestampLike(value)) return value.toDate();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}
