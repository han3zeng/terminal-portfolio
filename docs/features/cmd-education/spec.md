# cmd-education

PRD: CMD-EDUCATION, INPUT-4 (`education` takes no arguments).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800 and 375×800). Screenshots: `../cmd-projects/reference/ref-about-education-projects-history-1280.png`, `../cmd-projects/reference/ref-about-education-projects-history-375.png`.

## Scope

In scope: the `education` command's output component, its exact text and color.

Out of scope: argument handling (`education x` → `Usage: education`), matching, Tab completion and history (terminal-shell, done).

## Spec

### Output (CMD-EDUCATION)

Exactly five lines (the middle one blank), no trailing spaces:

```
M.S. in Computer Science
Northwestern University | US | 2014 - 2015

B.E. in Electrical Engineering
National Chi Nan University | TW | 2009 - 2012
```

- Every line is `fg`, normal weight (PRD theme table: "command output → `fg`"; the PRD names no other style for this command).
- The blank line is a full-height empty row (it holds a non-breaking space, like `help` and `welcome`, so it does not collapse).
- Running `education` again prints the same output again.
- At 375px the two school lines (42 and 46 characters) are wider than the terminal (about 35 characters), so they wrap at word boundaries; the degree lines and the blank row stay one row each. There's no horizontal page scroll (NFR-MOBILE-1).

### Reference vs PRD

| Behavior      | Reference (observed)                                                                                                 | This spec                     | Class   |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------- |
| Output text   | 1280px: `Here is my education background!`, then three degree/school pairs (`B.Sc (Hons) in Computing`, …)           | The PRD's two pairs, no intro | Differs |
| Styling       | degree lines bold in the output color (`rgb(203, 213, 225)`, weight 700); school lines dimmer (`rgb(178, 189, 204)`) | all `fg`, normal weight       | Differs |
| `education x` | `Usage: education` (same handling as `about x`)                                                                      | Same (terminal-shell)         | Same    |

### Edge cases

- Themes: only the color changes.

## Plan

### Files

```
src/commands/education/
  output.ts               EDUCATION_OUTPUT: the five lines joined by "\n"
  Education.tsx           the Output component
  output.test.ts          Vitest
  Education.stories.tsx   Storybook interaction tests (real Terminal)
src/terminal/commands.ts   education: { Output: Education }
```

### Rendering

One block row per line; the blank line is a row holding `" "` (non-breaking space).

```
<div data-testid="education" class="whitespace-pre-wrap">
  <div>M.S. in Computer Science</div>
  <div>Northwestern University | US | 2014 - 2015</div>
  <div> </div>
  …
</div>
```

### Test hooks

`education` (the output root).

### Dependencies

None.

### Order of work

1. `output.ts` with TC-1.
2. `Education.tsx` and the registry entry (TC 2–3).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-EDUCATION-1: ...")`.

- **TC-CMD-EDUCATION-1** (Vitest) [CMD-EDUCATION] Then `EDUCATION_OUTPUT` equals the code block under `### education — CMD-EDUCATION` in `docs/product-requirements.md`, character for character.
- **TC-CMD-EDUCATION-2** (Storybook) [CMD-EDUCATION] Given the dark theme, when `education` is submitted twice, then there are two `education` outputs; each output's `innerText`, with trailing whitespace trimmed per line, equals the PRD block (including the blank line); each is `fg` (`rgb(211, 233, 230)`) and its font weight is 400.
- **TC-CMD-EDUCATION-3** (Storybook) [CMD-EDUCATION, NFR-MOBILE-1] Given 375px, when `education` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth` and the a11y addon reports no violations.
