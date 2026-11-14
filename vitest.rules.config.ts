import { defineConfig } from 'vitest/config';

// Security-rules tests. Run with `pnpm test:rules` (starts the Firestore + Storage emulators).
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20000,
    fileParallelism: false,
  },
});
