# cmd-connect

PRD: CMD-CONNECT, INPUT-6 (`connect go` opens the link once, at submit).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800 and 375×800). The reference's equivalent is `socials` (PRD: replaced by `connect`). Screenshots: `reference/ref-socials-1280.png`, `reference/ref-socials-375.png`.

## Scope

In scope: the `connect` command: its output (list and usage block), argument parsing, link styling, and the `connect go <n>` side effect.

Out of scope: matching, Tab completion and history (terminal-shell, done); the `help` line for `connect` (cmd-help).

## Spec

### Arguments (CMD-CONNECT, Han's decisions)

Arguments are split as in terminal-shell (on whitespace runs). Matching is case-sensitive.

| Input                                                                                                                                                            | Output                     | Side effect              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------ |
| `connect`                                                                                                                                                        | the full output (below)    | none                     |
| `connect go 1` / `2` / `3`                                                                                                                                       | nothing (prompt line only) | open link n in a new tab |
| anything else: `connect go`, `connect go 0`, `connect go 4`, `connect go 01`, `connect go +1`, `connect go 1.0`, `connect go 1 x`, `connect foo`, `connect GO 1` | the **usage block only**   | none                     |

- n is valid only when it is exactly the string `1`, `2` or `3` (Han, 2026-10-22). `01`, `+1`, `1.0` are invalid.
- `connect go 1 x` (an extra argument) prints the usage block and opens nothing.

### Full output (`connect`), exactly

```
Let's connect!

  [1] Substack   https://substack.com/@han3zeng
  [2] GitHub     https://github.com/han3zeng
  [3] LinkedIn   https://www.linkedin.com/in/han3zeng

USAGE
  connect            list links
  connect go <n>     open link <n> in a new tab
```

Usage block only (bad arguments), exactly:

```
USAGE
  connect            list links
  connect go <n>     open link <n> in a new tab
```

- A link row is ` [n]` (6 characters), the name padded with spaces to 11 characters, then the URL. No trailing spaces.
- A usage row is two spaces, the command padded to 19 characters, then the description.
- **Colors**: `USAGE` is `primary`. Every other character is `fg`, except the URLs.
- **URLs**: each is an `<a>` whose text and `href` are exactly the URL, `target="_blank"`, `rel="noopener noreferrer"`, `accent`, underlined. These are external absolute URLs, so the base path does not apply.
- Blank lines are full-height empty rows (non-breaking space), as in `help`.
- Running `connect` again prints the same output again.

### `connect go <n>` (INPUT-6)

- Opens the URL of link n in a new tab: `window.open(url, "_blank", "noopener,noreferrer")`, called once from the command's `onSubmit`, inside the Enter keydown handler (a user gesture, so popup blockers allow it). Rendering, re-rendering, Ctrl+L and later submits never open it again.
- Prints nothing: the entry is the prompt line only.
- If the browser blocks the popup anyway, nothing is printed (no error).

### Wrapping (NFR-MOBILE-1, Han's decision)

- Same text at every width. A link row has a **hanging indent of 17 characters**: when the URL doesn't fit, it continues on the next row, starting under the URL column (character 17), not at the left edge. URLs break anywhere (`break-all`) rather than overflow. At 375px (about 35 columns) all three link rows wrap; even the shortest, `https://github.com/han3zeng` (27 characters), needs 17 + 27 = 44.
- Usage rows wrap at word boundaries with no hanging indent (like `help`).
- No horizontal page scroll.

### Reference vs PRD

