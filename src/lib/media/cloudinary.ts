import { createHash } from 'node:crypto';
import { imagePublicId } from './cloudinary-url';

/*
 * Cloudinary (free image hosting) — used instead of Firebase Storage when CLOUDINARY_URL is
 * set (owner decision 2026-11-17: the free Firebase plan has no Storage). Talks to the
 * Cloudinary REST API with fetch — no extra package. Server and scripts only: the API
 * secret must never reach the browser.
 *
 * Paths stay the same as in Firebase Storage (e.g. "site/hero/123-photo.png"), so content
 * documents don't change:
 * - public files (site/**, portfolio/**) -> resource type "image", public id = path without
 *   the extension; delivered at res.cloudinary.com/<cloud>/image/upload/<public id>
 * - private files (quotes/** attachments) -> resource type "raw", type "private"; only
 *   downloadable with a signed API request from the server.
 */

export type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

/** Parse CLOUDINARY_URL ("cloudinary://<key>:<secret>@<cloud name>", from the dashboard). */
export function cloudinaryConfig(
  env: Record<string, string | undefined> = process.env,
): CloudinaryConfig | null {
  const match = /^cloudinary:\/\/([^:\s]+):([^@\s]+)@([\w-]+)$/.exec(
    env.CLOUDINARY_URL?.trim() ?? '',
  );
  if (!match) return null;
  return { apiKey: match[1]!, apiSecret: match[2]!, cloudName: match[3]! };
}

/** Cloudinary request signature: sorted "key=value" pairs joined by "&", + secret, SHA-1. */
export function signParams(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex');
}

const apiBase = (config: CloudinaryConfig) =>
  `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}`;
const timestamp = () => String(Math.floor(Date.now() / 1000));

type Target = { resourceType: 'image' | 'raw'; publicId: string; type: 'upload' | 'private' };

function target(path: string, privateFile: boolean): Target {
  return privateFile
    ? { resourceType: 'raw', publicId: path, type: 'private' }
    : { resourceType: 'image', publicId: imagePublicId(path), type: 'upload' };
}

async function failure(action: string, res: Response): Promise<Error> {
  let detail = '';
  try {
    detail = ((await res.json()) as { error?: { message?: string } }).error?.message ?? '';
  } catch {
    // no JSON body
  }
  return new Error(
    `Cloudinary ${action} failed (HTTP ${res.status})${detail ? `: ${detail}` : ''}`,
  );
}

/** Upload one file. `privateFile` keeps it out of public delivery (quote attachments). */
export async function cloudinaryUpload(
  config: CloudinaryConfig,
  file: { path: string; bytes: Uint8Array; contentType: string; privateFile?: boolean },
): Promise<void> {
  const { resourceType, publicId, type } = target(file.path, file.privateFile ?? false);
  const params = { overwrite: 'false', public_id: publicId, timestamp: timestamp(), type };
  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.append(key, value);
  form.append('api_key', config.apiKey);
  form.append('signature', signParams(params, config.apiSecret));
  form.append('file', new Blob([new Uint8Array(file.bytes)], { type: file.contentType }));
  const res = await fetch(`${apiBase(config)}/${resourceType}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw await failure('upload', res);
}

/** Does this path already exist on Cloudinary? (used by the one-time copy script) */
export async function cloudinaryExists(
  config: CloudinaryConfig,
  path: string,
  privateFile = false,
): Promise<boolean> {
  const { resourceType, publicId, type } = target(path, privateFile);
  const res = await fetch(
    `${apiBase(config)}/resources/${resourceType}/${type}/${publicId.split('/').map(encodeURIComponent).join('/')}`,
    { headers: { Authorization: basicAuth(config) } },
  );
  if (res.status === 404) return false;
  if (!res.ok) throw await failure('lookup', res);
  return true;
}

/** Download a private file (quote attachment) through a signed API request. */
export async function cloudinaryDownloadPrivate(
  config: CloudinaryConfig,
  path: string,
): Promise<Uint8Array> {
  const { resourceType, publicId, type } = target(path, true);
  const params = { public_id: publicId, timestamp: timestamp(), type };
  const query = new URLSearchParams({
    ...params,
    api_key: config.apiKey,
    signature: signParams(params, config.apiSecret),
  });
  const res = await fetch(`${apiBase(config)}/${resourceType}/download?${query}`);
  if (!res.ok) throw await failure('download', res);
  return new Uint8Array(await res.arrayBuffer());
}

/** Delete one file. */
export async function cloudinaryDelete(
  config: CloudinaryConfig,
  path: string,
  privateFile = false,
): Promise<void> {
  const { resourceType, publicId, type } = target(path, privateFile);
  const params = { public_id: publicId, timestamp: timestamp(), type };
  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.append(key, value);
  form.append('api_key', config.apiKey);
  form.append('signature', signParams(params, config.apiSecret));
  const res = await fetch(`${apiBase(config)}/${resourceType}/destroy`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw await failure('delete', res);
}

/** Delete every public image under a folder, e.g. "portfolio/<id>/". */
export async function cloudinaryDeleteFolder(
  config: CloudinaryConfig,
  prefix: string,
): Promise<void> {
  const res = await fetch(
    `${apiBase(config)}/resources/image/upload?${new URLSearchParams({ prefix })}`,
    { method: 'DELETE', headers: { Authorization: basicAuth(config) } },
  );
  if (!res.ok) throw await failure('folder delete', res);
}

function basicAuth(config: CloudinaryConfig): string {
  return `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')}`;
}
