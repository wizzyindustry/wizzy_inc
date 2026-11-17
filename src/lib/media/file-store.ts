import 'server-only';
import { adminStorage } from '@/lib/firebase/admin';
import {
  cloudinaryConfig,
  cloudinaryDelete,
  cloudinaryDeleteFolder,
  cloudinaryDownloadPrivate,
  cloudinaryUpload,
  type CloudinaryConfig,
} from './cloudinary';

/*
 * Where uploaded files live. One place decides, so actions and routes don't care:
 * 1. the local Storage emulator when FIREBASE_STORAGE_EMULATOR_HOST is set (development, tests)
 * 2. Cloudinary when CLOUDINARY_URL is set (free plan, no Firebase Storage)
 * 3. otherwise Firebase Storage
 * Paths are the same everywhere (site/…, portfolio/…, quotes/…).
 */

function cloudinary(): CloudinaryConfig | null {
  return process.env.FIREBASE_STORAGE_EMULATOR_HOST ? null : cloudinaryConfig();
}

const PUBLIC_CACHE = 'public, max-age=31536000, immutable';

/** Save a file. Public files (site/, portfolio/) are cached forever; quotes/ stay private. */
export async function saveFile(
  path: string,
  bytes: Buffer,
  contentType: string,
  options: { privateFile?: boolean } = {},
): Promise<void> {
  const config = cloudinary();
  if (config) {
    await cloudinaryUpload(config, { path, bytes, contentType, privateFile: options.privateFile });
    return;
  }
  await adminStorage()
    .bucket()
    .file(path)
    .save(bytes, {
      contentType,
      resumable: false,
      ...(!options.privateFile && { metadata: { cacheControl: PUBLIC_CACHE } }),
    });
}

/** Read a private file (quote attachment) for an admin download. */
export async function readPrivateFile(path: string): Promise<Uint8Array> {
  const config = cloudinary();
  if (config) return cloudinaryDownloadPrivate(config, path);
  const [bytes] = await adminStorage().bucket().file(path).download();
  return new Uint8Array(bytes);
}

/** Delete one file (e.g. attachments of a quote that could not be saved). */
export async function deleteFile(path: string, options: { privateFile?: boolean } = {}) {
  const config = cloudinary();
  if (config) return cloudinaryDelete(config, path, options.privateFile);
  await adminStorage().bucket().file(path).delete();
}

/** Delete every public file under a folder, e.g. "portfolio/<id>/". */
export async function deleteFolder(prefix: string): Promise<void> {
  const config = cloudinary();
  if (config) return cloudinaryDeleteFolder(config, prefix);
  await adminStorage().bucket().deleteFiles({ prefix });
}
