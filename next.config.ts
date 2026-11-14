import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const storageEmulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Quote form: up to 3 attachments x 5 MB (FR-3) plus fields. Default limit is 1 MB.
    serverActions: { bodySizeLimit: '16mb' },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/v0/b/**' },
      // Local development against the Storage emulator only.
      ...(storageEmulator
        ? [
            {
              protocol: 'http' as const,
              hostname: storageEmulator.split(':')[0] ?? '127.0.0.1',
              port: storageEmulator.split(':')[1] ?? '9199',
              pathname: '/v0/b/**',
            },
          ]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
