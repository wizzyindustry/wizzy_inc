/**
 * Check a file's first bytes ("magic numbers") against the type the browser claimed,
 * so a renamed .exe can't be uploaded as "image/png".
 */
const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((b, i) => bytes[offset + i] === b);

const SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  'image/png': (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  // "RIFF" .... "WEBP"
  'image/webp': (b) =>
    startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8),
  'application/pdf': (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]), // "%PDF"
  // .docx is a ZIP container: "PK\x03\x04"
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (b) =>
    startsWith(b, [0x50, 0x4b, 0x03, 0x04]),
};

export function contentMatchesType(bytes: Uint8Array, declaredType: string): boolean {
  if (declaredType === 'image/svg+xml') return svgLooksSafe(bytes);
  const check = SIGNATURES[declaredType];
  return check ? check(bytes) : false;
}

/**
 * SVG is text (XML), so it can carry scripts. Accept only a plain drawing: it must start as
 * an SVG/XML document and contain no scripts, event handlers, links to code or embedded
 * pages. Strict on purpose — logos exported from Illustrator or Figma pass.
 */
export function svgLooksSafe(bytes: Uint8Array): boolean {
  const text = new TextDecoder('utf-8').decode(bytes).replace(/^﻿/, ''); // drop a BOM
  const start = text.trimStart().slice(0, 1000).toLowerCase();
  if (!(start.startsWith('<svg') || start.startsWith('<?xml')) || !/<svg[\s>]/i.test(text)) {
    return false;
  }
  // Scripts, event handlers (onload=…), embedded pages/entities, and any link that is not an
  // internal "#id" reference (covers href and xlink:href).
  const dangerous =
    /<script|<foreignobject|<iframe|<embed|<object|<!entity|\son[a-z]+\s*=|javascript:|href\s*=\s*(?!["']?#)/i;
  return !dangerous.test(text);
}
