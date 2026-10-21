# layout

PRD: UI-LAYOUT-1, UI-FONT-1, NFR-SEO-1, NFR-MOBILE-1 (page part), NFR-BUILD-2 (asset paths for the SEO files), Style → Design guide (square corners, flat backgrounds).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-20, Playwright MCP, headless Chromium at 1280×800 and 375×700). Screenshots: `reference/ref-1280.png`, `reference/ref-375.png`, `reference/ref-375-long-input.png`.

## Scope

In scope: the page shell (`layout.tsx`, `page.tsx`, `globals.css`): the full-screen terminal surface, the color tokens and their wiring to Tailwind, the font, page scrolling, no horizontal page scroll, the document head (title, description, Open Graph, Twitter card, theme color, viewport, `lang`), and the generated OG image and icons.

Out of scope: the light, matrix and ubuntu palettes, theme switching, persistence and coloring individual elements such as the prompt and cursor in `primary` (`themes`); what each command prints, including the welcome ASCII art (`cmd-*`); the terminal's own behavior (`terminal-shell`); the deploy workflow (`deploy`, already done in harness Step 2).

## Spec

### Screen (UI-LAYOUT-1, Han's decisions)

- The whole viewport is the terminal: the `bg` color fills `html` and `body` edge to edge, including the area below short content and the overscroll area. Nothing else is drawn behind or around it.
- **No frame** (Han): no border, title bar or window chrome around the terminal. `accent` is not used for a frame.
- **The whole page scrolls** (Han): when output is taller than the viewport, the document scrolls. No element inside the page is a scroll container (no `overflow: auto/scroll` box with its own scrollbar). The terminal-shell's scroll-to-bottom then scrolls the document.
- Padding around the terminal: `1rem` (16px) on all sides, the same at every width (already `p-4` on the terminal root).
- No horizontal page scroll at any width ≥ 320px (NFR-MOBILE-1). Long unbroken output already wraps (terminal-shell); the page shell must not add anything wider than the viewport.
- Square corners and flat backgrounds everywhere (Design guide): no element on the page has a `border-radius`, a `box-shadow` or a `background-image` (gradient or image).

### Color tokens (PRD Style → Theme colors; the `dark` palette only)

- `globals.css` defines the seven semantic tokens as CSS variables with the **dark** values from the PRD, on `:root`:

  | Variable          | Value     |
  | ----------------- | --------- |
  | `--bg`            | `#091321` |
  | `--bg-alt`        | `#101E30` |
  | `--fg`            | `#D3E9E6` |
  | `--primary`       | `#8FFFE0` |
  | `--accent`        | `#54DCC0` |
  | `--muted`         | `#91ADA9` |
  | `--border-subtle` | `#244353` |

- They are mapped to Tailwind colors with `@theme inline` as `--color-bg`, `--color-bg-alt`, `--color-fg`, `--color-primary`, `--color-accent`, `--color-muted`, `--color-border-subtle`, so classes such as `bg-bg`, `text-fg` and `text-primary` work.
- `body` uses `bg` for its background and `fg` for its text.
- The current placeholder tokens (`--background`, `--foreground`, `--color-background`, `--color-foreground`) and the `prefers-color-scheme: dark` block are removed (the PRD ignores the OS setting). The one existing use, `outline-foreground` on the hollow cursor, becomes `outline-fg`.
- The `themes` feature later adds `[data-theme="..."]` blocks that redefine the same variables. Layout does not add next-themes or `data-theme`.

### Font (UI-FONT-1)

- JetBrains Mono (`next/font/google`, already in `src/app/fonts.ts`) is the font of `body`, so every element uses it, including the input. The `Arial, Helvetica, sans-serif` rule in `globals.css` is removed.
- Base size `16px` on `body`. Form controls inherit it, so the input is also 16px (which also stops iOS Safari from zooming on focus).
- Line height `1.5` (24px), one character-grid row (Design guide: "character-grid spacing"). This is the current computed value; the spec makes it explicit on `body`.

### Head and SEO (NFR-SEO-1, NFR-BUILD-2, Han's decisions)

Text (Han: keep the current text):

