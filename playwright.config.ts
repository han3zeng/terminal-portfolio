import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: the real static export (`out/`) in headless Chromium.
// Playwright builds the site and serves out/ under /terminal-portfolio/, like GitHub Pages.
const PORT = 4173;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}/terminal-portfolio/`,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm build && pnpm exec vite preview --outDir out --base /terminal-portfolio/ --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/terminal-portfolio/`,
    // Always rebuild, so a test never runs against a stale out/.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
