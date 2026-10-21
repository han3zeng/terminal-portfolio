import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

// TC-LAYOUT-1 – 4: the head tags and SEO images of the real static export, which
// playwright.config.ts builds and serves under /terminal-portfolio/.
// JavaScript is off, so the page is the static HTML exactly as shipped, before React runs.

const SITE_URL = "https://han3zeng.github.io/terminal-portfolio/";
const BASE_PATH = "/terminal-portfolio/";
const TITLE = "Han Zeng — Terminal Portfolio";
const DESCRIPTION = "Terminal-style portfolio of Han Zeng, front-end engineer.";

test.use({ javaScriptEnabled: false });

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

// <meta name|property="key" content> → content (null if absent).
const meta = (page: Page, key: string) =>
  page
    .locator(`meta[name="${key}"], meta[property="${key}"]`)
    .first()
    .getAttribute("content");

// Every href of a <link> with this rel.
const linkHrefs = (page: Page, rel: string) =>
  page
    .locator(`link[rel~="${rel}"]`)
    .evaluateAll((links) => links.map((l) => l.getAttribute("href") ?? ""));

// Fetches a URL or root-relative href under the base path from the local server,
// and returns the PNG's width and height from the IHDR chunk.
async function pngSize(request: APIRequestContext, url: string) {
  const pathname = new URL(url, SITE_URL).pathname;
  expect(pathname.startsWith(BASE_PATH)).toBe(true);
  const response = await request.get(pathname);
  expect(response.ok(), `${pathname} is served`).toBe(true);
  const bytes = await response.body();
  expect(bytes.subarray(1, 4).toString("latin1")).toBe("PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test.describe("layout: static export head", () => {
  test("TC-LAYOUT-1: index.html has the title, description, Open Graph and Twitter tags", async ({
    page,
  }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle(TITLE);
    expect(await meta(page, "description")).toBe(DESCRIPTION);
    expect(await meta(page, "og:title")).toBe(TITLE);
    expect(await meta(page, "og:description")).toBe(DESCRIPTION);
    expect(await meta(page, "og:type")).toBe("website");
    expect(await meta(page, "og:url")).toBe(SITE_URL);
    expect(await meta(page, "twitter:card")).toBe("summary_large_image");
    expect(await meta(page, "twitter:title")).toBe(TITLE);
    expect(await meta(page, "twitter:description")).toBe(DESCRIPTION);
  });

  test("TC-LAYOUT-2: og:image and twitter:image point to a 1200×630 PNG under the base path", async ({
    page,
    request,
  }) => {
    const og = await meta(page, "og:image");
    expect(og).not.toBeNull();
    expect(og!.startsWith(SITE_URL)).toBe(true);
    expect(og).not.toContain("/terminal-portfolio/terminal-portfolio");
    expect(await meta(page, "twitter:image")).toBe(og);
    expect(await meta(page, "og:image:width")).toBe("1200");
    expect(await meta(page, "og:image:height")).toBe("630");
    expect(await meta(page, "og:image:alt")).toBe(TITLE);
    expect(await pngSize(request, og!)).toEqual({ width: 1200, height: 630 });
  });

  test("TC-LAYOUT-3: the icon (32×32) and apple-touch-icon (180×180) are PNGs under the base path; no favicon.ico", async ({
    page,
    request,
  }) => {
    const icon = (await linkHrefs(page, "icon")).find(
      (href) => !href.includes("favicon.ico"),
    );
    expect(icon, "a link[rel=icon] that is not favicon.ico").toBeDefined();
    expect(icon!.startsWith(BASE_PATH)).toBe(true);
    expect(await pngSize(request, icon!)).toEqual({ width: 32, height: 32 });

    const apple = (await linkHrefs(page, "apple-touch-icon"))[0];
    expect(apple, "a link[rel=apple-touch-icon]").toBeDefined();
    expect(apple.startsWith(BASE_PATH)).toBe(true);
    expect(await pngSize(request, apple)).toEqual({ width: 180, height: 180 });

    const hrefs = await page
      .locator("link")
      .evaluateAll((links) => links.map((l) => l.getAttribute("href") ?? ""));
    expect(hrefs.filter((h) => h.includes("favicon.ico"))).toEqual([]);
  });

  test("TC-LAYOUT-4: theme-color is the dark bg and the viewport meta is set", async ({
    page,
  }) => {
    expect(await meta(page, "theme-color")).toBe("#091321");
    expect(await meta(page, "viewport")).toBe(
      "width=device-width, initial-scale=1",
    );
  });
});
