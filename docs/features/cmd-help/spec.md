# cmd-help

PRD: CMD-HELP, INPUT-4 (`help` takes no arguments).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-20, Playwright MCP, headless Chromium at 1280×800 and 375×800). Screenshots: `reference/ref-help-1280.png`, `reference/ref-help-375.png`.

## Scope

In scope: the `help` command's output component: its exact text, its sections, colors and wrapping, and a guard that it stays in sync with the command registry.

Out of scope: argument handling (`help foo` → `Usage: help`, terminal-shell, done); what the listed commands do.

## Spec

### Output (CMD-HELP)

Exactly the PRD's block (17 non-blank lines and 3 blank lines; no trailing spaces). Each command line is two spaces, the name padded with spaces to 12 characters, then the description:

```
Available commands in this terminal

ABOUT ME
  about       Curious about me? Take a peek
  education   Where I earned my brainpower
  email       Shoot me an email
  projects    See what I've been cooking
  resume      My career highlights, minus all the embarrassing bits
  connect     Let's be internet friends
  themes      Change the vibe
  welcome     Back to square one

UTILITIES
  help        List all available commands

TERMINAL
  clear       Clear the terminal
  history     View command history
  pwd         Print current working directory
  whoami      A stranger, for now
```

- The order of sections and of lines inside them is the PRD's (not alphabetical, not registry order).
- Every one of the 13 registered commands appears exactly once, and no other name does. If a command is added to or removed from the registry without updating `help`, TC-CMD-HELP-2 fails.
- `help foo` prints `Usage: help` (terminal-shell).

### Colors (Han's decision)

- The three section headings `ABOUT ME`, `UTILITIES`, `TERMINAL` are in `primary`.
- Everything else (the first line and every command line) is in `fg`.

### Wrapping (NFR-MOBILE-1)

- Lines wrap at the terminal edge (`white-space: pre-wrap`); there's no horizontal scroll. At 375px the longest line (the `resume` line, 67 characters) wraps onto a second row. The wrapped part starts at the left edge (no hanging indent).

### Accessibility

- The headings are styled text, not `<h2>` elements: the page's only heading is the layout's hidden `<h1>`, and output from many `help` runs would otherwise flood the heading outline. Each section is a `<div>` for the heading followed by a `<ul>` of its lines, so screen readers announce "list, 8 items". The leading spaces and name padding are real text (they're part of the PRD's output) and the list has `list-style: none`.

### Reference vs PRD

| Behavior       | Reference (observed)                                                                                                                                 | This spec                                  | Class         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------- |
| Content        | one alphabetical list of 14 commands as `name - description`, names padded to a column, plus three keyboard-shortcut lines (`Tab or Ctrl + i  => …`) | the PRD's text: intro line, three sections | Differs (PRD) |
| Shortcut lines | listed after the commands                                                                                                                            | not listed                                 | Differs (PRD) |
| Colors         | command names in the host color (dark: `rgb(5, 206, 145)`), descriptions in a dimmer text color (`rgb(178, 189, 204)`)                               | headings `primary`, all lines `fg`         | Differs (Han) |
| 375px          | name and description on two rows each (`ref-help-375.png`)                                                                                           | one line each, wrapping only when too long | Differs (PRD) |
| `help me`      | `Usage: help`                                                                                                                                        | Same (terminal-shell)                      | Same          |

### Edge cases

- Running `help` many times: each run prints the full block again; nothing is shared or collapsed.
- Themes: only colors change.

## Plan

### Files

```
src/commands/help/
  helpText.ts           HELP_INTRO; HELP_SECTIONS: { heading: string; lines: { name: string; description: string }[] }[]
  Help.tsx              the Output component
  helpText.test.ts      Vitest
  Help.stories.tsx      Storybook interaction tests
src/terminal/commands.ts   help: { Output: Help }
```

- Each line renders as `  ${name.padEnd(12)}${description}`.

### Rendering

```
<div data-testid="help" class="whitespace-pre-wrap">
  <div>Available commands in this terminal</div>
  <div>&nbsp;</div>                                   — one empty line
  <div data-testid="help-heading" class="text-primary">ABOUT ME</div>
  <ul class="list-none"><li>  about       Curious about me? Take a peek</li>…</ul>
  …
</div>
```

### Test hooks

`help` (the output root), `help-heading` (each of the three headings).

TC-3 compares the output's `innerText` with the PRD block, so each line is its own block row and a blank line renders as one empty line: a row holding a non-breaking space (`<div>&nbsp;</div>`; `<div><br></div>` counts as two lines). Use `<div>` rather than `<p>` for the intro and headings: a `<p>` adds an extra blank line to `innerText`, and an empty `<div>` collapses to nothing.

### Dependencies

None.

### Order of work

1. `helpText.ts` with TC 1–2.
2. `Help.tsx` and the registry entry (TC 3–5).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-HELP-2: ...")`.

### Vitest

- **TC-CMD-HELP-1** (Vitest) [CMD-HELP] Given `HELP_INTRO` and `HELP_SECTIONS` rendered to plain text (intro, blank line, then each section: heading, its command lines, a blank line between sections), then it equals the code block under `### help — CMD-HELP` in `docs/product-requirements.md`, character for character.
- **TC-CMD-HELP-2** (Vitest) [CMD-HELP] Given the registry `commands`, then the set of names in `HELP_SECTIONS` equals the set of registry names, and no name appears twice.

### Storybook interaction tests (`src/commands/help/Help.stories.tsx`, real `Terminal`)

- **TC-CMD-HELP-3** (Storybook) [CMD-HELP] When `help` is submitted, then the entry output's `innerText`, with trailing whitespace trimmed per line, equals the PRD block. Two `help` runs give two identical outputs.
- **TC-CMD-HELP-4** (Storybook) [CMD-HELP] Given the dark theme, when `help` is submitted, then the three `help-heading` elements read `ABOUT ME`, `UTILITIES`, `TERMINAL` and their color is `primary` (`rgb(143, 255, 224)`); the `about` line and the intro line are `fg` (`rgb(211, 233, 230)`). The output contains three lists (`role="list"`) with 8, 1 and 4 items.
- **TC-CMD-HELP-5** (Storybook) [NFR-MOBILE-1] Given 375px, when `help` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth` and the a11y addon reports no violations.
