import { cloudinaryImageUrl } from '@/lib/media/cloudinary-url';

/**
 * Public URL for an uploaded file path (e.g. "portfolio/x/cover.png").
 * 1. Storage emulator when FIREBASE_STORAGE_EMULATOR_HOST is set (local dev, tests)
 * 2. Cloudinary when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set (free plan)
 * 3. otherwise Firebase Storage
 * Only for public paths (site/**, portfolio/**) — quote attachments stay private.
 */
export function storageUrl(
  path: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const emulator = env.FIREBASE_STORAGE_EMULATOR_HOST;
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!emulator && cloudName) return cloudinaryImageUrl(cloudName, path);
  const bucket =
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-wizzy'}.appspot.com`;
  const base = emulator ? `http://${emulator}` : 'https://firebasestorage.googleapis.com';
  return `${base}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}