| Behavior       | Reference (observed)                                                                                                                                                                     | This spec                                     | Class            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------- |
| Command name   | `socials`                                                                                                                                                                                | `connect`                                     | Differs (PRD)    |
| List output    | 1280px: `Here are my social links`, then `1. GitHub     - https://github.com/satnaing` … (four rows), then `Usage: socials go <social-no>` / `eg: socials go 1` (`ref-socials-1280.png`) | `Let's connect!`, `[n]` rows, `USAGE` block   | Differs (PRD)    |
| URLs           | plain text; `document.querySelectorAll('a')` finds only the welcome text's repo link                                                                                                     | links, `accent`, underlined, new tab          | Differs (PRD)    |
| Colors         | `1. GitHub` in the host color (green), `- URL` in the text color                                                                                                                         | `USAGE` `primary`; URLs `accent`; rest `fg`   | Differs (PRD)    |
| `socials go 1` | prints nothing; `window.open("https://github.com/satnaing", "_blank")` (a new tab opened)                                                                                                | Same, with `noopener,noreferrer`              | Same             |
| Bad arguments  | `socials go`, `socials go 9`, `socials go 0`, `socials foo` each print the two usage lines (not the list)                                                                                | the usage block only                          | Same (text: PRD) |
| Extra argument | `socials go 2 x` **opens** link 2 (`window.open` stubbed: called with `https://dev.to/satnaing`) **and** prints the usage lines                                                          | prints the usage block, opens nothing         | Differs (PRD)    |
| 375px          | each row splits: number and name on one row, `- URL` on the next; the long Facebook URL drops below a lone `-` and overflows the right edge (`ref-socials-375.png`)                      | one row per link, hanging indent, no overflow | Differs (Han)    |

### Edge cases

- Themes: URL color follows each theme's `accent`; `USAGE` follows `primary`.
- `connect go 2` twice: opens link 2 twice (once per submit), prints nothing either time.

## Plan

### Files

```
src/commands/connect/
  connect.ts              LINKS data, connectText(), CONNECT_USAGE, parseConnectArgs()
  ConnectOutput.tsx       the Output component (not Connect.tsx: keeps the casing pattern of ProjectsOutput)
  connect.test.ts         Vitest
  Connect.stories.tsx     Storybook interaction tests (real Terminal)
src/terminal/types.ts      CommandEffects gains openUrl
src/terminal/Terminal.tsx  default openUrl; merge the effects prop over the defaults
src/terminal/commands.ts   connect: { Output: ConnectOutput, onSubmit }
```

### Types

```ts
type SocialLink = { name: string; url: string };
export const LINKS: SocialLink[]; // Substack, GitHub, LinkedIn, in that order
export const CONNECT_INTRO = "Let's connect!";
export const CONNECT_USAGE: { command: string; description: string }[];
export const linkPrefix: (index: number, name: string) => string; // "  [n] " + name padded to 11
export const usageLine: (command: string, description: string) => string; // "  " + command padded to 19
export function connectText(kind: "list" | "usage"): string; // the PRD text, lines joined by "\n"
export function parseConnectArgs(
  args: string[],
): { kind: "list" } | { kind: "go"; url: string } | { kind: "usage" };

// src/terminal/types.ts
export type CommandEffects = {
  setTheme: (theme: string) => void;
  openUrl: (url: string) => void;
};
```

- `Terminal` builds its effects as `{ setTheme, openUrl: defaultOpenUrl, ...effects }`, with the `effects` prop typed `Partial<CommandEffects>`, so existing stories that pass only `setTheme` still typecheck.
- `defaultOpenUrl = (url) => window.open(url, "_blank", "noopener,noreferrer")`.
- `onSubmit: ({ args }, { openUrl }) => { const p = parseConnectArgs(args); if (p.kind === "go") openUrl(p.url); }`.

### Rendering

```
<div data-testid="connect" class="whitespace-pre-wrap">
  <div>Let's connect!</div>
  <div>&nbsp;</div>
  <ul class="list-none">
    <li class="pl-[17ch] -indent-[17ch]">  [1] Substack   <a href="…" target="_blank" rel="noopener noreferrer" class="text-accent underline break-all">https://substack.com/@han3zeng</a></li>
    …
  </ul>
  <div>&nbsp;</div>
  <div data-testid="connect-usage-heading" class="text-primary">USAGE</div>
  <ul class="list-none"><li>  connect            list links</li>…</ul>
</div>
```

