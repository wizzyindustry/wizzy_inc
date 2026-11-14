import { describe, expect, it } from 'vitest';
import { storageUrl } from '@/lib/utils/storage-url';

describe('storageUrl', () => {
  it('builds a public Firebase Storage URL with the path encoded', () => {
    const env = { NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'b.appspot.com' };
    expect(storageUrl('portfolio/p 1/cover.png', env)).toBe(
      'https://firebasestorage.googleapis.com/v0/b/b.appspot.com/o/portfolio%2Fp%201%2Fcover.png?alt=media',
    );
  });

  it('uses the emulator host and project bucket in local dev', () => {
    const env = {
      FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-wizzy',
    };
    expect(storageUrl('portfolio/x.png', env)).toBe(
      'http://127.0.0.1:9199/v0/b/demo-wizzy.appspot.com/o/portfolio%2Fx.png?alt=media',
    );
  });
});
