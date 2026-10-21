import { expect, test, type Page } from "@playwright/test";

// TC-THEMES-16: on load, the saved theme is already applied in the browser's first frame
// (no flash of another theme), including the theme-color meta. Runs against the real
// static export, which playwright.config.ts builds and serves.

type FirstFrame = {
  theme: string | null;
  bg: string;
  themeColor: string | null;
};
type Recorded = { first?: FirstFrame; seen: (string | null)[] };

// Loads the page with `stored` in localStorage (null = empty) and reports the first frame
// and every value <html data-theme> took during the load.
async function firstPaint(page: Page, stored: string | null) {
  // Runs before any page script.
  await page.addInitScript((value) => {
    if (value !== null) localStorage.setItem("theme", value);
    const recorded: Recorded = { seen: [] };
    (window as unknown as { __recorded: Recorded }).__recorded = recorded;

    // <html> doesn't exist yet when an init script runs, so watch the whole document.
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.target === document.documentElement) {
          recorded.seen.push(
            document.documentElement.getAttribute("data-theme"),
          );
        }
      }
    }).observe(document, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-theme"],
    });

    // The first rAF callback runs just before the first paint.
    requestAnimationFrame(() => {
      recorded.first = {
        theme: document.documentElement.getAttribute("data-theme"),
        bg: getComputedStyle(document.body).backgroundColor,
        themeColor:
          document
            .querySelector('meta[name="theme-color"]')
            ?.getAttribute("content") ?? null,
      };
    });
  }, stored);

  await page.goto("./", { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => (window as unknown as { __recorded: Recorded }).__recorded.first,
  );
  return page.evaluate(
    () => (window as unknown as { __recorded: Recorded }).__recorded,
  );
}

test.describe("themes: first paint", () => {
  const cases = [
    { theme: "light", bg: "rgb(253, 246, 227)", themeColor: "#FDF6E3" },
    { theme: "matrix", bg: "rgb(5, 11, 6)", themeColor: "#050B06" },
    { theme: "ubuntu", bg: "rgb(48, 10, 36)", themeColor: "#300A24" },
  ];

  for (const { theme, bg, themeColor } of cases) {
    test(`TC-THEMES-16: a saved ${theme} theme is in the first frame, with no other theme before it`, async ({
      page,
    }) => {
      const { first, seen } = await firstPaint(page, theme);
      expect(first).toEqual({ theme, bg, themeColor });
      expect(seen.length).toBeGreaterThan(0);
      expect(seen.filter((t) => t !== theme)).toEqual([]);
    });
  }

  test("TC-THEMES-16: with nothing saved, the first frame is dark", async ({
    page,
  }) => {
    const { first, seen } = await firstPaint(page, null);
    expect(first).toEqual({
      theme: "dark",
      bg: "rgb(9, 19, 33)",
      themeColor: "#091321",
    });
    expect(seen.filter((t) => t !== "dark")).toEqual([]);
  });
});
