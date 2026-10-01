import { defineConfig } from '@playwright/test';

// Navigateur DÉJÀ installé sur la machine (Edge par défaut, ou PW_CHANNEL=chrome) : aucun téléchargement.
const channel = process.env.PW_CHANNEL || 'msedge';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

const phone = (width: number, height: number) => ({
  viewport: { width, height },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
  userAgent: ANDROID_UA,
});

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:4173',
    channel,
    locale: 'fr-FR',
    acceptDownloads: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Teste le site de production (pages pré-rendues), comme chez un hébergeur.
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 300_000,
  },
  projects: [
    { name: 'ordinateur', use: { viewport: { width: 1366, height: 900 } } },
    { name: 'tablette', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'mobile-320', use: phone(320, 640) },
    { name: 'mobile-375', use: phone(375, 812) },
    { name: 'mobile-390', use: phone(390, 844) },
  ],
});
