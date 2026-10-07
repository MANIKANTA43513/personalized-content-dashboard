import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    css: false,
    env: { MOCK_DELAY_MS: '0', AUTH_SECRET: 'test-secret' },
  },
});
