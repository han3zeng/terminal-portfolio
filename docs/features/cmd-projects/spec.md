# cmd-projects

PRD: CMD-PROJECTS, INPUT-4 (`projects` takes no arguments).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800 and 375×800). Screenshots: `reference/ref-about-education-projects-history-1280.png`, `reference/ref-about-education-projects-history-375.png`.

## Scope

In scope: the `projects` command's output component: text, title and link styling, link targets.

Out of scope: argument handling (`projects go 1` → `Usage: projects`), matching, Tab completion and history (terminal-shell, done).

## Spec

### Output (CMD-PROJECTS)

The PRD block, character for character (four projects, a blank line between projects, no trailing spaces):

```
1. Yahoo News and E-commerce
https://tw.yahoo.com
https://tw.buy.yahoo.com
Once, the most representative internet portal and index site in Taiwan.
Yup, I know, once.

2. Recall Election: Live Results and News
https://hanrecall.pts.org.tw/
…

4. TW Reporter
https://www.twreporter.org/
The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.
```

Each project is a title line, one or more URL lines, then one or more description lines.

- **Title line**: the whole line, number included (`1. Yahoo News and E-commerce`), is `accent`, not underlined, normal weight. (Han, 2026-10-22; PRD updated.)
- **URL lines**: each is an `<a>` whose text and `href` are exactly the URL, `target="_blank"`, `rel="noopener noreferrer"`. Color `accent`, underlined. (Han, 2026-10-22; PRD updated.) These are external absolute URLs, so the base path does not apply.
- **Description lines**: `fg`.
- The blank line between projects is a full-height empty row (non-breaking space, as in `help`).
- Running `projects` again prints the same output again. "Opens in a new tab" is checked through `target="_blank"`; a real click is not tested (following a link in the Storybook runner closes the browser, terminal-shell TC-29).
- At 375px long lines (descriptions, the second title) wrap at word boundaries; URLs that are longer than a row break anywhere (`break-all`) rather than overflow. There's no horizontal page scroll (NFR-MOBILE-1).

### Reference vs PRD

| Behavior        | Reference (observed)                                                                                                                                                                      | This spec                                          | Class                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------- |
| Output text     | 1280px: an intro (`“Talk is cheap. Show me the code”? I got you.` …), four numbered projects with one description line each, then `Usage: projects go <project-no>` / `eg: projects go 4` | The PRD's four projects, no intro, no usage footer | Differs                       |
| URLs            | no URLs printed; `document.querySelectorAll('a')` is empty after `projects`; opening is via `projects go <n>`                                                                             | URL lines are links, open in a new tab             | Differs (PRD)                 |
| Title style     | bold, output color (`rgb(203, 213, 225)`, weight 700)                                                                                                                                     | `accent`, normal weight, number included           | Differs (PRD, Han 2026-10-22) |
| `projects go 1` | advertised by the usage footer (not tried)                                                                                                                                                | `Usage: projects` (takes no arguments)             | Differs (PRD)                 |
| 375px           | descriptions wrap (`reference/ref-about-education-projects-history-375.png`)                                                                                                              | Same                                               | Same                          |

### Edge cases

- Themes: title and link color follow each theme's `accent`; descriptions follow `fg`.

## Plan

### Files

```
src/commands/projects/
  projects.ts            PROJECTS data + projectsText() (plain-text rendering)
  Projects.tsx           the Output component
  projects.test.ts       Vitest
  Projects.stories.tsx   Storybook interaction tests (real Terminal)
src/terminal/commands.ts   projects: { Output: Projects }
```

### Types

```ts
type Project = { title: string; urls: string[]; description: string[] };
export const PROJECTS: Project[]; // title includes its number, e.g. "1. Yahoo News and E-commerce"
export function projectsText(projects: Project[]): string; // lines joined by "\n", blank line between projects
```

### Rendering

```
<div data-testid="projects" class="whitespace-pre-wrap">
  <div data-testid="project-title" class="text-accent">1. Yahoo News and E-commerce</div>
  <div><a href="https://tw.yahoo.com" target="_blank" rel="noopener noreferrer" class="text-accent underline break-all">https://tw.yahoo.com</a></div>
  …
  <div>Once, the most representative …</div>
  <div> </div>
  …
</div>
```

### Test hooks

`projects` (the output root), `project-title` (each title line).

### Dependencies

None.

### Order of work

1. `projects.ts` with TC-1.
2. `Projects.tsx` and the registry entry (TC 2–5).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-PROJECTS-1: ...")`.

- **TC-CMD-PROJECTS-1** (Vitest) [CMD-PROJECTS] Then `projectsText(PROJECTS)` equals the code block under `### projects — CMD-PROJECTS` in `docs/product-requirements.md`, character for character.
- **TC-CMD-PROJECTS-2** (Storybook) [CMD-PROJECTS] When `projects` is submitted twice, then there are two `projects` outputs, and each output's `innerText`, with trailing whitespace trimmed per line, equals the PRD block.
- **TC-CMD-PROJECTS-3** (Storybook) [CMD-PROJECTS] Given the dark theme, when `projects` is submitted, then there are four `project-title` elements reading `1. Yahoo News and E-commerce`, `2. Recall Election: Live Results and News`, `3. PRO360`, `4. TW Reporter`; each is `accent` (`rgb(84, 220, 192)`) and not underlined; the description line `Yup, I know, once.` is `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-PROJECTS-4** (Storybook) [CMD-PROJECTS] When `projects` is submitted, then the output has exactly five links (`role="link"`), named and with `href` exactly `https://tw.yahoo.com`, `https://tw.buy.yahoo.com`, `https://hanrecall.pts.org.tw/`, `https://www.pro360.com.tw`, `https://www.twreporter.org/`, in that order; each has `target="_blank"` and a `rel` containing `noopener`, is `accent` (`rgb(84, 220, 192)`) and underlined (`text-decoration-line: underline`).
- **TC-CMD-PROJECTS-5** (Storybook) [CMD-PROJECTS, NFR-MOBILE-1] Given 375px, when `projects` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth`, the description line of project 4 is taller than one row (it wrapped), and the a11y addon reports no violations.
