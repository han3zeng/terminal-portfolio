# themes

PRD: CMD-THEMES, Style → Theme colors, NFR-A11Y-3, INPUT-6 (for `themes set`).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-20, Playwright MCP, headless Chromium at 1280×800 and 375×700). Screenshots: `reference/ref-themes-1280.png`, `reference/ref-themes-375.png`, `reference/ref-ubuntu-1280.png`, `reference/ref-light-1280.png`.

## Scope

In scope: the four palettes, switching and persisting the theme (next-themes), the `themes` command (its output and its `themes set` side effect), which terminal parts get which color token, the `theme-color` meta following the theme, and contrast (NFR-A11Y-3).

Out of scope: what other commands print (`cmd-*`); the dark tokens' plumbing into Tailwind and the page background (`layout`, done).

## Spec

### Palettes (PRD Style → Theme colors, NFR-A11Y-3; Han's decision for light)

| Token           | dark      | light         | matrix    | ubuntu    |
| --------------- | --------- | ------------- | --------- | --------- |
| `bg`            | `#091321` | `#FDF6E3`     | `#050B06` | `#300A24` |
| `bg-alt`        | `#101E30` | `#EEE8D5`     | `#0C1A0F` | `#40142F` |
| `fg`            | `#D3E9E6` | `#586E75`     | `#B6F5C5` | `#F2EDEB` |
| `primary`       | `#8FFFE0` | **`#2074AF`** | `#00FF41` | `#8AE234` |
| `accent`        | `#54DCC0` | **`#207B74`** | `#39D65A` | `#E95420` |
| `muted`         | `#91ADA9` | **`#5E737A`** | `#75A982` | `#B9A9B4` |
| `border-subtle` | `#244353` | `#D6CEBA`     | `#244B30` | `#69465E` |

- The PRD's Solarized values for light failed NFR-A11Y-3 (`primary` `#268BD2` 3.41:1, `muted` `#657B83` 4.13:1, and `accent` `#2AA198` 2.93:1). Han chose the same hues darkened just enough to pass: `primary` `#2074AF` (4.66:1), `accent` `#207B74` (4.69:1), `muted` `#5E737A` (4.63:1).
- Contrast on `bg`, every theme: `fg`, `primary`, `muted` **and `accent`** ≥ 4.5:1 (accent is used for link text).

  | Theme  | fg    | primary | muted | accent |
  | ------ | ----- | ------- | ----- | ------ |
  | dark   | 14.70 | 15.57   | 7.77  | 10.98  |
  | light  | 4.99  | 4.66    | 4.63  | 4.69   |
  | matrix | 15.95 | 14.55   | 7.34  | 10.35  |
  | ubuntu | 15.14 | 10.89   | 7.87  | 4.82   |

- In `globals.css`, `:root, [data-theme="dark"]` holds dark (so the page is dark before any script runs), and `[data-theme="light"]`, `[data-theme="matrix"]`, `[data-theme="ubuntu"]` redefine the same seven variables. The `@theme inline` mapping from `layout` stays as it is.

### Switching and persistence (CMD-THEMES)

- next-themes, as in CLAUDE.md: `attribute="data-theme"`, `themes={["dark", "light", "matrix", "ubuntu"]}`, `defaultTheme="dark"`, `enableSystem={false}`, `storageKey="theme"`, `disableTransitionOnChange`.
- The default on first visit is `dark`. The OS light/dark setting is ignored.
- The chosen theme is saved in `localStorage` under `theme` and applied on the next load **before first paint**, so a reload never shows a frame of another theme (no flicker):
  1. The colors come only from CSS variables keyed on `<html data-theme>` (Palettes, above).
  2. next-themes renders a small blocking inline `<script>` into the static HTML, at the top of `<body>`, before the terminal markup. While the HTML is still being parsed, it reads `localStorage["theme"]`, falls back to `dark` for a missing or unknown value, and sets `data-theme` on `<html>`. The browser's first frame therefore already uses the saved theme; React hydrates later and doesn't change it.
  3. `<html suppressHydrationWarning>`: the server HTML has no `data-theme` and the client does, which is expected.
  4. TC-THEMES-16 checks the first frame in a real browser against the built site.
