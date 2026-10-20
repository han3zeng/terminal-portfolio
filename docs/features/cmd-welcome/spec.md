# cmd-welcome

PRD: CMD-WELCOME (the description and banners; the graphic is out of scope, see below), UI-LAYOUT-2 (the output shown on first load), NFR-MOBILE-1 (no horizontal scroll).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-20, Playwright MCP, headless Chromium at 375–1280px). Screenshots: `reference/ref-welcome-1280.png`, `reference/ref-welcome-375.png`.

## Scope

In scope: the `welcome` command's output component: the description (wide or narrow banner, then the welcome text), the banner switch at 768px, colors and accessibility of the banner.

Out of scope:

- **The graphic** (the PRD's 40-line drawing next to the description on desktop) and how it sits next to the description. Han will implement it by hand later (decided 2026-10-20). Until then, `welcome` shows the description only, at every width.
- Running `welcome` automatically on load and its history entry (terminal-shell, done); the page shell (layout, done); the theme colors themselves (themes).

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

- The banners keep their spacing: `white-space: pre`.
- The two text lines wrap at the terminal edge like other output (`white-space: pre-wrap`). The backticks around `help` are printed literally.
- `welcome foo` prints `Usage: welcome` (terminal-shell, INPUT-4).
- Typing `welcome` again prints the same output again (UI-LAYOUT-2).

### Layout (CMD-WELCOME; Han's decision on the breakpoint)

- **Desktop, viewport ≥ 768px**: the wide banner.
- **Narrow, viewport < 768px**: the narrow banner instead of the wide one.
- The breakpoint is the same as the prompt's (terminal-shell UI-PROMPT-1) and uses the `narrow` CSS variant.
- The banners never overflow the viewport horizontally: no horizontal page scroll from 320px up (NFR-MOBILE-1). The narrow banner is 25 columns (240px at 16px), the wide banner 47 columns (≈451px).
- The description is the whole output for now. When Han adds the graphic later, the output root (`welcome`) is where it goes.

### Colors (Han's decision)

- The banner (wide or narrow) is in `primary`.
- The blank lines and the two text lines (including `` `help` ``) are in `fg`.

### Accessibility (Han's decision)

- The banner is announced as text, not as ASCII characters: it has `role="img"` and `aria-label="Han Zeng"`. Only the visible banner (wide or narrow) is in the accessibility tree.
- The two text lines are plain text.

### Reference vs PRD

| Behavior             | Reference (observed)                                                                    | This spec                          | Class                  |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------- |
| Content              | `Sat Naing` banner, version line, `----` separators, a GitHub link, `type `help``       | the PRD's banner and two lines     | Differs (PRD)          |
| Narrow banner        | a stacked two-word banner below 550px (`ref-welcome-375.png`)                           | stacked `HAN` / `ZENG` below 768px | Same (breakpoint: PRD) |
| At the breakpoint    | at exactly 550px **all** art is hidden (wide and narrow banner): an off-by-one gap      | exactly one banner at every width  | Differs (bug)          |
| Colors               | banner in the text color; `help` highlighted in the host color                          | banner `primary`; `help` in `fg`   | Differs (Han)          |
| Art accessibility    | no `aria-hidden`, `role` or label on any `<pre>`: screen readers get the raw characters | banner `role="img"` + label        | Not in reference       |
| No horizontal scroll | `scrollWidth` 375 at 375px                                                              | Same, down to 320px                | Same                   |

The reference also shows a graphic next to its description (`ref-welcome-1280.png`); that part is out of scope here.

### Edge cases

- Resizing across 768px switches between the two banners without reload (pure CSS).
- Theme switch: colors change; nothing else does.
- `prefers-reduced-motion`: nothing animates here.

## Plan

### Files

```
src/commands/welcome/
  art.ts                  WIDE_BANNER, NARROW_BANNER (exact PRD strings), TEXT_LINES
  Welcome.tsx             the Output component
  Welcome.stories.tsx     Storybook interaction tests
  art.test.ts             Vitest
src/terminal/commands.ts  welcome: { Output: Welcome }
```

### Rendering

```
<div data-testid="welcome">
  <div data-testid="welcome-description">
    <pre data-testid="welcome-banner-wide"   role="img" aria-label="Han Zeng" class="text-primary narrow:hidden">…</pre>
    <pre data-testid="welcome-banner-narrow" role="img" aria-label="Han Zeng" class="text-primary hidden narrow:block">…</pre>
    <div class="whitespace-pre-wrap">(two blank lines + the two text lines)</div>
  </div>
</div>
```

- `pre` elements reset their default margins (`m-0`) and inherit the font (Tailwind preflight does both).

### Test hooks

`welcome`, `welcome-description`, `welcome-banner-wide`, `welcome-banner-narrow` (above).

### Dependencies

None.

### Order of work

1. `art.ts` with TC 1–2.
2. `Welcome.tsx` layout, colors and a11y (TC 3, 5, 6, 9); wire into the registry.
3. Browser check at 320, 375, 767, 768 and 1280px in all four themes.

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-WELCOME-2: ...")`. IDs 4, 7 and 8 belonged to the graphic and were removed with it (2026-10-20); they are not reused.

### Vitest

- **TC-CMD-WELCOME-1** (Vitest) [CMD-WELCOME] Then `WIDE_BANNER`, `NARROW_BANNER` and the two text lines equal the PRD's blocks exactly: read `docs/product-requirements.md`, take the code blocks under `### welcome — CMD-WELCOME` (the description and the narrow banner), and compare line by line (the wide banner is the description block's first five lines).
- **TC-CMD-WELCOME-2** (Vitest) [CMD-WELCOME] Then the narrow banner's longest line is 25 characters, and no line in either banner has trailing whitespace.

### Storybook interaction tests (`src/commands/welcome/Welcome.stories.tsx`)

Stories render the real `Terminal` (its first entry is `welcome`), with the themes `Providers` from the Storybook preview.

- **TC-CMD-WELCOME-3** (Storybook) [CMD-WELCOME, UI-LAYOUT-2] Given 1280px, then the first entry's output shows the wide banner, two blank lines, `Welcome to my terminal!` and the `help` line (text content, whitespace preserved), and the narrow banner is not visible. When `welcome` is submitted again, the new entry's output has the same text.
- **TC-CMD-WELCOME-5** (Storybook) [CMD-WELCOME, NFR-MOBILE-1] Given 375px (and 767px, and 320px), then the narrow banner is visible, the wide banner is not visible, the text lines are visible, and `document.documentElement.scrollWidth <= window.innerWidth`.
- **TC-CMD-WELCOME-6** (Storybook) [CMD-WELCOME] Given the dark theme, then the visible banner's color is `primary` (`rgb(143, 255, 224)`), and the text lines' color is `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-WELCOME-9** (Storybook) [CMD-WELCOME, NFR-A11Y-1] Given 1280px, then exactly one element with role `img` and name `Han Zeng` is in the accessibility tree (the narrow banner's `display: none` removes it), it is the wide banner, and the a11y addon reports no violations. Given 375px, then the one `img` named `Han Zeng` is the narrow banner.

### Test-tooling notes

- Viewports use story `globals.viewport` with custom options, like terminal-shell and layout.
