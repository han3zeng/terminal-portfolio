import path from "node:path";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname = import.meta.dirname;

// Two test projects:
// - unit: pure functions and scripts, `src/**/*.test.ts(x)` + `scripts/**/*.test.ts`, runs in Node
// - storybook: every story (and its `play` function) runs as a test in a real browser
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: { "@": path.join(dirname, "src") },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
          // scripts/export.test.ts runs `next build` into out/ and .next/; running files
          // one at a time keeps a second build test from overlapping it.
          fileParallelism: false,
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