- Title: `Han Zeng — Terminal Portfolio`
- Description: `Terminal-style portfolio of Han Zeng, front-end engineer.`

The exported `out/index.html` contains:

| Tag                                    | Value                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `<html lang>`                          | `en`                                                                                                     |
| `<title>`                              | the title                                                                                                |
| `meta[name=description]`               | the description                                                                                          |
| `meta[name=viewport]`                  | `width=device-width, initial-scale=1`                                                                    |
| `meta[name=theme-color]`               | `#091321` (`bg` of the dark theme; the `themes` feature may make it follow the theme)                    |
| `og:title`, `og:description`           | the title, the description                                                                               |
| `og:type`                              | `website`                                                                                                |
| `og:url`                               | `https://han3zeng.github.io/terminal-portfolio/`                                                         |
| `og:image`                             | an absolute URL under `https://han3zeng.github.io/terminal-portfolio/`, pointing to the generated OG PNG |
| `og:image:width`, `og:image:height`    | `1200`, `630`                                                                                            |
| `og:image:alt`                         | the title                                                                                                |
| `twitter:card`                         | `summary_large_image`                                                                                    |
| `twitter:title`, `twitter:description` | the title, the description                                                                               |
| `twitter:image`                        | the same URL as `og:image`                                                                               |
| `link[rel=icon]`                       | a 32×32 PNG, `href` starting with `/terminal-portfolio/`                                                 |
| `link[rel=apple-touch-icon]`           | a 180×180 PNG, `href` starting with `/terminal-portfolio/`                                               |

- Every file these tags point to exists in `out/` at that path (minus the base path), with the stated pixel size.
- The default Next.js `favicon.ico` is removed; no `favicon.ico` link is emitted.
- A visually hidden `<h1>` with the title text is the first element in `<main>`, so the page has one top-level heading for screen readers and crawlers (the reference does the same: a 1×1px absolutely positioned `h1`). It is not visible and takes no space.

### Generated images (Han: generate both in code, dark theme)

All three are drawn at build time with `ImageResponse` from `next/og`, in the dark palette, with square corners and no gradients.

- **OG image**, 1200×630 PNG: `bg` background, 64px padding, JetBrains Mono. From top to bottom:
  1. `visitor@han3zeng:~$ welcome` in `primary`.
  2. The **wide** banner from CMD-WELCOME (the five `HAN ZENG` lines), in `fg`, `white-space: pre`, sized so it fits the width.
  3. `Welcome to my terminal!` in `fg`.
  4. `visitor@han3zeng:~$ █` in `primary`.
- **Icon**, 32×32 PNG: `>_` in `primary` on `bg`, bold, centered.
- **Apple icon**, 180×180 PNG: the same design at 180×180.

`ImageResponse` can't read `woff2`, which is what `next/font` downloads. The image routes load a JetBrains Mono `woff` file from the `@fontsource/jetbrains-mono` dev dependency with `readFile`.

### Reference vs PRD

