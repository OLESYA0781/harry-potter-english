import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base,
  testDir: './tests/cloud',
  use: { ...base.use, baseURL: 'http://127.0.0.1:5174' },
  webServer: {
    command: 'npm run dev -- --port 5174',
    env: { VITE_SUPABASE_URL: process.env.TEST_SUPABASE_URL || 'https://supabase.test', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' },
    url: 'http://127.0.0.1:5174', reuseExistingServer: false,
  },
});
