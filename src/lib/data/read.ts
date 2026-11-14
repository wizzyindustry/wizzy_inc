import 'server-only';
import type { DocumentSnapshot, Query } from 'firebase-admin/firestore';
import type { z } from 'zod';
import { toPlain } from './to-plain';

/**
 * Parse a Firestore document with a Zod schema. Invalid content docs are skipped and logged
 * by id only (content collections hold no personal data) so one bad doc can't break a page.
 */
export function parseDoc<S extends z.ZodType>(
  schema: S,
  snap: DocumentSnapshot,
): z.output<S> | null {
  if (!snap.exists) return null;
  const result = schema.safeParse(toPlain({ ...snap.data(), id: snap.id }));
  if (!result.success) {
    console.error(
      `[data] invalid ${snap.ref.path}:`,
      result.error.issues.map((i) => i.path.join('.')),
    );
    return null;
  }
  return result.data;
}

/**
 * For OPTIONAL page sections only (e.g. featured work on the home page): if the read fails,
 * log it and render without the section instead of failing the whole page or build.
 */
export async function orFallback<T>(read: Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await read;
  } catch (error) {
    console.error(`[data] ${label} unavailable:`, (error as Error).message);
    return fallback;
  }
}

export async function queryDocs<S extends z.ZodType>(
  schema: S,
  query: Query,
): Promise<z.output<S>[]> {
  const snap = await query.get();
  return snap.docs.map((d) => parseDoc(schema, d)).filter((d): d is z.output<S> => d !== null);
}