| Behavior                     | Reference (observed)                                                                                                                                                                                | This spec                                                        | Class              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| Screen                       | full-bleed `body` background `rgb(29,42,53)`, no frame or border (`ref-1280.png`)                                                                                                                   | full-bleed `bg`, no frame                                        | Same (colors: PRD) |
| What scrolls                 | `html`/`body` never scroll (`scrollHeight` = viewport). One wrapper with `max-height: calc(100vh − 2rem)`, `overflow-y: auto` scrolls (after 12 `help`s: wrapper `scrollHeight` 5466, document 800) | the document scrolls; no inner scroll container                  | Differs (Han)      |
| Scrollbar                    | styled with `::-webkit-scrollbar`, 15px, track = background color                                                                                                                                   | browser default                                                  | Differs (Han)      |
| Padding                      | wrapper `padding: 12px 20px 20px`                                                                                                                                                                   | 16px on all sides                                                | Differs (minor)    |
| Font                         | IBM Plex Mono 500 from Google Fonts, 16px, line height 1.15 (18.4px)                                                                                                                                | JetBrains Mono 400 via `next/font`, 16px, line height 1.5        | Differs (PRD)      |
| Input font size              | 16px                                                                                                                                                                                                | 16px                                                             | Same               |
| No horizontal scroll (375px) | `scrollWidth` 375 with the welcome output and after a 120-char input (`ref-375-long-input.png`)                                                                                                     | Same                                                             | Same               |
| Corners and shadows          | none seen                                                                                                                                                                                           | none, tested                                                     | Same               |
| Hidden `<h1>`                | `h1` "Terminal Portfolio", `position: absolute`, 1×1px                                                                                                                                              | visually hidden `h1` with the title                              | Same               |
| Title, description           | `Terminal Portfolio by Sat Naing`, a sentence about the author                                                                                                                                      | Han's text                                                       | Differs (PRD)      |
| Open Graph / Twitter         | `og:type`, `og:url`, `og:title`, `og:description`, `og:image` (1200×628 PNG); `twitter:card` `summary_large_image` with title, description, image                                                   | the same set; image 1200×630; plus `og:image:alt`, width, height | Same (plus alt)    |
| Icons                        | `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` (180×180), `safari-pinned-tab.svg`, two web manifests                                                                              | 32×32 icon and 180×180 apple icon, generated; no manifest        | Differs (smaller)  |
| `theme-color`                | `#1D2A35` (its background)                                                                                                                                                                          | `#091321` (our `bg`)                                             | Same (value: PRD)  |
| `lang`                       | `en`                                                                                                                                                                                                | `en`                                                             | Same               |

The reference has no frame, which matches Han's choice. The PRD's visual reference (the Matrix screen sample) shows framed windows with title bars. Han chose not to copy those.

### Edge cases

- A very short page (only the welcome entry) at 1280×800: no white strip below the content; `body` is at least as tall as the viewport, and `html` has `bg` too.
- Overscroll (rubber-band) on macOS and iOS shows `bg`, because `html` has the background.
- 320px wide: no horizontal scroll (narrowest common phone).
- Fonts not loaded yet: `next/font` serves a size-adjusted fallback (`"JetBrains Mono Fallback"`), so the layout doesn't jump when the font loads.

## Plan

### Files

```
src/app/
  globals.css            tokens on :root (dark), @theme inline color mapping, body base styles; remove placeholder tokens,
                         prefers-color-scheme block and the Arial rule
  layout.tsx             html lang="en" + font variable; body classes; exports `metadata` and `viewport` from ./metadata
  metadata.ts            SITE_URL, TITLE, DESCRIPTION, `metadata: Metadata`, `viewport: Viewport` (themeColor)
  page.tsx               <main> with the sr-only <h1>{TITLE}</h1>, then <Terminal />
  og-image.tsx           ogImage(): the 1200×630 ImageResponse
  icon-image.tsx         iconImage(side): the `>_` ImageResponse, shared by both icons
  og-font.ts             loads the JetBrains Mono woffs from @fontsource/jetbrains-mono; dark token values for the images
  og.png/route.tsx                 GET → ogImage(); force-static, exported as out/og.png
  icon-32.png/route.tsx            GET → iconImage(32); exported as out/icon-32.png
  apple-touch-icon.png/route.tsx   GET → iconImage(180); exported as out/apple-touch-icon.png
  favicon.ico            deleted
  Page.stories.tsx       Storybook interaction tests for the page shell (renders `Home` from page.tsx)
src/terminal/CommandInput.tsx   outline-foreground → outline-fg
e2e/layout-head.spec.ts  Playwright: playwright.config.ts builds and serves out/ under /terminal-portfolio/ (TC 1–4)
```

### Metadata

```ts
// src/app/metadata.ts
export const SITE_URL = "https://han3zeng.github.io/terminal-portfolio/";
export const TITLE = "Han Zeng — Terminal Portfolio";
export const DESCRIPTION =
  "Terminal-style portfolio of Han Zeng, front-end engineer.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};
export const viewport: Viewport = { themeColor: "#091321" };
```

