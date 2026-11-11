import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests. The game runs in vite's development mode, where window.dagny
 * and the source modules can be reached from the page.
 * - smoke: a short play on an emulated phone (runs in "Kontroll").
 * - monkey: a random player in every room (slow; runs nightly).
 */
const PORT = 5199;

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL: `http://localhost:${PORT}/`, trace: 'off' },
  projects: [
    { name: 'smoke', testMatch: 'smoke.spec.ts', use: { ...devices['Pixel 7 landscape'] } },
    { name: 'monkey', testMatch: 'monkey.spec.ts', use: { viewport: { width: 960, height: 540 } } },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
