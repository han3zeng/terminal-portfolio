# cmd-projects

PRD: CMD-PROJECTS, INPUT-4 (`projects` takes no arguments).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800 and 375×800).

Revised 2026-10-22: the output moved to the shared man-page style (Han): a `Selected projects` intro line, `[n]` numbering, and a hanging indent. The style is shared with `connect`, `themes` and `help`. Screenshots: `reference/ref-about-education-projects-history-1280.png`, `reference/ref-about-education-projects-history-375.png`.

## Scope

In scope: the `projects` command's output component: text, title and link styling, link targets.

Out of scope: argument handling (`projects go 1` → `Usage: projects`), matching, Tab completion and history (terminal-shell, done).

## Spec

### Output (CMD-PROJECTS)

The PRD block, character for character (intro line, blank line, four projects with a blank line between them, no trailing spaces):

```
Selected projects

  [1] Yahoo News and E-commerce
      https://tw.yahoo.com
      https://tw.buy.yahoo.com
      Once, the most representative internet portal and index site in Taiwan.
      Yup, I know, once.

  [2] Recall Election: Live Results and News
      https://hanrecall.pts.org.tw/
      …

  [4] TW Reporter
      https://www.twreporter.org/
      The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.
```

Each project is a title line, one or more URL lines, then one or more description lines. A title line is ` [n]` (6 characters) then the title; every URL and description line is 6 spaces then its text.

- **Intro line** `Selected projects`: `fg`.
- **Title line**: the whole line, `[n]` included (`[1] Yahoo News and E-commerce`), is `accent`, not underlined, normal weight. (Han, 2026-10-22; PRD updated.)
- **URL lines**: each is an `<a>` whose text and `href` are exactly the URL, `target="_blank"`, `rel="noopener noreferrer"`. Color `accent`, underlined. (Han, 2026-10-22; PRD updated.) These are external absolute URLs, so the base path does not apply.
- **Description lines**: `fg`.
- The blank line between projects is a full-height empty row (non-breaking space, as in `help`).
- Running `projects` again prints the same output again. "Opens in a new tab" is checked through `target="_blank"`; a real click is not tested (following a link in the Storybook runner closes the browser, terminal-shell TC-29).
- **Hanging indent** (PRD): every line of a project (title, URLs, descriptions) wraps with a hanging indent of 6 characters, so wrapped parts line up with the title text, not with the left edge. At 375px long lines (descriptions, the second title) wrap at word boundaries; URLs that are longer than a row break anywhere (`break-all`) rather than overflow. There's no horizontal page scroll (NFR-MOBILE-1).

### Reference vs PRD

| Behavior        | Reference (observed)                                                                                                                                                                      | This spec                                                                       | Class                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| Output text     | 1280px: an intro (`“Talk is cheap. Show me the code”? I got you.` …), four numbered projects with one description line each, then `Usage: projects go <project-no>` / `eg: projects go 4` | `Selected projects`, four `[n]` projects with a hanging indent, no usage footer | Differs                       |
| URLs            | no URLs printed; `document.querySelectorAll('a')` is empty after `projects`; opening is via `projects go <n>`                                                                             | URL lines are links, open in a new tab                                          | Differs (PRD)                 |
| Title style     | bold, output color (`rgb(203, 213, 225)`, weight 700)                                                                                                                                     | `accent`, normal weight, number included                                        | Differs (PRD, Han 2026-10-22) |
| `projects go 1` | advertised by the usage footer (not tried)                                                                                                                                                | `Usage: projects` (takes no arguments)                                          | Differs (PRD)                 |
| 375px           | descriptions wrap to the left edge (`reference/ref-about-education-projects-history-375.png`)                                                                                             | wrap with a 6-character hanging indent                                          | Differs (PRD)                 |

### Edge cases

- Themes: title and link color follow each theme's `accent`; descriptions follow `fg`.

## Plan

### Files

```
src/commands/projects/
  projects.ts            PROJECTS data + projectsText() (plain-text rendering)
  ProjectsOutput.tsx     the Output component (not Projects.tsx: on macOS's case-insensitive file system, `./Projects` would resolve to `projects.ts`)
  projects.test.ts       Vitest
  Projects.stories.tsx   Storybook interaction tests (real Terminal)
src/terminal/commands.ts   projects: { Output: ProjectsOutput }
```

