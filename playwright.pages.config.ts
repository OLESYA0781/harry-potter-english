import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  testDir: './tests/pages',
  workers: 1,
  use: { ...base.use, baseURL: 'http://127.0.0.1:5186/harry-potter-english/' },
  webServer: {
    command: 'PAGES_BASE_PATH=/harry-potter-english/ npm run preview -- --port 5186',
    url: 'http://127.0.0.1:5186/harry-potter-english/',
    reuseExistingServer: false,
  },
});
