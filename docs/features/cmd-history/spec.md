# cmd-history

PRD: CMD-HISTORY, CMD-CLEAR (history survives `clear`), INPUT-2 (empty input not recorded), INPUT-3 (history shows input exactly as typed), INPUT-4 (`history` takes no arguments), INPUT-7 (Ctrl+L is not recorded), UI-LAYOUT-2 (the automatic `welcome`).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800). Screenshot: `../cmd-projects/reference/ref-about-education-projects-history-1280.png`.

## Scope

In scope: the `history` command's output component.

Out of scope: how history is recorded. terminal-shell already records every non-empty submitted input, exactly as typed, into `state.history`, and passes each entry a snapshot of it (`CommandContext.history`, which includes the submitted command itself). This feature only prints that snapshot.

## Spec

### Output (CMD-HISTORY)

One line per recorded input, oldest first, ending with the `history` command itself. On a fresh page, `history` prints:

```
welcome
history
```

- Every recorded input is listed, whatever it resolved to: commands, `command not found` inputs (`foo`), and usage errors (`about x`). Duplicates are kept (`pwd`, `pwd` → two lines).
- Each line is the input exactly as typed, including inner, leading and trailing spaces (INPUT-3); spaces are not collapsed (`white-space: pre-wrap`).
- Empty and whitespace-only inputs are not listed (INPUT-2). Ctrl+L is not listed (INPUT-7).
- `clear` does not erase history (CMD-CLEAR): `history` after `clear` still lists everything before it, `clear` included.
- The output is a snapshot: an earlier `history` output does not change when later commands are submitted.
- `history x` prints `Usage: history` (terminal-shell); it is recorded, so the next `history` lists `history x`.
- All lines are `fg`.
- At 375px a long input wraps (`break-all`, like the past-command line). There's no horizontal page scroll (NFR-MOBILE-1).

### Reference vs PRD

Observed at 1280px. Input sequence: (auto `welcome`), `about`, `education`, `projects`, `about x`, `foo`, `   `, `  pwd  `, `pwd`, `history`.

| Behavior                 | Reference (observed)                                                             | This spec                         | Class         |
| ------------------------ | -------------------------------------------------------------------------------- | --------------------------------- | ------------- |
| Order, first entry       | `welcome`, `about`, … `history`: oldest first, auto `welcome` first, itself last | Same                              | Same          |
| Not-found / usage inputs | `foo` and `about x` listed                                                       | Same                              | Same          |
| Whitespace-only input    | `   ` not listed                                                                 | Same (INPUT-2)                    | Same          |
| Leading/trailing spaces  | `  pwd  ` listed as `pwd` (trimmed)                                              | listed as typed, `  pwd  `        | Differs (PRD) |
| Duplicates               | `pwd`, `pwd` → two lines                                                         | Same                              | Same          |
| After `clear`            | `clear` then `history` → only `history`: clear erased history                    | everything before is still listed | Differs (PRD) |

### Edge cases

- A very long input (e.g. 200 characters with no spaces) wraps inside the terminal at 375px.
- Themes: only the color changes.

## Plan

### Files

```
src/commands/history/
  History.tsx           the Output component: renders props.history
  History.stories.tsx   Storybook interaction tests (real Terminal)
src/terminal/commands.ts   history: { Output: History }
```

No Vitest file: the component is a direct map over `props.history`, and recording is terminal-shell's (already unit-tested in `terminalReducer.test.ts`).

### Rendering

A list, one item per input:

```
<ul data-testid="history" class="list-none whitespace-pre-wrap break-all">
  <li>welcome</li>
  <li>  pwd  </li>
  <li>history</li>
</ul>
```

Keys are the index (inputs repeat).

### Test hooks

`history` (the output root).

### Dependencies

None.

### Order of work

1. `History.tsx` and the registry entry (all TCs).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-HISTORY-1: ...")`. Each story checks the list items' `textContent`, so leading and trailing spaces count.

- **TC-CMD-HISTORY-1** (Storybook) [CMD-HISTORY, UI-LAYOUT-2] Given a fresh page, when `history` is submitted, then the `history` output is a list with exactly two items: `welcome`, `history`; each is `fg` (`rgb(211, 233, 230)`) in the dark theme.
- **TC-CMD-HISTORY-2** (Storybook) [CMD-HISTORY, INPUT-2, INPUT-3] Given a fresh page, when `about`, `foo`, `about x`, `   ` (spaces only), `  pwd  `, `pwd`, `pwd`, `history` are submitted, then the items are exactly `welcome`, `about`, `foo`, `about x`, `  pwd  `, `pwd`, `pwd`, `history`.
- **TC-CMD-HISTORY-3** (Storybook) [CMD-HISTORY, CMD-CLEAR, INPUT-7] Given a fresh page, when `pwd` and `clear` are submitted, Ctrl+L is pressed, and `history` is submitted, then the items are exactly `welcome`, `pwd`, `clear`, `history`.
- **TC-CMD-HISTORY-4** (Storybook) [CMD-HISTORY] Given a fresh page, when `history`, `pwd`, `history` are submitted, then the first `history` output still has exactly two items (`welcome`, `history`) and the second has four (`welcome`, `history`, `pwd`, `history`).
- **TC-CMD-HISTORY-5** (Storybook) [CMD-HISTORY, NFR-MOBILE-1] Given 375px, when a 200-character input with no spaces (`x` repeated) and then `history` are submitted, then the `history` output contains that input in full, `document.documentElement.scrollWidth <= window.innerWidth`, and the a11y addon reports no violations.