### Types

```ts
type Project = { title: string; urls: string[]; description: string[] };
export const PROJECTS: Project[]; // title without its number, e.g. "Yahoo News and E-commerce"
export const PROJECTS_INTRO = "Selected projects";
export const titleLine: (index: number, title: string) => string; // "  [n] " + title
export const INDENT = "      "; // 6 spaces before URL and description lines
export function projectsText(projects: Project[]): string; // the PRD text: intro, blank line, projects; lines joined by "\n"
```

### Rendering

```
<div data-testid="projects" class="whitespace-pre-wrap">
  <div>Selected projects</div>
  <div> </div>
  <div data-testid="project-title" class="text-accent pl-[6ch] -indent-[6ch]">  [1] Yahoo News and E-commerce</div>
  <div class="pl-[6ch] -indent-[6ch]">      <a href="https://tw.yahoo.com" target="_blank" rel="noopener noreferrer" class="text-accent underline break-all">https://tw.yahoo.com</a></div>
  …
  <div class="pl-[6ch] -indent-[6ch]">      Once, the most representative …</div>
  <div> </div>
  …
</div>
```

- The leading spaces are real text (`innerText` must equal the PRD). The hanging indent is `padding-left: 6ch; text-indent: -6ch` on each line, so a line's first row starts at the left edge with its spaces and its wrapped rows start at 6ch. The spaces before a URL are outside the `<a>`, so they are not underlined.

### Test hooks

`projects` (the output root), `project-title` (each title line).

TC-6 measures rows with a `Range` over the **first text node** of a line, from offset 6. A title or description line's leading spaces and text must therefore be one text node (render `` `  [${n}] ${title}` `` as one string, not `  [{n}] {title}`, which React splits into several nodes).

### Dependencies

None.

### Order of work

1. `projects.ts` with TC-1.
2. `ProjectsOutput.tsx` and the registry entry (TC 2–6).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-PROJECTS-1: ...")`.

- **TC-CMD-PROJECTS-1** (Vitest) [CMD-PROJECTS] Then `projectsText(PROJECTS)` equals the code block under `### projects — CMD-PROJECTS` in `docs/product-requirements.md`, character for character.
- **TC-CMD-PROJECTS-2** (Storybook) [CMD-PROJECTS] When `projects` is submitted twice, then there are two `projects` outputs, and each output's `innerText`, with trailing whitespace trimmed per line, equals the PRD block.
- **TC-CMD-PROJECTS-3** (Storybook) [CMD-PROJECTS] Given the dark theme, when `projects` is submitted, then there are four `project-title` elements whose text, trimmed, reads `[1] Yahoo News and E-commerce`, `[2] Recall Election: Live Results and News`, `[3] PRO360`, `[4] TW Reporter`; each is `accent` (`rgb(84, 220, 192)`) and not underlined; the description line `Yup, I know, once.` and the intro line `Selected projects` are `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-PROJECTS-4** (Storybook) [CMD-PROJECTS] When `projects` is submitted, then the output has exactly five links (`role="link"`), named and with `href` exactly `https://tw.yahoo.com`, `https://tw.buy.yahoo.com`, `https://hanrecall.pts.org.tw/`, `https://www.pro360.com.tw`, `https://www.twreporter.org/`, in that order; each has `target="_blank"` and a `rel` containing `noopener`, is `accent` (`rgb(84, 220, 192)`) and underlined (`text-decoration-line: underline`).
- **TC-CMD-PROJECTS-5** (Storybook) [CMD-PROJECTS, NFR-MOBILE-1] Given 375px, when `projects` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth` and the a11y addon reports no violations.
- **TC-CMD-PROJECTS-6** (Storybook) [CMD-PROJECTS, NFR-MOBILE-1] Given 375px, when `projects` is submitted, then the description line `The non-profit digital news outlet …` and the title `[2] Recall Election: Live Results and News` each wrap (taller than one line-height), and for each, a `Range` over its text shows that every row after the first starts at the same left offset as the first character after its 6 leading spaces (the hanging indent), within 1px.
