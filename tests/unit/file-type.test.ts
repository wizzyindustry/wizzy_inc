import { describe, expect, it } from 'vitest';
import { contentMatchesType } from '@/lib/security/file-type';

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('contentMatchesType', () => {
  it('accepts files whose bytes match the declared type', () => {
    expect(contentMatchesType(bytes(0xff, 0xd8, 0xff, 0xe0), 'image/jpeg')).toBe(true);
    expect(
      contentMatchesType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a), 'image/png'),
    ).toBe(true);
    expect(
      contentMatchesType(
        bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50),
        'image/webp',
      ),
    ).toBe(true);
    expect(contentMatchesType(new TextEncoder().encode('%PDF-1.7'), 'application/pdf')).toBe(true);
    expect(contentMatchesType(bytes(0x50, 0x4b, 0x03, 0x04), DOCX)).toBe(true);
  });

  it('rejects disguised files and unknown types', () => {
    const exe = bytes(0x4d, 0x5a); // "MZ" Windows executable
    expect(contentMatchesType(exe, 'image/png')).toBe(false);
    expect(contentMatchesType(exe, 'application/pdf')).toBe(false);
    expect(contentMatchesType(bytes(0xff, 0xd8, 0xff), 'application/x-msdownload')).toBe(false);
  });
});
