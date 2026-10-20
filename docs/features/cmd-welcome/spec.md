# cmd-welcome

PRD: CMD-WELCOME (including the breakpoint, uniform scale, colors and a11y lines added on 2026-10-20), UI-LAYOUT-2 (the output shown on first load), NFR-MOBILE-1 (no horizontal scroll).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-20, Playwright MCP, headless Chromium at 375–1280px). Screenshots: `reference/ref-welcome-1280.png`, `reference/ref-welcome-375.png`.

## Scope

In scope: the `welcome` command's output component: the description (banner and text), the graphic, the desktop/narrow layout, scaling the graphic, colors and accessibility of the ASCII art.

Out of scope: running `welcome` automatically on load and its history entry (terminal-shell, done); the page shell (layout, done); the theme colors themselves (themes).

## Spec

### Content (CMD-WELCOME)

The texts are the PRD's blocks, character for character (no trailing spaces; leading spaces are significant).

**Description, desktop** (9 lines: the wide banner, two blank lines, two text lines):

```
 _   _    _    _   _   _____ _____ _   _  ____
| | | |  / \  | \ | | |__  /| ____| \ | |/ ___|
| |_| | / _ \ |  \| |   / / |  _| |  \| | |  _
|  _  |/ ___ \| |\  |  / /_ | |___| |\  | |_| |
|_| |_/_/   \_\_| \_| /____||_____|_| \_|\____|


Welcome to my terminal!
Want to get to know me better? Type `help` to see how you can explore here.
```

**Narrow banner** (11 lines), which replaces the five wide-banner lines on narrow screens. The two blank lines and the two text lines follow it unchanged:

```
 _   _    _    _   _
| | | |  / \  | \ | |
| |_| | / _ \ |  \| |
|  _  |/ ___ \| |\  |
|_| |_/_/   \_\_| \_|

 _____ _____ _   _  ____
|__  /| ____| \ | |/ ___|
  / / |  _| |  \| | |  _
 / /_ | |___| |\  | |_| |
/____||_____|_| \_|\____|
```

**Graphic** (desktop only): the PRD's 40-line, 38-column drawing, exactly.

- The banners and the graphic keep their spacing: `white-space: pre`.
- The two text lines wrap at the column edge like other output (`white-space: pre-wrap`), so a narrow description column never overflows. The backticks around `help` are printed literally.
- `welcome foo` prints `Usage: welcome` (terminal-shell, INPUT-4).
- Typing `welcome` again prints the same output again (UI-LAYOUT-2).

### Layout (CMD-WELCOME; Han's decision on the breakpoint)

- **Desktop, viewport ≥ 768px**: a flex row. The description is on the left, the graphic on the right, separated by a `2ch` gap. Both are top-aligned. The description takes the remaining width (it may shrink; its text lines wrap); the graphic doesn't shrink.
- **Narrow, viewport < 768px**: the graphic is not rendered visibly (`display: none`), and the description shows the narrow banner instead of the wide one.
- The breakpoint is the same as the prompt's (terminal-shell UI-PROMPT-1) and uses the `narrow` CSS variant. The PRD now says "desktop ≥ 768px / narrow < 768px" (Han, to align them; it used to say > 768 / ≤ 768).
- The ASCII art never overflows the viewport horizontally: no horizontal page scroll from 320px up (NFR-MOBILE-1). The widest art in each layout fits: the narrow banner is 25 columns (240px at 16px), the wide banner 47 columns (≈451px).

### Graphic scaling (CMD-WELCOME; Han: "the scale and shape must be consistent")

- The graphic's rendered **height equals the description's rendered height** (±2px), whatever the width and theme. When the description's height changes (its text lines wrap differently after a resize), the graphic follows.
- The scaling is **uniform**: one factor for both axes. The graphic's rendered width ÷ height equals its natural width ÷ height (the same text at 16px with line height 1.5) within ±2%. It is never stretched or squashed, and its character grid keeps its proportions.
- At 1280px the description is 9 rows (216px), so the graphic is scaled to about 216 ÷ 960 = 0.225 of its natural size (natural: 40 rows × 24px = 960px tall, 38 columns × 9.6px ≈ 365px wide → scaled ≈ 82×216px).
- Before the page's script runs (static HTML), the graphic is already drawn at that 9-row estimate (scale 9/40), so there is no flash of a huge graphic. After hydration the measured value replaces it.