- The leading spaces and padding are real text (`innerText` must equal the PRD). The hanging indent is `padding-left: 17ch; text-indent: -17ch`, so the first row starts at the left edge with its spaces and wrapped rows start at 17ch.
- The `USAGE` heading is a styled `<div>`, not a heading element (same reason as `help`).

### Test hooks

`connect` (the output root), `connect-usage-heading`.

### Dependencies

None.

### Order of work

1. `connect.ts` with TC 1–3.
2. `openUrl` in `CommandEffects` and `Terminal`.
3. `ConnectOutput.tsx` and the registry entry (TC 4–9).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-CONNECT-1: ...")`.

### Vitest

- **TC-CMD-CONNECT-1** (Vitest) [CMD-CONNECT] Then `connectText("list")` equals the code block under `### connect — CMD-CONNECT` in `docs/product-requirements.md`, character for character, and `connectText("usage")` equals its last three lines (from `USAGE`).
- **TC-CMD-CONNECT-2** (Vitest) [CMD-CONNECT] Given `[]`, then `parseConnectArgs` returns `{ kind: "list" }`. Given `["go","1"]`, `["go","2"]`, `["go","3"]`, then it returns `{ kind: "go", url }` with `https://substack.com/@han3zeng`, `https://github.com/han3zeng`, `https://www.linkedin.com/in/han3zeng` respectively.
- **TC-CMD-CONNECT-3** (Vitest) [CMD-CONNECT] Given `["go"]`, `["go","0"]`, `["go","4"]`, `["go","01"]`, `["go","+1"]`, `["go","1.0"]`, `["go","1","x"]`, `["foo"]` or `["GO","1"]`, then `parseConnectArgs` returns `{ kind: "usage" }`.

### Storybook interaction tests (`src/commands/connect/Connect.stories.tsx`, real `Terminal`)

- **TC-CMD-CONNECT-4** (Storybook) [CMD-CONNECT] When `connect` is submitted twice, then there are two `connect` outputs, and each output's `innerText`, with trailing whitespace trimmed per line, equals the PRD block.
- **TC-CMD-CONNECT-5** (Storybook) [CMD-CONNECT] When `connect` is submitted, then the output has exactly three links (`role="link"`), named and with `href` exactly `https://substack.com/@han3zeng`, `https://github.com/han3zeng`, `https://www.linkedin.com/in/han3zeng`, in that order; each has `target="_blank"` and a `rel` containing `noopener`, is `accent` (dark: `rgb(84, 220, 192)`) and underlined (`text-decoration-line: underline`).
- **TC-CMD-CONNECT-6** (Storybook) [CMD-CONNECT] Given the dark theme, when `connect` is submitted, then `connect-usage-heading` reads `USAGE` and is `primary` (`rgb(143, 255, 224)`); the `Let's connect!` line and the `connect go <n>` usage line are `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-CONNECT-7** (Storybook) [CMD-CONNECT, INPUT-6] Given a `Terminal` with an `effects.openUrl` spy, when `connect go 2` is submitted, then the spy was called once with `https://github.com/han3zeng` and the entry has no output (prompt line only). When `pwd` is submitted, Ctrl+L is pressed, and `connect` is submitted, then the spy has still been called once.
- **TC-CMD-CONNECT-8** (Storybook) [CMD-CONNECT] Given an `effects.openUrl` spy, when `connect go 4`, `connect go 01`, `connect go 1 x` and `connect foo` are submitted, then each output's `innerText` (trimmed per line) is exactly the three-line usage block, no output contains a link, and the spy was never called.
- **TC-CMD-CONNECT-9** (Storybook) [CMD-CONNECT, NFR-MOBILE-1] Given 375px, when `connect` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth`; the LinkedIn row's `<li>` is taller than one line-height (it wraps) and the left edge of the LinkedIn link's last client rect (`getClientRects()`) equals its first rect's left edge (the wrapped part stays in the URL column), within 1px; and the a11y addon reports no violations.