- The images are **static route handlers** with `.png` names (`export const dynamic = "force-static"`), linked explicitly from `metadata`: `openGraph.images` and `twitter.images` both get `{ url: "/og.png", width: 1200, height: 630, alt: TITLE, type: "image/png" }` (resolved against `metadataBase`), and `icons.icon` / `icons.apple` get `/terminal-portfolio/icon-32.png` and `/terminal-portfolio/apple-touch-icon.png` with `type` and `sizes`.
- Why not the `opengraph-image` / `icon` / `apple-icon` file conventions (tried first): with `output: "export"` they need `dynamic = "force-static"` in each file (it can't be re-exported), they are written **without a file extension** (`out/opengraph-image`, so GitHub Pages wouldn't serve them as `image/png`), the generated `<link rel="icon">` hrefs **miss the base path** (`/icon?…`), and a `twitter-image` file gets its own URL instead of reusing `og:image`.
- `metadataBase` + a root-relative image URL composes correctly: `https://han3zeng.github.io/terminal-portfolio/og.png`. Icon URLs are not composed with `basePath`, so they carry it themselves.
- The OG image draws the block cursor as a filled box, not the `█` character: `█` (U+2588) isn't in the `latin` subset of the font, so it rendered as a missing-glyph box.
- Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/` (`opengraph-image.md`, `app-icons.md`) before writing these files.

### Body styles

```css
html {
  background: var(--bg);
}
body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}
```

Add `html { height: 100% }` and `body { min-height: 100% }` in `globals.css` so `body` fills the viewport. The `h-full` / `min-h-full flex flex-col` classes in `layout.tsx` then become redundant and are removed, so that stories (which never see `layout.tsx`) and the real page get the same styles.

### Dependencies

- `@fontsource/jetbrains-mono` (dev dependency): a `woff` file that `ImageResponse` can read at build time. Nothing else new.

### Test hooks

- The page story renders `Home` with `parameters.layout: "fullscreen"`, so Storybook adds no padding. It defines its own viewports (320, 375, 1280×400, 1280×800) instead of sharing `Terminal.stories.tsx`'s `VIEWPORTS`: moving that object would change an approved test file.
- The `h1` uses Tailwind's `sr-only`.

### Order of work

1. `e2e/layout-head.spec.ts` (TC 1–4) and `src/app/Page.stories.tsx` (TC 5–10). Confirm they fail for the expected reason.
2. `globals.css` tokens and body styles, `CommandInput` class rename (TC 5, 6, 7).
3. `page.tsx` `h1`, `metadata.ts`, `layout.tsx` (TC 1, 4, 10).
4. `og-font.ts`, `og-image.tsx`, `icon-image.tsx` and the three `*.png/route.tsx` handlers; delete `favicon.ico` (TC 2, 3).
5. Check in the browser (CLAUDE.md "Visual verification"): 375px and 1280px screenshots of the dev server, and open the generated OG image and icons from `out/` to look at them.

## Test cases

Test names start with the ID, e.g. `it("TC-LAYOUT-2: ...")`.

### Playwright e2e (`e2e/layout-head.spec.ts`, the built site)

These load the static export served under `/terminal-portfolio/` (by `webServer` in `playwright.config.ts`) with JavaScript disabled, so the DOM is the shipped `out/index.html` before React runs. Image files are fetched from the same server by their URL's path. PNG sizes are read from the IHDR header (bytes 16–23), so no image library is needed.

- **TC-LAYOUT-1** (Playwright) [NFR-SEO-1] Given the static export, then `out/index.html` has `<html lang="en">`, `<title>Han Zeng — Terminal Portfolio</title>`, `meta[name=description]` with the description, `og:title`, `og:description`, `og:type` = `website`, `og:url` = `https://han3zeng.github.io/terminal-portfolio/`, `twitter:card` = `summary_large_image`, `twitter:title` and `twitter:description`.
- **TC-LAYOUT-2** (Playwright) [NFR-SEO-1, NFR-BUILD-2] Given the static export, then `og:image` and `twitter:image` are the same absolute URL starting with `https://han3zeng.github.io/terminal-portfolio/` (and not containing `/terminal-portfolio/terminal-portfolio`), `og:image:width` = `1200`, `og:image:height` = `630`, `og:image:alt` = the title, and the file served at that path is a PNG of 1200×630.
- **TC-LAYOUT-3** (Playwright) [NFR-SEO-1, NFR-BUILD-2] Given the static export, then there is a `link[rel=icon]` whose `href` starts with `/terminal-portfolio/` and whose served file is a 32×32 PNG, a `link[rel=apple-touch-icon]` with the same base path whose file is a 180×180 PNG, and no `link` points to `favicon.ico`.
- **TC-LAYOUT-4** (Playwright) [UI-LAYOUT-1, NFR-MOBILE-1] Given the static export, then `meta[name=theme-color]` is `#091321` and `meta[name=viewport]` is `width=device-width, initial-scale=1`.