### Colors (Han's decision)

- The banner (wide or narrow) is in `primary`.
- The graphic, the blank lines and the two text lines (including `` `help` ``) are in `fg`.

### Accessibility (Han's decision)

- The banner is announced as text, not as ASCII characters: it has `role="img"` and `aria-label="Han Zeng"`. Only the visible banner (wide or narrow) is in the accessibility tree.
- The graphic is decorative: `aria-hidden="true"`.
- The two text lines are plain text.

### Reference vs PRD

| Behavior                 | Reference (observed)                                                                                                                                   | This spec                                            | Class                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------- |
| Content                  | `Sat Naing` banner, version line, `----` separators, a GitHub link, `type `help``                                                                      | the PRD's banner and two lines                       | Differs (PRD)          |
| Narrow banner            | a stacked two-word banner below 550px (`ref-welcome-375.png`)                                                                                          | stacked `HAN` / `ZENG` below 768px                   | Same (breakpoint: PRD) |
| At the breakpoint        | at exactly 550px **all** art is hidden (wide, narrow and graphic): an off-by-one gap                                                                   | exactly one of the two layouts at every width        | Differs (bug)          |
| Desktop arrangement      | `flex-wrap: wrap-reverse`: 551–~1050px the graphic sits **above** the description; from ~1100px two equal halves side by side (`ref-welcome-1280.png`) | always side by side from 768px, graphic on the right | Differs (PRD)          |
| Graphic size             | natural 16px (349px tall), not scaled; the description happens to be the same height because of `align-items: stretch`                                 | scaled uniformly to the description's height         | Differs (PRD)          |
| Graphic below breakpoint | hidden                                                                                                                                                 | hidden                                               | Same                   |
| Colors                   | banner in the text color; `help` highlighted in the host color                                                                                         | banner `primary`; `help` in `fg`                     | Differs (Han)          |
| Art accessibility        | no `aria-hidden`, `role` or label on any `<pre>`: screen readers get the raw characters                                                                | banner `role="img"` + label; graphic hidden          | Not in reference       |
| No horizontal scroll     | `scrollWidth` 375 at 375px                                                                                                                             | Same, down to 320px                                  | Same                   |

### Edge cases

- Resizing across 768px switches between the two layouts without reload (pure CSS).
- Very wide screens: the description column grows; its height stays 9 rows; the graphic doesn't grow beyond that height.
- Between 768px and ~860px the long text line wraps inside the description, so the description is 10 rows and the graphic grows to match (still uniform).
- Theme switch: colors change; size and shape don't.
- `prefers-reduced-motion`: nothing animates here.

## Plan

### Files

```
src/commands/welcome/
  art.ts                  WIDE_BANNER, NARROW_BANNER, GRAPHIC (exact PRD strings), TEXT_LINES; GRAPHIC_ROWS = 40, GRAPHIC_COLS = 38
  Welcome.tsx             "use client"; the Output component
  useUniformScale.ts      measures the description (ResizeObserver) and returns the scale factor
  Welcome.stories.tsx     Storybook interaction tests
  art.test.ts             Vitest
src/terminal/commands.ts  welcome: { Output: Welcome }
```

### Rendering

```
<div data-testid="welcome" class="flex gap-[2ch] items-start">
  <div data-testid="welcome-description" class="min-w-0 flex-1">
    <pre data-testid="welcome-banner-wide"   role="img" aria-label="Han Zeng" class="text-primary narrow:hidden">…</pre>
    <pre data-testid="welcome-banner-narrow" role="img" aria-label="Han Zeng" class="text-primary hidden narrow:block">…</pre>
    <p class="whitespace-pre-wrap">(two blank lines + the two text lines)</p>
  </div>
  <div data-testid="welcome-graphic" aria-hidden="true" class="shrink-0 narrow:hidden" style="width/height = natural × scale">
    <pre style="transform: scale(s); transform-origin: top left">…GRAPHIC…</pre>
  </div>
</div>
```

