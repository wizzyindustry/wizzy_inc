import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidatePublicPages } from '@/lib/data/revalidate-public';

export const dynamic = 'force-dynamic';

const sha256 = (value: string) => createHash('sha256').update(value).digest();

/**
 * POST /api/revalidate — refresh public pages (ARCHITECTURE §4.2). For tools outside the
 * admin panel (admin saves already refresh pages themselves). Protected by
 * REVALIDATE_SECRET sent as `x-revalidate-secret`; disabled when the secret is not set.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get('x-revalidate-secret') ?? '';
  // Compare hashes in constant time so the secret can't be guessed byte by byte.
  if (!secret || secret.length < 16 || !timingSafeEqual(sha256(given), sha256(secret))) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidatePublicPages();
  return Response.json({ ok: true, revalidated: true });
}
