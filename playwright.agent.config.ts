import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:3001',
  },
  webServer: {
    ...baseConfig.webServer,
    command: 'APP_ENV=test PORT=3001 npm run build && APP_ENV=test PORT=3001 npm run start',
    url: 'http://localhost:3001',
  },
});
