/*
 * Cloudinary delivery URLs — safe in the browser (no secrets). See ./cloudinary.ts.
 */

/** Public id of a public (image) file: the path without its file extension. */
export function imagePublicId(path: string): string {
  return path.replace(/\.[^./]+$/, '');
}

/** Public delivery URL for a public file path (served in its original format). */
export function cloudinaryImageUrl(cloudName: string, path: string): string {
  const id = imagePublicId(path).split('/').map(encodeURIComponent).join('/');
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/${id}`;
}
