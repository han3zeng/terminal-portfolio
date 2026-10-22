# cmd-resume

PRD: CMD-RESUME, INPUT-4 (`resume` takes no arguments), INPUT-6 (the download starts once, at submit), NFR-BUILD-2 (the file link includes the base path).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800). The reference has no `resume` command: `resume` prints `command not found: resume`. Everything here comes from the PRD and Han's answers.

## Scope

In scope: the `resume` command's output, its download side effect, the PDF file in `public/`, and the base path of its URL.

Out of scope: argument handling (`resume foo` → `Usage: resume`), matching, Tab completion and history (terminal-shell, done).

## Spec

### Output (CMD-RESUME)

The PRD block, character for character (no trailing spaces), all `fg`, no links:

```
I am looking forward to hearing from you.
(Come on! please! give me job.)
```

- Running `resume` again prints the same output again (and downloads again: one side effect per submit).

### Side effect (CMD-RESUME, INPUT-6, NFR-BUILD-2; Han's decisions)

- On submit, the browser **downloads** the resume; it does not open it in a tab or leave the page.
- The URL is `/terminal-portfolio/resume.pdf`: the base path plus `/resume.pdf`. The base path is `BASE_PATH` from `src/site.ts`, the single source that `next.config.ts`, `playwright.config.ts`, the app and the tests all import.
- The saved file is named **`Han-Zeng-Resume.pdf`** (Han, 2026-10-22), set with the `download` attribute.
- Mechanism: create an `<a href={url} download={filename}>`, click it, discard it. Called once from the command's `onSubmit`, inside the Enter keydown (a user gesture). Rendering, re-rendering, Ctrl+L and later submits never download again.
- `resume foo` prints `Usage: resume` and does not download.
- The output has no link to the PDF (Han, 2026-10-22: only `email` gets a fallback link).

### The file

- `public/resume.pdf` does not exist yet. For now it is a **one-page placeholder PDF** (Han, 2026-10-22). Han replaces it with the real resume at the same path later; nothing else changes.
- The file must be a real PDF (starts with `%PDF-`), so the download test checks something meaningful.

### Reference vs PRD

| Behavior | Reference (observed)                | This spec                                            | Class            |
| -------- | ----------------------------------- | ---------------------------------------------------- | ---------------- |
| `resume` | 1280px: `command not found: resume` | the PRD's two lines; downloads `Han-Zeng-Resume.pdf` | Not in reference |

### Edge cases

- Static export: `public/resume.pdf` is copied to `out/resume.pdf` and served at `/terminal-portfolio/resume.pdf` on GitHub Pages. A URL without the base path would 404 there (CLAUDE.md "Stack pitfalls").
- Themes: only colors change.

## Plan

### Files

```
public/resume.pdf          placeholder, one page (replaced by Han later)
src/site.ts                BASE_PATH and SITE_URL (done 2026-10-22, before this feature: the single source for the base path)
src/commands/resume/
  resume.ts                RESUME_URL, RESUME_FILENAME, RESUME_LINES, resumeText()
  ResumeOutput.tsx         the Output component (not Resume.tsx: `./Resume` would resolve to `resume.ts` on macOS)
  resume.test.ts           Vitest
  Resume.stories.tsx       Storybook interaction tests (real Terminal)
e2e/resume-download.spec.ts  Playwright: the real download from the built site
src/terminal/types.ts      CommandEffects gains download
src/terminal/Terminal.tsx  default download
src/terminal/commands.ts   resume: { Output: ResumeOutput, onSubmit }
```

### Types

```ts
// src/site.ts (exists)
export const BASE_PATH = "/terminal-portfolio";

// resume.ts
export const RESUME_URL = `${BASE_PATH}/resume.pdf`;
export const RESUME_FILENAME = "Han-Zeng-Resume.pdf";
export function resumeText(): string; // the PRD text, lines joined by "\n"

// src/terminal/types.ts
export type CommandEffects = {
  setTheme: (theme: string) => void;
  openUrl: (url: string) => void;
  navigate: (url: string) => void;
  download: (url: string, filename: string) => void;
};
```

- Default `download`: `const a = document.createElement("a"); a.href = url; a.download = filename; a.click();`
- `onSubmit: (_ctx, { download }) => download(RESUME_URL, RESUME_FILENAME)`.

### Rendering

```
<div data-testid="resume" class="whitespace-pre-wrap">
  <div>I am looking forward to hearing from you.</div>
  <div>(Come on! please! give me job.)</div>
</div>
```

### Test hooks

`resume` (the output root).

### Dependencies

None.

### Order of work

1. `resume.ts` and the placeholder PDF, with TC 1–3.
2. `download` in `CommandEffects` and `Terminal`.
3. `ResumeOutput.tsx` and the registry entry (TC 4–6).
4. The e2e download test (TC-7).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-RESUME-1: ...")`.

### Vitest

- **TC-CMD-RESUME-1** (Vitest) [CMD-RESUME] Then `resumeText()` equals the code block under `### resume — CMD-RESUME` in `docs/product-requirements.md`, character for character.
- **TC-CMD-RESUME-2** (Vitest) [CMD-RESUME, NFR-BUILD-2] Then `RESUME_URL` is `` `${BASE_PATH}/resume.pdf` `` (`/terminal-portfolio/resume.pdf`), and `RESUME_FILENAME` is `Han-Zeng-Resume.pdf`.
- **TC-CMD-RESUME-3** (Vitest) [CMD-RESUME] Then `public/resume.pdf` exists and its first five bytes are `%PDF-`.

### Storybook interaction tests (`src/commands/resume/Resume.stories.tsx`, real `Terminal`)

- **TC-CMD-RESUME-4** (Storybook) [CMD-RESUME] Given an `effects.download` spy, when `resume` is submitted twice, then there are two `resume` outputs, each output's `innerText` (trimmed per line) equals the PRD block, and neither contains a link.
- **TC-CMD-RESUME-5** (Storybook) [CMD-RESUME, INPUT-6, INPUT-4] Given an `effects.download` spy, when `resume` is submitted, then the spy was called once with `("/terminal-portfolio/resume.pdf", "Han-Zeng-Resume.pdf")`. When `pwd` is submitted, Ctrl+L is pressed and `help` is submitted, then it has still been called once. When `resume foo` is submitted, then the output is `Usage: resume` and the spy has still been called once.
- **TC-CMD-RESUME-6** (Storybook) [CMD-RESUME, NFR-MOBILE-1] Given 375px and an `effects.download` spy, when `resume` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth` and the a11y addon reports no violations.

### Playwright e2e (`e2e/resume-download.spec.ts`, the built site)

- **TC-CMD-RESUME-7** (Playwright) [CMD-RESUME, NFR-BUILD-2] Given the static export served under `/terminal-portfolio/`, when `resume` is typed into the terminal input and Enter is pressed, then a `download` event fires; its `suggestedFilename()` is `Han-Zeng-Resume.pdf`, its `url()` path is `/terminal-portfolio/resume.pdf`, and the saved file starts with `%PDF-`. The page URL is unchanged and the output's two lines are visible.

### Test-tooling notes

- Every story passes an `effects.download` spy: the real default would download a file from the Storybook iframe.
- The real `<a download>` mechanism and the base path in the built site are covered only by TC-7 (Playwright), since Storybook doesn't serve the export under `/terminal-portfolio/`.
