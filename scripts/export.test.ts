import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

// Checks the static export (`out/`) for the layout spec's head and SEO files (TC-LAYOUT-1 – 4).
// Builds once; the build takes a few seconds.

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out");

const SITE_URL = "https://han3zeng.github.io/terminal-portfolio/";
const BASE_PATH = "/terminal-portfolio/";
const TITLE = "Han Zeng — Terminal Portfolio";
const DESCRIPTION = "Terminal-style portfolio of Han Zeng, front-end engineer.";

type Tag = Record<string, string>;

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

// Every <name ...> tag in the HTML, as a lower-cased attribute map.
function tags(html: string, name: string): Tag[] {
  const found: Tag[] = [];
  for (const [, attrs] of html.matchAll(
    new RegExp(`<${name}\\b([^>]*)>`, "gi"),
  )) {
    const tag: Tag = {};
    for (const [, key, value] of attrs.matchAll(/([\w:-]+)="([^"]*)"/g)) {
      tag[key.toLowerCase()] = decode(value);
    }
    found.push(tag);
  }
  return found;
}

let html = "";

// <meta name|property="key" content> → content (undefined if absent).
const meta = (key: string) =>
  tags(html, "meta").find((t) => t.name === key || t.property === key)?.content;

const links = (rel: string) =>
  tags(html, "link").filter((t) => t.rel?.split(/\s+/).includes(rel));

// A URL or root-relative href under the base path → the file under out/.
function outFile(url: string): string {
  const pathname = new URL(url, SITE_URL).pathname;
  expect(pathname.startsWith(BASE_PATH)).toBe(true);
  return path.join(out, decodeURIComponent(pathname.slice(BASE_PATH.length)));
}

// PNG width and height from the IHDR chunk.
function pngSize(file: string): { width: number; height: number } {
  expect(existsSync(file), `${path.relative(root, file)} exists`).toBe(true);
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString("latin1")).toBe("PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

beforeAll(() => {
  // Vitest sets NODE_ENV=test, which breaks `next build` (prerendering fails).
  execFileSync("pnpm", ["build"], {
    cwd: root,
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "production" },
  });
  html = readFileSync(path.join(out, "index.html"), "utf8");
}, 180_000);

describe("layout: static export head", () => {
  it("TC-LAYOUT-1: index.html has the title, description, Open Graph and Twitter tags", () => {
    expect(tags(html, "html")[0]?.lang).toBe("en");
    expect(html).toContain(`<title>${TITLE}</title>`);
    expect(meta("description")).toBe(DESCRIPTION);
    expect(meta("og:title")).toBe(TITLE);
    expect(meta("og:description")).toBe(DESCRIPTION);
    expect(meta("og:type")).toBe("website");
    expect(meta("og:url")).toBe(SITE_URL);
    expect(meta("twitter:card")).toBe("summary_large_image");
    expect(meta("twitter:title")).toBe(TITLE);
    expect(meta("twitter:description")).toBe(DESCRIPTION);
  });

  it("TC-LAYOUT-2: og:image and twitter:image point to a 1200×630 PNG under the base path", () => {
    const og = meta("og:image");
    expect(og).toBeDefined();
    expect(og!.startsWith(SITE_URL)).toBe(true);
    expect(og).not.toContain("/terminal-portfolio/terminal-portfolio");
    expect(meta("twitter:image")).toBe(og);
    expect(meta("og:image:width")).toBe("1200");
    expect(meta("og:image:height")).toBe("630");
    expect(meta("og:image:alt")).toBe(TITLE);
    expect(pngSize(outFile(og!))).toEqual({ width: 1200, height: 630 });
  });

  it("TC-LAYOUT-3: the icon (32×32) and apple-touch-icon (180×180) are PNGs under the base path; no favicon.ico", () => {
    const icon = links("icon").find((l) => !l.href.includes("favicon.ico"));
    expect(icon, "a link[rel=icon] that is not favicon.ico").toBeDefined();
    expect(icon!.href.startsWith(BASE_PATH)).toBe(true);
    expect(pngSize(outFile(icon!.href))).toEqual({ width: 32, height: 32 });

    const apple = links("apple-touch-icon")[0];
    expect(apple, "a link[rel=apple-touch-icon]").toBeDefined();
    expect(apple.href.startsWith(BASE_PATH)).toBe(true);
    expect(pngSize(outFile(apple.href))).toEqual({ width: 180, height: 180 });

    const hrefs = tags(html, "link").map((l) => l.href ?? "");
    expect(hrefs.filter((h) => h.includes("favicon.ico"))).toEqual([]);
  });

  it("TC-LAYOUT-4: theme-color is the dark bg and the viewport meta is set", () => {
    expect(meta("theme-color")).toBe("#091321");
    expect(meta("viewport")).toBe("width=device-width, initial-scale=1");
  });
});