- The switch is **immediate**: no CSS transition on colors (PRD "immediately"; Design guide "minimal animation"). The reference animates it (`transition: all` on `body`; the background changes about 100ms later).
- `themes set <name>` when `<name>` is already the theme: nothing visible happens, no error.

### The `themes` command (CMD-THEMES, Han's decisions)

Arguments are split as in terminal-shell (on whitespace runs). Theme names match **case-sensitively** (Han).

| Input                                                                                                                        | Output                         | Side effect          |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------- |
| `themes`                                                                                                                     | the full output (below)        | none                 |
| `themes set dark` / `light` / `matrix` / `ubuntu`                                                                            | nothing (prompt line only)     | switch to that theme |
| anything else: `themes set foo`, `themes set Ubuntu`, `themes set`, `themes foo`, `themes set dark extra`, `themes SET dark` | the **usage block only** (Han) | none                 |

Full output (`themes`), exactly:

```
dark, light, matrix, ubuntu

## How to use
themes set [theme_name]
e.g. themes set matrix
```

Usage block only (bad arguments), exactly:

```
## How to use
themes set [theme_name]
e.g. themes set matrix
```

- The list is in this fixed order, comma-separated, on one line. It does not mark the current theme.
- `## How to use` is printed literally (with the `##`) in `primary`. The other lines are `fg`.
- The side effect follows INPUT-6: `setTheme` is called once, in the submit handler, only for a valid `themes set <name>`. Rendering, re-rendering, Ctrl+L or later submits never call it again.

### Colors of the terminal parts (Han's decision)

| Part                                                   | Token                    |
| ------------------------------------------------------ | ------------------------ |
| Page background                                        | `bg`                     |
| Prompt `visitor@han3zeng:~$` and the narrow `>` marker | `primary`                |
| Block cursor, solid and hollow                         | `primary`                |
| Past command text, all output text                     | `fg` (inherited)         |
| Tab hints                                              | `muted`                  |
| Headings inside outputs (e.g. `## How to use`)         | `primary`                |
| Links inside outputs                                   | `accent`                 |
| `<meta name="theme-color">`                            | the current theme's `bg` |

- The `theme-color` meta follows the theme: after a switch, and on load with a saved theme, its `content` is that theme's `bg` (upper-case hex as in the table). The static HTML still ships `#091321` (layout TC-LAYOUT-4).
- On load it must also be right **before first paint** (so a mobile browser's toolbar doesn't show the dark color for a moment): a second small blocking inline script in `<head>`, right after the `theme-color` meta, reads `localStorage["theme"]`, and if it is one of the four themes sets the meta's `content` to that theme's `bg`. It is generated from `PALETTES`, so the values can't drift. After load, `ThemeColorMeta` (a client effect) updates the meta on every switch.

### Reference vs PRD

