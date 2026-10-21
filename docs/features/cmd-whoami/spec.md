# cmd-whoami

PRD: CMD-WHOAMI, INPUT-4 (`whoami` takes no arguments).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-21, Playwright MCP, headless Chromium at 1280×800 and 375×800). Screenshots: `reference/ref-pwd-whoami-1280.png`, `reference/ref-pwd-whoami-375.png`.

## Scope

In scope: the `whoami` command's output component, its exact text and color.

Out of scope: argument handling (`whoami bar` → `Usage: whoami`), matching (`WHOAMI` is not found), Tab completion (`wh` → `whoami `), and history. All of these belong to terminal-shell and are already done.

## Spec

### Output (CMD-WHOAMI)

Exactly one line, no trailing spaces:

```
A curious soul with root access to absolutely nothing
```

- The text is in `fg` (PRD theme table: "Past command text and command output → `fg`").
- It is plain text: not a link and not a heading.
- Running `whoami` again prints the same line again.
- At 375px the line (53 characters) is wider than the terminal, so it wraps at word boundaries onto a second row (`white-space: pre-wrap`), like long `help` lines. There's no horizontal page scroll (NFR-MOBILE-1).

### Reference vs PRD

| Behavior            | Reference (observed)                                                        | This spec                                               | Class                                  |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| Output text         | 1280px: `whoami` → `visitor`                                                | `A curious soul with root access to absolutely nothing` | Differs (PRD, Han's change 2026-10-21) |
| Color               | the default output color (dark: `rgb(203, 213, 225)`), same as other output | `fg`                                                    | Same                                   |
| `whoami bar`        | `Usage: whoami`                                                             | Same (terminal-shell)                                   | Same                                   |
| `WHOAMI` / `WhoAmI` | `command not found: WHOAMI` / `command not found: WhoAmI`                   | Same (terminal-shell)                                   | Same                                   |
| 375px               | one row (`ref-pwd-whoami-375.png`)                                          | wraps onto two rows                                     | Differs (longer text)                  |

### Edge cases

- Themes: only the color changes.

## Plan

### Files

```
src/commands/whoami/
  output.ts            WHOAMI_OUTPUT = "A curious soul with root access to absolutely nothing"
  Whoami.tsx           the Output component
  output.test.ts       Vitest
  Whoami.stories.tsx   Storybook interaction tests (real Terminal)
src/terminal/commands.ts   whoami: { Output: Whoami }
```

### Rendering

```
<div data-testid="whoami" class="whitespace-pre-wrap">A curious soul with root access to absolutely nothing</div>
```

The color comes from the entry's `fg` (no class needed unless the entry does not set it).

### Test hooks

`whoami` (the output root).

### Dependencies

None.

### Order of work

1. `output.ts` with TC-1.
2. `Whoami.tsx` and the registry entry (TC 2–3).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-WHOAMI-1: ...")`.

- **TC-CMD-WHOAMI-1** (Vitest) [CMD-WHOAMI] Then `WHOAMI_OUTPUT` equals the code block under `### whoami — CMD-WHOAMI` in `docs/product-requirements.md`, character for character.
- **TC-CMD-WHOAMI-2** (Storybook) [CMD-WHOAMI] Given the dark theme, when `whoami` is submitted twice, then there are two `whoami` outputs, each with `innerText` exactly `A curious soul with root access to absolutely nothing`, and the color of each is `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-WHOAMI-3** (Storybook) [CMD-WHOAMI, NFR-MOBILE-1] Given 375px, when `whoami` is submitted, then the `whoami` output's `textContent` is the full line (nothing cut off), `document.documentElement.scrollWidth <= window.innerWidth`, and the a11y addon reports no violations.
