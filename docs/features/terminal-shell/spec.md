# terminal-shell

PRD: UI-LAYOUT-2, UI-LAYOUT-3, UI-PROMPT-1, INPUT-1 – INPUT-8, CMD-NOT-FOUND, NFR-A11Y-1, NFR-A11Y-2, NFR-MOBILE-1 (shell part). Also provides the mechanism (not the output) used by CMD-CLEAR and CMD-HISTORY.

Reference studied: the live site https://terminal.satnaing.dev/ (checked 2026-10-20 with the Playwright MCP, headless Chromium at 1280px and 375px). The "Reference vs PRD" evidence below is what the page did or delivered (DOM, computed styles, input values, key events). The behavior decisions below are Han's and don't depend on that evidence.

## Scope

In scope: the terminal component, the prompt, the input and its block cursor, the list of entries, command parsing and lookup, `command not found`, the generic `Usage: <command>` for commands that take no arguments, command history, keyboard shortcuts, Tab completion, running `welcome` automatically on load, focus handling, scroll-to-bottom, the a11y wiring, and the prompt layout on narrow screens.

Out of scope (each has its own feature): what each command prints (`cmd-*`), theme colors (`themes`), the page shell, font and SEO (`layout`). The shell has a registry with one entry for each of the 13 commands. Until its `cmd-*` feature lands, each command's output is a stub that renders nothing.

## Spec

### Terminal model

- The terminal state is a list of **entries**. Each entry has the submitted text (exactly as typed) and the result of resolving it. Each entry renders a prompt line followed by its output. Nothing is appended to the DOM by hand.
- **History** is a separate list of submitted texts, oldest first. It is separate from entries: `clear` and Ctrl+L empty the entries but leave history alone (CMD-CLEAR).
- On first load the terminal holds one entry, `welcome`, and history is `["welcome"]` (UI-LAYOUT-2, CMD-HISTORY). This entry exists in the initial render, so it is part of the static HTML.

### Prompt (UI-PROMPT-1)

