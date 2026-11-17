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

  it('uses Cloudinary on the free plan (no extension: served in its original format)', () => {
    const env = {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'wizzy',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'x',
    };
    expect(storageUrl('site/hero/1-my photo.png', env)).toBe(
      'https://res.cloudinary.com/wizzy/image/upload/site/hero/1-my%20photo',
    );
  });

  it('prefers the emulator over Cloudinary in local dev', () => {
    const env = {
      FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'wizzy',
    };
    expect(storageUrl('site/x.png', env)).toMatch(/^http:\/\/127\.0\.0\.1:9199\//);
  });
});
