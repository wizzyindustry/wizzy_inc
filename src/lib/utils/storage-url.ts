/**
 * Public download URL for a Firebase Storage path (e.g. "portfolio/x/cover.png").
 * Uses the Storage emulator when FIREBASE_STORAGE_EMULATOR_HOST is set (local dev).
 * Only for public paths (portfolio/**) — storage.rules keep everything else private.
 */
export function storageUrl(path: string, env: Record<string, string | undefined> = process.env): string {
  const bucket =
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-wizzy'}.appspot.com`;
  const emulator = env.FIREBASE_STORAGE_EMULATOR_HOST;
  const base = emulator ? `http://${emulator}` : 'https://firebasestorage.googleapis.com';
  return `${base}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}
