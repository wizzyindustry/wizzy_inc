import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Optional: run on an installed browser (e.g. PLAYWRIGHT_CHANNEL=chrome) when the downloaded
    // test browser is blocked, such as by Windows Smart App Control.
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    // Tests start with a cookie choice already made, so the banner never covers buttons.
    // tests/e2e/cookie-banner.spec.ts starts without it.
    storageState: {
      cookies: [
        {
          name: 'wz_cookie_consent',
          value: 'essential',
          domain: 'localhost',
          path: '/',
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    },
  },
  projects: [
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000/en',
    reuseExistingServer: !process.env.CI,
    timeout: 240000,
  },
});
