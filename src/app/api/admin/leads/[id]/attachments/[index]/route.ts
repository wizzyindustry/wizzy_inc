import { adminDb } from '@/lib/firebase/admin';
import { readPrivateFile } from '@/lib/media/file-store';
import { attachmentSchema } from '@/lib/schemas/lead';
import { requireAdmin } from '@/lib/security/require-admin';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string; index: string }> };

const plain = (status: number, body: string) =>
  new Response(body, { status, headers: { 'cache-control': 'no-store' } });

/**
 * Download a quote attachment (admin only). The browser sends the admin's ID token as
 * `Authorization: Bearer …`. The file path comes from the lead document — never from the
 * request — so only files attached to that lead can be fetched. quotes/** stays private.
 */
export async function GET(request: Request, { params }: Params) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!(await requireAdmin(token))) return plain(401, 'Unauthorized');

  const { id, index } = await params;
  const i = Number(index);
  if (!/^[\w-]{1,128}$/.test(id) || !Number.isInteger(i) || i < 0) return plain(400, 'Bad request');

  try {
    const snap = await adminDb().collection('leads').doc(id).get();
    const attachments: unknown = snap.get('attachments');
    const parsed = attachmentSchema.safeParse(Array.isArray(attachments) ? attachments[i] : null);
    if (!snap.exists || !parsed.success) return plain(404, 'Not found');
    const file = parsed.data;

    const bytes = await readPrivateFile(file.path);
    return new Response(new Uint8Array(bytes), {
      headers: {
        'content-type': file.contentType,
        'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        'cache-control': 'private, no-store',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(
      '[admin] attachment download failed:',
      error instanceof Error ? error.message : 'unknown',
    );
    return plain(500, 'Server error');
  }
}
