# cmd-about

PRD: CMD-ABOUT, INPUT-4 (`about` takes no arguments).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800 and 375×800). Screenshots: `../cmd-projects/reference/ref-about-education-projects-history-1280.png`, `../cmd-projects/reference/ref-about-education-projects-history-375.png` (one session covered about, education, projects and history).

## Scope

In scope: the `about` command's output component, its exact text and color.

Out of scope: argument handling (`about x` → `Usage: about`), matching, Tab completion and history. These belong to terminal-shell and are already done.

## Spec

### Output (CMD-ABOUT)

Exactly two lines, no trailing spaces:

```
Hi! I am Han from Taiwan, a front-end engineer with an insatiable curiosity.
I love to make impacts through coding.
```

- Both lines are `fg` (PRD theme table: "command output → `fg`"). Plain text: no links, no headings, no bold.
- Running `about` again prints the same output again.
- At 375px the first line (76 characters) wraps at word boundaries (`white-space: pre-wrap`). There's no horizontal page scroll (NFR-MOBILE-1).

### Reference vs PRD

| Behavior    | Reference (observed)                                                                                     | This spec              | Class   |
| ----------- | -------------------------------------------------------------------------------------------------------- | ---------------------- | ------- |
| Output text | 1280px: `about` → blank line, `Hi, my name is Sat Naing!`, blank line, two more paragraphs, a blank line | The PRD's two lines    | Differs |
| Name color  | the name `Sat Naing` is highlighted in another color                                                     | all `fg`, no highlight | Differs |
| `about x`   | `Usage: about`                                                                                           | Same (terminal-shell)  | Same    |

### Edge cases

- Themes: only the color changes.

## Plan

### Files

```
src/commands/about/
  output.ts           ABOUT_OUTPUT: the two lines joined by "\n"
  About.tsx           the Output component
  output.test.ts      Vitest
  About.stories.tsx   Storybook interaction tests (real Terminal)
src/terminal/commands.ts   about: { Output: About }
```

### Rendering

```
<div data-testid="about" class="whitespace-pre-wrap">Hi! I am Han …\nI love to make impacts through coding.</div>
```

### Test hooks

`about` (the output root).

### Dependencies

None.

### Order of work

1. `output.ts` with TC-1.
2. `About.tsx` and the registry entry (TC 2–3).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-ABOUT-1: ...")`.

- **TC-CMD-ABOUT-1** (Vitest) [CMD-ABOUT] Then `ABOUT_OUTPUT` equals the code block under `### about — CMD-ABOUT` in `docs/product-requirements.md`, character for character.
- **TC-CMD-ABOUT-2** (Storybook) [CMD-ABOUT] Given the dark theme, when `about` is submitted twice, then there are two `about` outputs, each with `innerText` exactly the PRD's two lines, and each is `fg` (`rgb(211, 233, 230)`) with no `<a>` inside.
- **TC-CMD-ABOUT-3** (Storybook) [CMD-ABOUT, NFR-MOBILE-1] Given 375px, when `about` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth` and the a11y addon reports no violations.
