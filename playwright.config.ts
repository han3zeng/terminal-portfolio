import { defineConfig, devices } from "@playwright/test";

import { BASE_PATH } from "./src/site";

// End-to-end tests: the real static export (`out/`) in headless Chromium.
// Playwright builds the site and serves out/ under BASE_PATH, like GitHub Pages.
const PORT = 4173;
const SITE = `http://localhost:${PORT}${BASE_PATH}/`;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: SITE,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm build && pnpm exec vite preview --outDir out --base ${BASE_PATH}/ --port ${PORT} --strictPort`,
    url: SITE,
    // Always rebuild, so a test never runs against a stale out/.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