### Storybook interaction tests (`src/app/Page.stories.tsx`, the real page)

- **TC-LAYOUT-5** (Storybook) [UI-LAYOUT-1] Given the page at 1280×800 with only the welcome entry, then `html` and `body` have the computed background `rgb(9, 19, 33)` (`#091321`), `body` text color is `rgb(211, 233, 230)` (`#D3E9E6`), `body` is at least as tall as the viewport, and no element on the page has a border wider than 0 except the hollow cursor's outline (an outline, not a border).
- **TC-LAYOUT-6** (Storybook) [UI-FONT-1] Given the page, after `document.fonts.ready`, then `body` has `font-size: 16px` and `line-height: 24px`, the computed `font-family` of `body`, the input, a prompt and an entry output starts with `"JetBrains Mono"`, and `document.fonts.check('16px "JetBrains Mono"')` is true.
- **TC-LAYOUT-7** (Storybook) [Design guide] Given the page after `help` and `nope` were submitted, then every element under `body` has computed `border-radius` `0px`, `box-shadow` `none` and `background-image` `none`.
- **TC-LAYOUT-8** (Storybook) [UI-LAYOUT-1, UI-LAYOUT-3] Given the page at 1280×400, when 30 commands are submitted, then `document.documentElement.scrollHeight > window.innerHeight` (the document scrolls), no element on the page has computed `overflow-y` `auto` or `scroll` with `scrollHeight > clientHeight`, and the input's bounding box is inside the viewport.
- **TC-LAYOUT-9** (Storybook) [NFR-MOBILE-1] Given the page at 375px (and at 320px), with the welcome entry and after submitting a 200-character word with no spaces, then `document.documentElement.scrollWidth <= window.innerWidth`.
- **TC-LAYOUT-10** (Storybook) [NFR-SEO-1, NFR-A11Y-1] Given the page, then there is exactly one `h1`, its accessible name is `Han Zeng — Terminal Portfolio`, it is visually hidden (bounding box at most 1×1px), it is inside `main`, and the a11y addon reports no violations for the page.

### Test-tooling notes

- TC 1–4 depend on a full `next build`, which Playwright's `webServer` runs. It writes `out/` and `.next/` and doesn't conflict with a running `next dev` (dev uses `.next/dev`). TC 1–4 moved from Vitest (`scripts/export.test.ts`) to Playwright on 2026-10-21, so `pnpm test` builds once instead of twice.
- Browser console output from a story isn't shown in the Vitest run. To see values while debugging, put them in a thrown error or an assertion message.
- Probe result: Storybook keeps its own hidden UI (`sb-loader`, `sb-previewBlock`, `sb-errordisplay`, …) inside `<body>`, and that UI has rounded corners and borders. The page-wide checks in TC 5, 7 and 8 therefore look at `<html>`, `<body>`, the story root and its descendants only.
- Probe result: in stories, `Home` renders with the `@/` alias, `document.fonts.check('16px "JetBrains Mono"')` is true (the font really loads), and the document (not an inner element) scrolls at 1280×400.
- TC 7, 8 and 9 already pass before any layout work: the terminal-shell code has no rounded corners, no inner scroll container, and wraps long lines. They stay as regression guards.
- TC 5–10 run with `globals.css` through `.storybook/preview.tsx`, which already sets the `next/font` variable on `<html>`. Stories can't see `layout.tsx`'s `<html>`/`<body>` classes, so anything the page depends on (`min-height`, background, font) must live in `globals.css`, not only in `layout.tsx` classes. TC-LAYOUT-5 checks this.
- TC-LAYOUT-8 and TC-LAYOUT-9 set the viewport with story `globals.viewport` and the custom viewports, like terminal-shell TC-32/33.
