# cmd-pwd

PRD: CMD-PWD, INPUT-4 (`pwd` takes no arguments).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-21, Playwright MCP, headless Chromium at 1280×800 and 375×800). Screenshots: `reference/ref-pwd-whoami-1280.png`, `reference/ref-pwd-whoami-375.png`.

## Scope

In scope: the `pwd` command's output component, its exact text and color.

Out of scope: argument handling (`pwd foo` → `Usage: pwd`), matching (`  pwd  ` runs `pwd`, `PWD` is not found), and history. All three belong to terminal-shell and are already done.

## Spec

### Output (CMD-PWD)

Exactly one line, no trailing spaces:

```
/home/han3zeng
```

- The text is in `fg` (PRD theme table: "Past command text and command output → `fg`").
- It is plain text: not a link and not a heading.
- Running `pwd` again prints the same line again. The output never changes; there is no `cd`.
- At 375px the line fits on one row, with no horizontal page scroll (NFR-MOBILE-1).

### Reference vs PRD

| Behavior              | Reference (observed)                                                        | This spec             | Class         |
| --------------------- | --------------------------------------------------------------------------- | --------------------- | ------------- |
| Output text           | 1280px: `pwd` → `/home/satnaing`                                            | `/home/han3zeng`      | Differs (PRD) |
| Color                 | the default output color (dark: `rgb(203, 213, 225)`), same as other output | `fg`                  | Same          |
| `pwd foo`             | `Usage: pwd`                                                                | Same (terminal-shell) | Same          |
| `  pwd  ` / `  PWD  ` | runs `pwd` / `command not found:   PWD  `                                   | Same (terminal-shell) | Same          |
| 375px                 | one row (`ref-pwd-whoami-375.png`)                                          | Same                  | Same          |

### Edge cases

- Themes: only the color changes.

## Plan

### Files

```
src/commands/pwd/
  output.ts           PWD_OUTPUT = "/home/han3zeng"
  Pwd.tsx             the Output component
  output.test.ts      Vitest
  Pwd.stories.tsx     Storybook interaction tests (real Terminal)
src/terminal/commands.ts   pwd: { Output: Pwd }
```

### Rendering

```
<div data-testid="pwd">/home/han3zeng</div>
```

The color comes from the entry's `fg` (no class needed unless the entry does not set it).

### Test hooks

`pwd` (the output root).

### Dependencies

None.

### Order of work

1. `output.ts` with TC-1.
2. `Pwd.tsx` and the registry entry (TC 2–3).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-PWD-1: ...")`.

- **TC-CMD-PWD-1** (Vitest) [CMD-PWD] Then `PWD_OUTPUT` equals the code block under `### pwd — CMD-PWD` in `docs/product-requirements.md`, character for character.
- **TC-CMD-PWD-2** (Storybook) [CMD-PWD] Given the dark theme, when `pwd` is submitted twice, then there are two `pwd` outputs, each with `innerText` exactly `/home/han3zeng`, and the color of each is `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-PWD-3** (Storybook) [CMD-PWD, NFR-MOBILE-1] Given 375px, when `pwd` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth` and the a11y addon reports no violations.
