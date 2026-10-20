import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import path from "node:path";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// TC-THEMES-16: on load, the saved theme is already applied in the browser's first frame
// (no flash of another theme), including the theme-color meta. Runs against the real
// static export in headless Chromium.

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out");
const BASE_PATH = "/terminal-portfolio/";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".txt": "text/plain",
};

// Serves out/ under /terminal-portfolio/, like GitHub Pages.
function serveOut(): Promise<{ server: Server; url: string }> {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url ?? "/", "http://x").pathname,
    );
    if (!pathname.startsWith(BASE_PATH)) {
      res.statusCode = 404;
      return res.end();
    }
    let file = path.join(out, pathname.slice(BASE_PATH.length));
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }
    if (!file.startsWith(out) || !existsSync(file)) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader(
      "content-type",
      TYPES[path.extname(file)] ?? "application/octet-stream",
    );
    res.end(readFileSync(file));
  });
  return new Promise((resolve) =>
    server.listen(0, () => {
      const { port } = server.address() as { port: number };
      resolve({ server, url: `http://localhost:${port}${BASE_PATH}` });
    }),
  );
}

type FirstPaint = {
  first: { theme: string | null; bg: string; themeColor: string | null };
  seen: (string | null)[];
};

let server: Server;
let url: string;
let browser: Browser;

beforeAll(async () => {
  // Vitest sets NODE_ENV=test, which breaks `next build` (see layout's export test).
  execFileSync("pnpm", ["build"], {
    cwd: root,
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "production" },
  });
  ({ server, url } = await serveOut());
  browser = await chromium.launch();
}, 180_000);

afterAll(async () => {
  await browser?.close();
  server?.close();
});

// Loads the page with `stored` in localStorage (null = empty) and reports the first frame
// and every value <html data-theme> took during the load.
async function firstPaint(stored: string | null): Promise<FirstPaint> {
  const page = await browser.newPage();
  try {
    await page.addInitScript((value) => {
      if (value !== null) localStorage.setItem("theme", value);
      const w = window as unknown as {
        __firstPaint: FirstPaint;
        __first?: FirstPaint["first"];
      };
      const seen: (string | null)[] = [];
      // <html> doesn't exist yet when an init script runs, so watch the whole document.
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.target === document.documentElement) {
            seen.push(document.documentElement.getAttribute("data-theme"));
          }
        }
      }).observe(document, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-theme"],
      });
      requestAnimationFrame(() => {
        w.__first = {
          theme: document.documentElement.getAttribute("data-theme"),
          bg: getComputedStyle(document.body).backgroundColor,
          themeColor:
            document
              .querySelector('meta[name="theme-color"]')
              ?.getAttribute("content") ?? null,
        };
      });
      w.__firstPaint = { first: undefined!, seen };
    }, stored);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => "__first" in window);
    return await page.evaluate(() => {
      const w = window as unknown as {
        __firstPaint: FirstPaint;
        __first: FirstPaint["first"];
      };
      return { first: w.__first, seen: w.__firstPaint.seen };
    });
  } finally {
    await page.close();
  }
}

describe("themes: first paint", () => {
  const cases = [
    { theme: "light", bg: "rgb(253, 246, 227)", themeColor: "#FDF6E3" },
    { theme: "matrix", bg: "rgb(5, 11, 6)", themeColor: "#050B06" },
    { theme: "ubuntu", bg: "rgb(48, 10, 36)", themeColor: "#300A24" },
  ];

  for (const { theme, bg, themeColor } of cases) {
    it(`TC-THEMES-16: a saved ${theme} theme is in the first frame, with no other theme before it`, async () => {
      const { first, seen } = await firstPaint(theme);
      expect(first).toEqual({ theme, bg, themeColor });
      expect(seen.length).toBeGreaterThan(0);
      expect(seen.filter((t) => t !== theme)).toEqual([]);
    });
  }

  it("TC-THEMES-16: with nothing saved, the first frame is dark", async () => {
    const { first, seen } = await firstPaint(null);
    expect(first).toEqual({
      theme: "dark",
      bg: "rgb(9, 19, 33)",
      themeColor: "#091321",
    });
    expect(seen.filter((t) => t !== "dark")).toEqual([]);
  });
});