- Scale with `transform: scale(s)` on a `<pre>` rendered at its natural 16px / 1.5 size, inside a wrapper sized to the scaled box (`natural width × s`, `natural height × s`). **Not** with `font-size`: Chromium enforces a minimum font size for very small text in some settings, which would break the uniform scale at ≈3.6px.
- `s = descriptionHeight / naturalGraphicHeight`, measured with a `ResizeObserver` on `welcome-description`. Initial `s` = `9 / 40` (the static estimate).
- `pre` elements reset their default margins (`m-0`) and inherit the font (Tailwind preflight does both).

### Test hooks

`welcome`, `welcome-description`, `welcome-banner-wide`, `welcome-banner-narrow`, `welcome-graphic` (above).

### Dependencies

None.

### Order of work

1. `art.ts` with TC 1–2.
2. `Welcome.tsx` layout and colors (TC 3–6, 9).
3. `useUniformScale` (TC 7–8).
4. Wire into the registry; browser check at 375, 767, 768, 1024 and 1280px in all four themes.

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-WELCOME-2: ...")`.

### Vitest

- **TC-CMD-WELCOME-1** (Vitest) [CMD-WELCOME] Then `WIDE_BANNER`, `NARROW_BANNER`, `GRAPHIC` and the two text lines equal the PRD's blocks exactly: read `docs/product-requirements.md`, take the code blocks under `### welcome — CMD-WELCOME` (description, narrow banner, graphic), and compare line by line (the wide banner is the description block's first five lines).
- **TC-CMD-WELCOME-2** (Vitest) [CMD-WELCOME] Then `GRAPHIC` has 40 lines and its longest line is 38 characters (`GRAPHIC_ROWS`, `GRAPHIC_COLS`), the narrow banner's longest line is 25 characters, and no line in any art has trailing whitespace.

### Storybook interaction tests (`src/commands/welcome/Welcome.stories.tsx`)

Stories render the real `Terminal` (its first entry is `welcome`) unless noted, with the themes `Providers` from the Storybook preview.

- **TC-CMD-WELCOME-3** (Storybook) [CMD-WELCOME, UI-LAYOUT-2] Given 1280px, then the first entry's output shows the wide banner, two blank lines, `Welcome to my terminal!` and the `help` line (text content, whitespace preserved), the narrow banner is not visible, and the graphic is visible. When `welcome` is submitted again, the new entry's output has the same text.
- **TC-CMD-WELCOME-4** (Storybook) [CMD-WELCOME] Given 1280px (and 768px), then the graphic's left edge is to the right of the description's right edge, their tops are equal (±1px), and the gap between them is `2ch` (±1px).
- **TC-CMD-WELCOME-5** (Storybook) [CMD-WELCOME, NFR-MOBILE-1] Given 375px (and 767px, and 320px), then the narrow banner is visible, the wide banner and the graphic are not visible, the text lines are visible, and `document.documentElement.scrollWidth <= window.innerWidth`.
- **TC-CMD-WELCOME-6** (Storybook) [CMD-WELCOME] Given the dark theme, then the visible banner's color is `primary` (`rgb(143, 255, 224)`), and the text lines' and the graphic's color is `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-WELCOME-7** (Storybook) [CMD-WELCOME] Given 1280px (and 1024px, and 768px), then the graphic's bounding height equals the description's bounding height (±2px), and the graphic's width ÷ height equals its natural ratio (±2%). The natural ratio is measured in the test by rendering `GRAPHIC` in an unscaled hidden `<pre>` with the same font.
- **TC-CMD-WELCOME-8** (Storybook) [CMD-WELCOME] Given the `Welcome` component in a container 1280px wide, when the container is narrowed to 800px so the long text line wraps (description gets taller), then the graphic's height again equals the description's height (±2px) and the ratio still holds (±2%).
- **TC-CMD-WELCOME-9** (Storybook) [CMD-WELCOME, NFR-A11Y-1] Given 1280px, then exactly one element with role `img` and name `Han Zeng` is in the accessibility tree (the narrow banner's `display: none` removes it), the graphic has `aria-hidden="true"`, and the a11y addon reports no violations. Given 375px, then the one `img` named `Han Zeng` is the narrow banner.

### Test-tooling notes

- TC-8 resizes a wrapping container instead of the viewport, because a story can't change its viewport mid-test.
- Viewports use story `globals.viewport` with custom options, like terminal-shell and layout.