| Behavior              | Reference (observed)                                                                                                                                                             | This spec                                        | Class              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------ |
| Theme names           | the reference's own six: `dark`, `light`, `blue-matrix` (a blue theme, unrelated to our green `matrix`), `espresso`, `green-goblin`, `ubuntu`                                    | `dark`, `light`, `matrix`, `ubuntu`              | Differs (PRD)      |
| `themes` output       | the names as separate items (wrapping onto a second row at 375px), then `Usage: themes set <theme-name>` / `eg: themes set ubuntu` (`ref-themes-1280.png`, `ref-themes-375.png`) | comma list, blank line, `## How to use` block    | Differs (PRD)      |
| `themes set ubuntu`   | prints nothing, switches the theme                                                                                                                                               | Same                                             | Same               |
| Bad arguments         | `themes set foo`, `themes set Ubuntu`, `themes set`, `themes foo`, `themes set dark extra` all print the two usage lines (not the list)                                          | the usage block only                             | Same (text: PRD)   |
| Case                  | `themes set Ubuntu` → usage                                                                                                                                                      | Same                                             | Same               |
| Same theme again      | `themes set ubuntu` twice: prints nothing                                                                                                                                        | Same                                             | Same               |
| Persistence           | `localStorage["tsn-theme"] = "ubuntu"`; after reload the page is ubuntu                                                                                                          | `localStorage["theme"]`, applied before paint    | Same (key differs) |
| First visit           | dark (`rgb(29, 42, 53)`), with empty storage                                                                                                                                     | dark                                             | Same               |
| Switch timing         | `body` has `transition: all`; the background is still old right after Enter and new ~100ms later                                                                                 | immediate, no transition                         | Differs (PRD)      |
| Where the theme lives | no attribute on `<html>`; styles are swapped by a CSS-in-JS theme                                                                                                                | `data-theme` on `<html>`                         | Not observable     |
| Prompt colors         | user and host in two colors (dark: `rgb(255,157,0)` and `rgb(5,206,145)`), `:~$` in the text color                                                                               | the whole prompt in `primary`                    | Differs (Han)      |
| Caret                 | native caret in the host color                                                                                                                                                   | block cursor in `primary`                        | Differs (PRD)      |
| Links                 | user color, `2px dashed` underline in the same color                                                                                                                             | `accent`; underline style is up to `cmd-*` specs | Differs (PRD)      |
| `theme-color` meta    | follows the theme: `#1D2A35`, `#2D0922` (ubuntu), `#EFF3F3` (light)                                                                                                              | follows the theme's `bg`                         | Same               |

### Edge cases

- `localStorage` holds an unknown value (e.g. `not-a-theme`, a name from an old version, or garbage): the page falls back to `defaultTheme` (`dark`).
- `localStorage` is unavailable (private mode, blocked storage): the theme still switches for the session; it just isn't saved. No error is printed.
- Before hydration, theme-dependent UI must not render differently on server and client (CLAUDE.md). Nothing in this feature renders the theme name, so no unmounted-state guard is needed. The `theme-color` updater runs only in an effect; before that, the inline head script has already set it.
- `localStorage` throws (blocked storage): both inline scripts catch the error and leave the defaults (dark, `#091321`).

## Plan

### Files

```
src/themes/
  themes.ts            THEMES = ["dark","light","matrix","ubuntu"] as const; ThemeName; isThemeName();
                       PALETTES: Record<ThemeName, Record<Token, string>> (the table above); THEME_PROVIDER_PROPS
  parseThemesArgs.ts   parseThemesArgs(args): { kind: "list" } | { kind: "set"; theme: ThemeName } | { kind: "usage" }   (pure)
  contrast.ts          contrastRatio(hexA, hexB): number   (pure, WCAG 2.x relative luminance)
  ThemesOutput.tsx     the command's Output component
  ThemeColorMeta.tsx   "use client"; keeps <meta name="theme-color"> in sync with resolvedTheme (effect only)
  storedTheme.ts       themeHeadScript(): the inline <head> script, built from applyStoredTheme() (a self-contained function,
                       serialized with Function#toString like next-themes): drops an unknown stored theme, sets theme-color
  *.test.ts            Vitest
  Themes.stories.tsx   Storybook interaction tests
src/app/providers.tsx  "use client"; <ThemeProvider {...THEME_PROVIDER_PROPS}><ThemeColorMeta />{children}</ThemeProvider>
src/app/layout.tsx     wraps children in <Providers>; <html suppressHydrationWarning> (next-themes sets data-theme before hydration);
                       <head><meta name="theme-color" content="#091321" /><script>{themeHeadScript()}</script></head>.
                       The meta is rendered here instead of via metadata `viewport.themeColor`, so it is
                       guaranteed to precede the script that updates it.
scripts/theme-first-paint.test.ts   Vitest: builds, serves out/ under /terminal-portfolio/, drives headless Chromium (TC-THEMES-16)
src/app/globals.css    the four [data-theme] blocks; `a { color: var(--accent) }`
src/terminal/types.ts  CommandEffects; onSubmit(ctx, effects)
src/terminal/Terminal.tsx  builds effects ({ setTheme } from useTheme()) unless an `effects` prop is given; passes them to onSubmit
src/terminal/commands.ts   themes: { Output: ThemesOutput, onSubmit }
src/terminal/Prompt.tsx, CommandInput.tsx, Terminal.tsx (hints)   color classes: text-primary, outline-primary, text-muted
.storybook/preview.tsx  decorator: runs themeHeadScript(), then <Providers>; beforeEach: localStorage.removeItem("theme"), remove data-theme from <html>
```