- Exact prompt text: `visitor@han3zeng:~$`, followed by one space.
- The same prompt is shown before the live input and before every past entry's command.
- **Viewport ≥ 768px**: the prompt and the input (or the past command) are on one line.
- **Viewport < 768px** (Han's decision: follow the reference): the prompt is on its own line. The next line starts with `>` and a space, followed by the input (or the past command). Past entries use the same two-line layout. The input is a single line. Text longer than the line scrolls sideways inside the input, never the page (NFR-MOBILE-1).

### Submitting (INPUT-1, INPUT-2, INPUT-3, INPUT-4, CMD-NOT-FOUND)

Enter submits the current input `raw`. Steps:

1. Resolve `raw`:
   - `raw.trim()` is empty → **empty**.
   - Otherwise split `raw.trim()` on runs of whitespace (`/\s+/`). The first token is the command name and the rest are the args. So `connect  go 1` gives `connect` and `["go", "1"]`.
   - Look up the name, case-sensitively, among the registered commands. No match → **not-found**. Example: `HELP`.
   - The command takes no arguments and there are args → **usage**.
   - Otherwise → **command** (the definition plus its args).
2. Add an entry `{ input: raw, result }`. The prompt line shows `raw` as typed, with whitespace preserved (`white-space: pre`).
3. Add `raw` to history, as typed, unless the result is **empty**. Empty and whitespace-only inputs are never recorded.
4. If the result is **command** and the definition has an `onSubmit` side effect, call it exactly once, here in the submit handler (INPUT-6). Rendering or re-rendering an entry never calls it.
5. Clear the input, the hints, and the history navigation position.

What each result prints:

| Result    | Output                                                                        |
| --------- | ----------------------------------------------------------------------------- |
| empty     | nothing (only the prompt line)                                                |
| not-found | `command not found: <raw>` (`raw` as typed, whitespace preserved)             |
| usage     | `Usage: <name>`                                                               |
| command   | the command's output component, given its args and the history at submit time |

- Commands that take arguments: `connect`, `themes`. All others take none. `clear foo` prints `Usage: clear` and does **not** clear.
- The history passed to a command is a snapshot taken at submit time and includes the submitted command itself. So a past `history` entry keeps the output it had when it ran.

### Command history navigation (INPUT-7 ↑/↓)

- ↑ shows the previous entry in history. The first ↑ shows the newest entry. At the oldest entry, ↑ does nothing.
- ↓ shows the next newer entry. ↓ from the newest entry empties the input and leaves navigation. ↓ when not navigating does nothing.
- After ↑ or ↓, the caret is at the end of the input.
- Both prevent the default action, so the input caret doesn't jump and the page doesn't scroll.
- Typing does **not** end navigation (Han: follow the reference). After ↑ recalls an entry and the visitor edits it, the next ↑ goes on to the next older entry and ↓ to the next newer one, replacing the edited text. Example: history `["welcome", "a", "b"]`, ↑ shows `b`, typing `x` gives `bx`, ↑ shows `a`.
- Submitting and ↓ past the newest entry end navigation. The next ↑ starts again from the newest entry. (Ctrl+L leaves the navigation position as it is.)

### Tab completion (INPUT-7 Tab)

Only command names are completed (Han's decision). Arguments are never completed.

- Tab always prevents the default action, so focus stays in the input.
- If the input is empty or contains whitespace, Tab does nothing.
- Otherwise, find the registered command names that start with the input, case-sensitively:
  - **No match**: nothing changes and no hints are shown.
  - **One match**: the input becomes `<name> ` (with a trailing space), and the hints are cleared. Example: `hel` → `help `.
  - **Several matches**: the input becomes the longest common prefix of the matches, and the matches are listed as hints below the input, in registry order (alphabetical). Example: `h` → input stays `h`, hints `help  history`. `c` → hints `clear  connect`.
- The hints disappear when the input changes, on submit, and on Ctrl+L.

### Other shortcuts (INPUT-7)

Shortcuts use the Ctrl key on every platform, including macOS. Cmd (Meta) combinations are not intercepted, so the browser keeps its native behavior for them. Every shortcut below prevents the default action.

- **Ctrl+L**: empties the entries. Text already typed **stays in the input** (Han's decision). The hints are cleared. Ctrl+L is not added to history, and history is unchanged.
- **Ctrl+A**: moves the caret to position 0. It does not select the page or the input text.
- **Ctrl+K**: deletes from the caret to the end of the input. The caret stays where it was.

### Block cursor (INPUT-8, NFR-A11Y-2)

- The browser's caret is hidden. A block `█` in the `primary` color is drawn at the caret position (`selectionStart`), so it follows ←/→, Home/End, clicks, Ctrl+A and Ctrl+K. At the end of the input it sits after the last character.
- **While the input has focus**: a solid block that blinks. This includes focus the input got before React hydrated (the `autofocus` attribute in the static HTML focuses it while the page is still loading).
- **While the input does not have focus**: a hollow (outlined) block that does not blink (Han's decision).
- With `prefers-reduced-motion: reduce`, the block never blinks.
- When text is selected (a range, not just a caret), the native selection highlight shows the range and the block is drawn at `selectionStart`.

### Focus, scroll, a11y (INPUT-5, UI-LAYOUT-3, NFR-A11Y-1, NFR-MOBILE-1)

- The input is focused on load (desktop). A click anywhere on the page focuses the input. A click on a link inside the output still follows the link.
- On mobile, a tap on the terminal focuses the input and so opens the on-screen keyboard.
- The input has the accessible name `Terminal input`. It has `autocomplete="off"`, `autocapitalize="off"`, `autocorrect="off"` and `spellcheck="false"`.
- The list of entries is in an `aria-live="polite"` region, so new output is announced. The hints are also announced.
- The input line always comes after the latest entry. After each submit and after Ctrl+L, the terminal scrolls so that the input line is visible at the bottom.

### Reference vs PRD

| Behavior                                     | Reference (observed)                                                                                                                                                                                       | This spec                                                        | Class                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------- |
| Prompt text                                  | `visitor@terminal.satnaing.dev:~$`                                                                                                                                                                         | `visitor@han3zeng:~$`                                            | Differs (PRD wins)        |
| Narrow-screen prompt                         | prompt, line break, then `>` below 550px (two lines at 549px, one line at 550px)                                                                                                                           | Same, but the breakpoint is 768px                                | Differs (breakpoint)      |
| Matching                                     | `  pwd  ` runs `pwd`; `HELP` gives `command not found: HELP`                                                                                                                                               | Same                                                             | Same                      |
| Arg splitting                                | `themes  set dark` (two spaces) prints `Usage: themes set <theme-name>`: splits on single spaces                                                                                                           | on whitespace runs                                               | Differs (Han)             |
| Empty input                                  | `""` gives an empty entry; `"   "` gives `command not found:`. Both are **recorded** (`history` lists `""` and `"   "`)                                                                                    | empty and whitespace-only give an empty entry, **not recorded**  | Differs (Han)             |
| History text                                 | raw text: `history` lists `"  pwd  "` with its spaces                                                                                                                                                      | raw text                                                         | Same                      |
| `Usage: <cmd>` for no-arg commands           | `clear foo` prints `Usage: clear`                                                                                                                                                                          | Same                                                             | Same                      |
| Tab, one match                               | `he` → `help`, no trailing space                                                                                                                                                                           | name plus a trailing space                                       | Differs (Han)             |
| Tab, several matches                         | `e` → hints `echo` `education` `email`, input stays `e`                                                                                                                                                    | longest common prefix plus hints                                 | Differs (Han)             |
| Tab arguments                                | `themes s` → `themes set`                                                                                                                                                                                  | not supported                                                    | Differs (Han)             |
| Ctrl+I as Tab                                | `wh` + Ctrl+I → `whoami` (default prevented)                                                                                                                                                               | no                                                               | Not in PRD (dropped)      |
| Ctrl+L                                       | clears entries, keeps the input; the next `history` lists only `history`, so **history is cleared**                                                                                                        | clears entries, keeps history and input                          | Differs (PRD + Han)       |
| Ctrl+A / Ctrl+K                              | not handled: default not prevented. The caret moves and the line is cut only by the browser's native (macOS) bindings                                                                                      | handled                                                          | Not in reference          |
| ↑/↓                                          | newest first, stops at the oldest, ↓ past newest gives `""`, ↓ when not navigating does nothing; caret at the end after ↑. Typing does **not** end navigation: ↑, type, ↑ continues from the same position | Same: typing does not end navigation; caret at the end after ↑/↓ | Same                      |
| Cursor                                       | native caret, `caret-color` the same green as the host part of the prompt                                                                                                                                  | custom block at the caret, hollow when blurred                   | Differs (PRD)             |
| Side effects                                 | `socials go 1` opens the link once; later submits don't open it again                                                                                                                                      | run once in the submit handler                                   | Same (behavior)           |
| Entry keys                                   | every submit removes and re-adds all entry nodes (MutationObserver: the oldest entry node is replaced)                                                                                                     | a stable id for each entry                                       | Not observable (visually) |
| Initial `welcome` entry and history          | loads with a `welcome` entry; the first `history` lists `welcome`, `history`                                                                                                                               | Same                                                             | Same                      |
| Click anywhere focuses                       | after blur, a click on empty page area focuses the input                                                                                                                                                   | Same                                                             | Same                      |
| Layout and scroll                            | wrapper is `flex-direction: column-reverse`, `max-height` = viewport − 2rem, `overflow-y: auto`; after 15 `help`s the input stays in view                                                                  | input after the latest entry, scrolled into view                 | Same (behavior)           |
| `aria-live`                                  | no `aria-live` or `role="log"` in the DOM                                                                                                                                                                  | the entries region is polite live                                | Not in reference          |
| Reduced motion, a hollow cursor when blurred | native caret only (its blink depends on the OS)                                                                                                                                                            | specified                                                        | Not in reference          |
| Narrow-screen input and page overflow        | at 375px a 200-char input scrolls inside the input; the page doesn't scroll sideways                                                                                                                       | Same                                                             | Same                      |
| Mobile virtual keyboard                      | Unknown (headless Chromium has no virtual keyboard)                                                                                                                                                        | specified                                                        | Unknown                   |

## Plan

### Files

```
src/terminal/
  types.ts            CommandDef, Resolution, Entry, TerminalState
  commands.ts         registry: 13 CommandDefs, alphabetical; outputs are stubs until each cmd-* lands
  resolve.ts          parseInput(), resolve()            (pure)
  complete.ts         complete()                         (pure)
  terminalReducer.ts  terminalReducer(), initialState()  (pure)
  Terminal.tsx        "use client"; wires the reducer, input, keyboard, focus, scroll
  Prompt.tsx          `visitor@han3zeng:~$` + `>` line below 768px
  EntryView.tsx       prompt line + output for one entry
  CommandInput.tsx    invisible <input> over a mirror that draws the text + █ cursor
  *.test.ts           Vitest for the pure files
  Terminal.stories.tsx  Storybook interaction tests (with a fake registry)
src/app/page.tsx      renders <Terminal />
src/app/globals.css   cursor blink keyframes (disabled under prefers-reduced-motion)
```

### Types

```ts
type CommandContext = { args: string[]; history: readonly string[] }; // history snapshot at submit

type CommandDef = {
  name: string;
  takesArgs: boolean;
  Output: React.ComponentType<CommandContext>;
  onSubmit?: (ctx: CommandContext) => void; // side effect, called once in submit handler
  clearsScreen?: boolean; // `clear`: reducer empties entries instead of adding one
};

type Resolution =
  | { kind: "empty" }
  | { kind: "not-found" }
  | { kind: "usage"; name: string }
  | { kind: "command"; name: string; args: string[] };

type Entry = {
  id: number;
  input: string;
  resolution: Resolution;
  history: readonly string[];
};

type TerminalState = {
  entries: Entry[];
  history: string[];
  historyIndex: number | null; // null = not navigating
  nextId: number;
};
```

- `resolve(raw, registry): Resolution`. It is pure and has no React.
- `complete(input, names): { value: string; hints: string[] }`. It is pure.
- Reducer actions: `submit(raw, registry)`, `clearScreen`, `historyUp`, `historyDown`, `resetNavigation`. The reducer returns the input value to show after ↑/↓. `historyUp` and `historyDown` return `{ state, value }` through a small helper, or the value is derived from `historyIndex` in the component.
- The `clear` command uses `clearsScreen: true`. The reducer empties the entries and still records `clear` in history (CMD-CLEAR). The `cmd-clear` spec owns any output details beyond this.
- `Terminal` props: `commands?: CommandDef[]` (default: the registry) and `initialInput?: string` (default `"welcome"`). Stories pass a fake registry so that the shell tests don't depend on what the real commands print.
- Side effects: `Terminal`'s submit handler calls `resolve`. If it gets `command` and the def has `onSubmit`, it calls `onSubmit` once, then dispatches `submit`. Components never call `onSubmit`.

### Cursor and the input

- The `<input>` keeps focus, keyboard, IME and a11y. It is visually transparent (`color: transparent; caret-color: transparent`), and it sits on top of a mirror `<span>` with `white-space: pre` that renders `value.slice(0, caret)`, then `█` (or a hollow block when blurred), then `value.slice(caret)`.
- The caret position is tracked from `selectionStart` on `input`, `select`, `keyup` and `click`, and after the Ctrl+A, Ctrl+K and ↑/↓ handlers set it with `setSelectionRange`.
- For a single line that is longer than its box (<768px), `CommandInput` keeps its own horizontal offset: after each change of value or caret it measures the cursor and shifts the mirror just enough to keep the cursor visible, then sets `input.scrollLeft` to the same offset so clicks land on the right character. The browser's own `input.scrollLeft` is not used as the source, because it doesn't update when the value is set from code.

### Responsive

- The breakpoint is a custom variant in `globals.css`: `@custom-variant narrow (@media (width < 768px));` (the same range as Tailwind's `max-md:`, but named after its purpose). Then the prompt line uses `narrow:block`, and the `>` span is `hidden narrow:inline`.

### Test hooks

The stories find elements through these hooks, so the implementation must render them:

- The input: role `textbox`, accessible name `Terminal input`.
- `data-testid="terminal-entries"`: the `aria-live` region that holds the entries.
- `data-testid="terminal-entry"`: one per entry. It contains `prompt`, `narrow-marker` (the `>`), `entry-command` (the raw input) and, when the entry has output, `entry-output`.
- `data-testid="input-line"`: the live prompt and input row. It also contains `prompt` and `narrow-marker`.
- `data-testid="input-mirror"`: the drawn input text. It contains `data-testid="terminal-cursor"`, whose text is `█` and whose `data-state` is `solid` or `hollow`.
- `data-testid="terminal-hints"`: the Tab hints. It is not rendered when there are no hints.

### Dependencies

None new. No lodash; use plain TS.

### Order of work

1. `types.ts`, then `resolve.ts`, `complete.ts` and `terminalReducer.ts`, each with Vitest tests (TC 1–13).
2. `Prompt`, `EntryView`, `CommandInput` and `Terminal`, with stories (TC 14–33).
3. Wire up `page.tsx`. Delete the smoke story once the real stories pass.

## Test cases

Test names start with the ID, e.g. `it("TC-TERMINAL-SHELL-3: ...")`. Stories use a fake registry unless a case names the real one.

### Vitest (pure functions)

- **TC-TERMINAL-SHELL-1** (Vitest) [INPUT-3] Given raw input `"  connect  go   1 "`, when it is parsed, then the name is `connect` and the args are `["go", "1"]`.
- **TC-TERMINAL-SHELL-2** (Vitest) [INPUT-2] Given `""`, `"   "` or `"\t"`, when it is resolved, then the result is `{ kind: "empty" }`.
- **TC-TERMINAL-SHELL-3** (Vitest) [INPUT-3, CMD-NOT-FOUND] Given a registry that has `help`, when `HELP` is resolved, then the result is `not-found`.
- **TC-TERMINAL-SHELL-4** (Vitest) [INPUT-3] Given a registry that has `help`, when `"  help  "` is resolved, then the result is `command help` with no args.
- **TC-TERMINAL-SHELL-5** (Vitest) [INPUT-4] Given `about` with `takesArgs: false`, when `about foo` is resolved, then the result is `{ kind: "usage", name: "about" }`.
- **TC-TERMINAL-SHELL-6** (Vitest) [INPUT-4] Given `themes` with `takesArgs: true`, when `themes set x` is resolved, then the result is `command themes` with args `["set", "x"]`.
- **TC-TERMINAL-SHELL-7** (Vitest) [INPUT-7] Given the real command names, when `hel` is completed, then the value is `help ` and there are no hints.
- **TC-TERMINAL-SHELL-8** (Vitest) [INPUT-7] Given names `["theme", "themes", "help"]`, when `th` is completed, then the value is `theme` and the hints are `["theme", "themes"]`. Given the real names, when `h` is completed, then the value is `h` and the hints are `["help", "history"]`.
- **TC-TERMINAL-SHELL-9** (Vitest) [INPUT-7] Given the real names, when `""`, `xyz` or `connect g` is completed, then the value is unchanged and there are no hints.
- **TC-TERMINAL-SHELL-10** (Vitest) [UI-LAYOUT-2, CMD-HISTORY] Given `initialState()`, then it has one entry with input `welcome` and history `["welcome"]`.
- **TC-TERMINAL-SHELL-11** (Vitest) [INPUT-2, CMD-HISTORY] Given the initial state, when `"  help  "`, then `"   "`, then `nope` are submitted, then there are 4 entries and history is `["welcome", "  help  ", "nope"]`. The history snapshot of the `help` entry is `["welcome", "  help  "]`.
- **TC-TERMINAL-SHELL-12** (Vitest) [INPUT-7] Given history `["welcome", "a", "b"]`: when ↑ is pressed it shows `b`, then `a`, then `welcome`, and another ↑ stays on `welcome`. Then ↓ shows `a`, then `b`, then `""` and ends navigation, and another ↓ does nothing.
- **TC-TERMINAL-SHELL-13** (Vitest) [CMD-CLEAR, INPUT-7] Given 3 entries and history `["welcome", "a", "b"]`, when `clearScreen` is dispatched, then there are no entries and history is unchanged. When `clear` is submitted with the real registry, then there are no entries and history ends with `clear`.

### Storybook interaction tests (components)

- **TC-TERMINAL-SHELL-14** (Storybook) [UI-LAYOUT-2, UI-PROMPT-1] Given the terminal on first render, then the only entry shows `visitor@han3zeng:~$ welcome` followed by the welcome output, and the input is focused and empty.
- **TC-TERMINAL-SHELL-15** (Storybook) [INPUT-1, UI-PROMPT-1] When `about` is typed and Enter is pressed, then a new entry shows `visitor@han3zeng:~$ about` followed by the about output, and the input is empty.
- **TC-TERMINAL-SHELL-16** (Storybook) [INPUT-2] When `"   "` is submitted, then a new entry shows only the prompt line: no output, no error.
- **TC-TERMINAL-SHELL-17** (Storybook) [CMD-NOT-FOUND, INPUT-3] When `HELP` is submitted, the output is `command not found: HELP`. When `foo  bar` is submitted, the output is `command not found: foo  bar`, with both spaces kept.
- **TC-TERMINAL-SHELL-18** (Storybook) [INPUT-4] When `about foo` is submitted, then the output is `Usage: about`. When `clear foo` is submitted, the output is `Usage: clear` and the earlier entries are still there.
- **TC-TERMINAL-SHELL-19** (Storybook) [INPUT-6] Given a fake command `fx` whose `onSubmit` is a spy, when `fx` is submitted, then the spy has been called once. When `help` is submitted, Ctrl+L is pressed, and the story re-renders, then the spy has still been called once. When `fx extra` is resolved as a usage case for a no-arg `fx`, the spy is not called.
- **TC-TERMINAL-SHELL-20** (Storybook) [INPUT-7] Given `a` then `b` were submitted, when ↑ is pressed, then the input is `b` with the caret at the end, and the keydown default was prevented. When ↑, ↓ and ↓ are pressed, the input shows `a`, then `b`, then empty.
- **TC-TERMINAL-SHELL-21** (Storybook) [INPUT-7] When `hel` is typed and Tab is pressed, then the input is `help ` and focus is still on the input. When the input is `h` and Tab is pressed, then `help` and `history` are listed below the input. When `e` is typed, the hints disappear.
- **TC-TERMINAL-SHELL-22** (Storybook) [INPUT-7, CMD-CLEAR] Given 3 entries and `abc` typed, when Ctrl+L is pressed, then no entries remain, the input still shows `abc`, and the keydown default was prevented. When the input is emptied and ↑ is pressed, the input shows the last command submitted before Ctrl+L.
- **TC-TERMINAL-SHELL-23** (Storybook) [INPUT-7, INPUT-8] Given `hello` typed with the caret at the end, when Ctrl+A is pressed, then `selectionStart` is 0, nothing is selected, the █ is drawn before `h`, and the keydown default was prevented.
- **TC-TERMINAL-SHELL-24** (Storybook) [INPUT-7, INPUT-8] Given `hello world` with the caret after `hello`, when Ctrl+K is pressed, then the input is `hello`, the caret stays at 5, and the keydown default was prevented.
- **TC-TERMINAL-SHELL-25** (Storybook) [INPUT-8] Given `abc` with the caret at the end, when ← is pressed twice, then the mirror renders `a`, then `█`, then `bc`.
- **TC-TERMINAL-SHELL-26** (Storybook) [INPUT-8] When the input loses focus, then the cursor is the hollow, non-blinking variant. When it gets focus again, the cursor is solid and blinking.
- **TC-TERMINAL-SHELL-27** (Storybook) [NFR-A11Y-2] Given `prefers-reduced-motion: reduce` is emulated, then the computed `animation-name` of the cursor is `none`.
- **TC-TERMINAL-SHELL-28** (Storybook) [INPUT-7] When Meta+A (Cmd+A) is pressed in the input, then the keydown default is **not** prevented and the input's value is unchanged.
- **TC-TERMINAL-SHELL-29** (Storybook) [INPUT-5] Given the input is blurred, when an output area or empty page space is clicked, then the input has focus. When a link in an output is clicked, its default action is not prevented.
- **TC-TERMINAL-SHELL-30** (Storybook) [NFR-A11Y-1] Then the input is found by `getByRole("textbox", { name: "Terminal input" })`, the entries region has `aria-live="polite"`, and the a11y addon reports no violations.
- **TC-TERMINAL-SHELL-31** (Storybook) [UI-LAYOUT-3] Given a terminal in a short container, when 20 commands are submitted, then the input line is the last item and is scrolled into view: the container's `scrollTop + clientHeight ≈ scrollHeight`.
- **TC-TERMINAL-SHELL-32** (Storybook) [UI-PROMPT-1] Given a viewport of 1024px (and 768px), then the prompt and the input share one row (same `offsetTop`), and no `>` is visible.
- **TC-TERMINAL-SHELL-33** (Storybook) [UI-PROMPT-1, NFR-MOBILE-1] Given a viewport of 375px (and 767px), then the prompt is on its own row, the input row and each past command row start with a visible `>`, and when a 60-character input is typed, `document.documentElement.scrollWidth <= 375` and the █ is still within the input box.

- **TC-TERMINAL-SHELL-34** (Storybook) [INPUT-8] Given the terminal's server HTML (`renderToString`) in the page and its input focused **before** hydration (as `autofocus` does on load), when React hydrates it (`hydrateRoot`), then the cursor's `data-state` is `solid` without any further focus event. When the input is blurred, it becomes `hollow`.
- **TC-TERMINAL-SHELL-35** (Storybook) [INPUT-7] Given `a` then `b` were submitted, when ↑ is pressed (input `b`), `x` is typed (input `bx`) and ↑ is pressed again, then the input is `a`. When ↓ is pressed, the input is `b`. When `x` is typed and Enter is pressed, then ↑ shows `bx` (the newest entry: submitting ended navigation).

### Test-tooling notes

- TC-32 and TC-33 set the viewport with story `globals.viewport` and custom `parameters.viewport.options` (375, 767, 768 and 1024px). `@storybook/addon-vitest` applies them in browser mode by calling `page.viewport()` (see `vitest-plugin/test-utils.js`).
- TC-27 is a proxy: story tests can't emulate media queries, so it walks `document.styleSheets` and checks that a `prefers-reduced-motion: reduce` rule sets `animation: none` on the cursor. This handles `@layer` and CSS nesting, so a Tailwind `motion-reduce:` variant or plain CSS both pass.
- TC-31 wraps the terminal in a 200px-high scrolling container, so either the terminal or its parent can be the element that scrolls.
- Shortcut tests check `fireEvent.keyDown(...) === false` to assert that the default was prevented.
- TC-34 reproduces a hydration timing bug: the server HTML has `autofocus`, so the browser focuses the input before React hydrates, and React never sees a focus event. The story renders the terminal with `renderToString`, focuses the input, then calls `hydrateRoot`, which is what happens on the real page.