### Types

```ts
// src/terminal/types.ts
export type CommandEffects = { setTheme: (theme: string) => void };
export type CommandDef = {
  // ...
  onSubmit?: (ctx: CommandContext, effects: CommandEffects) => void; // was (ctx)
};

// src/themes/themes.ts
export const THEMES = ["dark", "light", "matrix", "ubuntu"] as const;
export type ThemeName = (typeof THEMES)[number];
export type Token =
  "bg" | "bg-alt" | "fg" | "primary" | "accent" | "muted" | "border-subtle";
export const THEME_PROVIDER_PROPS = {
  attribute: "data-theme",
  themes: [...THEMES],
  defaultTheme: "dark",
  enableSystem: false,
  storageKey: "theme",
  disableTransitionOnChange: true,
} as const;
```

- `Terminal` gets an optional prop `effects?: CommandEffects`. Without it, it uses `useTheme().setTheme` from next-themes. Stories pass a spy to count calls.
- `onSubmit` for `themes`: `const r = parseThemesArgs(ctx.args); if (r.kind === "set") effects.setTheme(r.theme);`.
- `PALETTES` in `themes.ts` is the source for `ThemeColorMeta` and for the contrast test. `globals.css` repeats the values (CSS can't import TS); TC-THEMES-4 checks both agree.

### Dependencies

- `next-themes` (`^0.4.6`), as CLAUDE.md prescribes.

### Test hooks

- Output text is checked through `innerText` of the entry output, so each output line must be its own block row and a blank line must render as one empty line: a row holding a non-breaking space (`<div>&nbsp;</div>`). An empty `<div>` collapses, and both `<div><br></div>` and a `<p>` add an extra blank line to `innerText`.
- `ThemesOutput` renders the heading line with `data-testid="themes-usage-heading"` (it has no role of its own; a real heading element would add `##` text to the a11y outline, so it is a `<p>`).
- `.storybook/preview.tsx` resets the theme before each story (`beforeEach`), so stories don't leak the theme into each other through `localStorage` or `data-theme`.

### Order of work

1. `themes.ts`, `parseThemesArgs.ts`, `contrast.ts` with Vitest (TC 1–6).
2. `globals.css` palettes and link color; `providers.tsx`, `layout.tsx`, Storybook preview decorator.
3. `CommandEffects` and `Terminal` effects; `ThemesOutput`; registry entry (TC 7–12).
4. Color classes on prompt, marker, cursor, hints (TC 13). `ThemeColorMeta` (TC 14). a11y per theme (TC 15).
5. `themeHeadScript` in the layout head; first-paint test (TC 16).
6. Browser check (CLAUDE.md): all four themes at 375px and 1280px; reload keeps the theme with no dark flash.

## Test cases

Test names start with the ID, e.g. `it("TC-THEMES-2: ...")`.

### Vitest (pure functions)

- **TC-THEMES-1** (Vitest) [CMD-THEMES] Given `[]`, when `parseThemesArgs` runs, then the result is `{ kind: "list" }`.
- **TC-THEMES-2** (Vitest) [CMD-THEMES] Given `["set", name]` for each of `dark`, `light`, `matrix`, `ubuntu`, then the result is `{ kind: "set", theme: name }`.
- **TC-THEMES-3** (Vitest) [CMD-THEMES] Given `["set","foo"]`, `["set","Ubuntu"]`, `["set"]`, `["foo"]`, `["set","dark","extra"]` or `["SET","dark"]`, then the result is `{ kind: "usage" }`.
- **TC-THEMES-4** (Vitest) [Theme colors] Given `src/app/globals.css`, then `:root` and `[data-theme="dark"]` (same block) and each of `[data-theme="light"|"matrix"|"ubuntu"]` define all seven `--<token>` variables, and every value equals `PALETTES` (case-insensitive hex), and `PALETTES` equals the table in this spec.
- **TC-THEMES-5** (Vitest) [NFR-A11Y-3] Given `contrastRatio`, then `contrastRatio("#000000", "#FFFFFF")` is 21 and `contrastRatio("#FFFFFF", "#FFFFFF")` is 1 (±0.01). For every theme in `PALETTES`, `fg`, `primary`, `muted` and `accent` on `bg` are ≥ 4.5.
- **TC-THEMES-6** (Vitest) [CMD-THEMES] Then `THEME_PROVIDER_PROPS` has `attribute: "data-theme"`, `themes: ["dark","light","matrix","ubuntu"]`, `defaultTheme: "dark"`, `enableSystem: false`, `storageKey: "theme"` and `disableTransitionOnChange: true`.

### Storybook interaction tests (`src/themes/Themes.stories.tsx`, real registry, real `Providers` from the preview)

- **TC-THEMES-7** (Storybook) [CMD-THEMES] When `themes` is submitted, then the entry output's text lines are exactly `dark, light, matrix, ubuntu`, ``(blank), `## How to use`, `themes set [theme_name]`, `e.g. themes set matrix`, and the theme is unchanged (`dark`).
- **TC-THEMES-8** (Storybook) [CMD-THEMES] When `themes set ubuntu` is submitted, then the entry has no output, `<html>` has `data-theme="ubuntu"`, `body`'s background is `rgb(48, 10, 36)` right away (no waiting), `body`'s computed `transition-duration` is `0s`, and `localStorage.getItem("theme")` is `"ubuntu"`. Then `themes set light` switches to light (`rgb(253, 246, 227)`), `themes set matrix` to matrix, `themes set dark` back to dark.
- **TC-THEMES-9** (Storybook) [CMD-THEMES] When `themes set foo`, `themes set Ubuntu`, `themes set` and `themes foo` are submitted, then each output is exactly the three lines `## How to use`, `themes set [theme_name]`, `e.g. themes set matrix`, and `data-theme` stays `dark`.
- **TC-THEMES-10** (Storybook) [INPUT-6] Given a `Terminal` with an `effects.setTheme` spy, when `themes set matrix` is submitted, then the spy was called once with `"matrix"`. When `pwd` is submitted, Ctrl+L is pressed and `themes` and `themes set foo` are submitted, then the spy has still been called once.
- **TC-THEMES-11** (Storybook) [CMD-THEMES] Given `localStorage["theme"] = "matrix"` before the story renders (a story-level `beforeEach`), then `<html>` has `data-theme="matrix"` and `body`'s background is `rgb(5, 11, 6)`. (Stands in for a reload.)
- **TC-THEMES-12** (Storybook) [CMD-THEMES] Given empty storage, then `data-theme` is `dark`. Given `localStorage["theme"] = "not-a-theme"` (unknown), then `data-theme` is `dark`.
- **TC-THEMES-13** (Storybook) [Theme colors] Given the light theme and `pwd` submitted, `h` typed and Tab pressed, and a fake command printing a link: then the prompt and the narrow marker's color is `primary` (`rgb(32, 116, 175)`), the cursor's color is `primary`, the hints' color is `muted` (`rgb(94, 115, 122)`), the past command text's color is `fg` (`rgb(88, 110, 117)`), the link's color is `accent` (`rgb(32, 123, 116)`), and in `themes` output the `## How to use` line is `primary`.
- **TC-THEMES-14** (Storybook) [Theme colors] Given a `<meta name="theme-color">` in the document, when `themes set ubuntu` is submitted, then its `content` is `#300A24`; after `themes set light` it is `#FDF6E3`.
- **TC-THEMES-15** (Storybook) [NFR-A11Y-3] For each theme (four stories, `parameters.a11y.test: "error"`): given that theme, with `themes` and `nope` submitted and Tab hints showing, then the a11y addon (axe, including `color-contrast`) reports no violations.

### Vitest + real browser (`scripts/theme-first-paint.test.ts`, the built site)

- **TC-THEMES-16** (Vitest) [CMD-THEMES] Given the static export served under `/terminal-portfolio/` and headless Chromium (Playwright, already a dev dependency): for each of `light`, `matrix`, `ubuntu`, a Playwright **init script** (runs before any page script) sets `localStorage["theme"]` to that theme and registers a `requestAnimationFrame` callback that records, in the **first frame**, `<html>`'s `data-theme`, `body`'s computed background color and `meta[name=theme-color]`'s `content`. When the page loads, then the first frame already has that theme: `data-theme` is the theme, the background is its `bg` (light `rgb(253, 246, 227)`, matrix `rgb(5, 11, 6)`, ubuntu `rgb(48, 10, 36)`) and `theme-color` is its `bg` hex. A `MutationObserver` started by the same init script also records every value `data-theme` takes during the load: the first is the theme, and every later one is the same theme (next-themes may set the same value again after hydration; it must never be `dark` or anything else). With empty storage, the first frame is `dark` / `rgb(9, 19, 33)` / `#091321`.

### Test-tooling notes

- `vitest.config.mts`: the unit project now runs its files one at a time (`fileParallelism: false`). Both `scripts/export.test.ts` (layout) and `scripts/theme-first-paint.test.ts` run `next build` into the same `out/` and `.next/`, and in parallel they would overwrite each other. Cost: the unit project's files no longer overlap (two builds ≈ 15s).
- Story names must be string literals: Storybook reads `name` statically, so a name built in a helper function is ignored and the test is named after the export (TC-15 first showed as "missing" in `spec:status` for this reason).
- Stories can't reload the page. TC-11 and TC-12 set `localStorage` in a **story-level `beforeEach`** before the story renders, which is what a reload does for next-themes.
- Probe result: Storybook runs **loaders before `beforeEach`**, so a loader's `localStorage` value is wiped by the preview's reset. `beforeEach` hooks run project → component → story, so a story-level `beforeEach` runs after the reset and works.
- Probe result: next-themes **does not validate** the stored value. Its inline script and its client state both apply `localStorage["theme"]` as is (`not-a-theme` → `data-theme="not-a-theme"`; the page still looks dark only because `:root` holds the dark values). TC-12 therefore needs the implementation to drop unknown stored values before next-themes reads them: in the `<head>` script on the real page (it runs before next-themes' script), and, in Storybook (which has no HTML `<head>`), by `.storybook/preview.tsx` running the same head script before each story renders.
- Probe result: a Playwright init script runs before `<html>` exists (`document.documentElement` is `null`), so TC-16's `MutationObserver` observes `document` with `subtree: true` and filters on `<html>`'s `data-theme`. The "no flash before paint" part is covered by TC-16 against the real built page.
- TC-16 builds the site like layout's `scripts/export.test.ts` (with `NODE_ENV=production`), serves `out/` with a small `node:http` static server on a free port (mapping `/terminal-portfolio/` to `out/`), and launches Chromium through the `playwright` package. Probe it once first (implement-feature Phase A step 2): that the first `requestAnimationFrame` callback runs before any later frame, and that `chromium.launch()` works in the unit project's Node environment.
- Stories can't emulate `prefers-color-scheme` (see terminal-shell TC-27); "the OS setting is ignored" is covered by `enableSystem: false` in TC-6.
- `localStorage` and `data-theme` survive between stories in the same browser, so the preview resets them in `beforeEach`.
