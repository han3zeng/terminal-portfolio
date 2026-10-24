# cmd-email

PRD: CMD-EMAIL, INPUT-4 (`email` takes no arguments), INPUT-6 (the mail client opens once, at submit).

Reference studied: the live site https://terminal.satnaing.dev/ (2026-10-22, Playwright MCP, headless Chromium at 1280×800 and 375×800). Screenshots: `reference/ref-email-1280.png`, `reference/ref-email-375.png`.

## Scope

In scope: the `email` command's output (text, the address link) and its side effect (opening the visitor's mail client).

Out of scope: argument handling (`email foo` → `Usage: email`), matching, Tab completion and history (terminal-shell, done).

## Spec

### Output (CMD-EMAIL)

The PRD block, character for character (no trailing spaces):

```
My favorite quote from the show How I Met Your Mother
Barney: "Ted, say 'I'm' your best friend."

Well, hey, you! Be my best friend!
Shoot me an email, let's chat: hanyutseng.hyt@gmail.com
```

- Every line is `fg`, except the address.
- **The address is a link** (Han, 2026-10-22): an `<a>` whose text is `hanyutseng.hyt@gmail.com` and `href` is `mailto:hanyutseng.hyt@gmail.com`, `accent`, underlined. It has no `target` (a `mailto:` link opens the mail client, not a page). It is the fallback when the automatic navigation does nothing (no mail client set up); the address stays selectable so it can be copied.
- The blank line is a full-height empty row (non-breaking space), as in `help`.
- Running `email` again prints the same output again (and opens the mail client again: one side effect per submit).
- At 375px the lines wrap at word boundaries; the address never overflows. It wraps as a whole word when it does not fit (`overflow-wrap: break-word`, not `break-all`, which split it as `hany` / `utseng` at 375px). No horizontal page scroll (NFR-MOBILE-1).

### Side effect (CMD-EMAIL, INPUT-6)

- On submit, the page navigates to `mailto:hanyutseng.hyt@gmail.com` with `window.location.href = …` (PRD). Called once from the command's `onSubmit`; rendering, re-rendering, Ctrl+L and later submits never navigate again.
- `email foo` prints `Usage: email` and does not navigate (terminal-shell resolves it as usage, so `onSubmit` is never called).
- If no mail client is set up, the browser does nothing; no error is printed.

### Reference vs PRD

| Behavior    | Reference (observed)                                                                                         | This spec                                             | Class               |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------- |
| Output      | 1280px: just the address, `contact@satnaing.dev`, as plain text (`ref-email-1280.png`); no `<a>` on the page | the PRD's quote, then the address as a `mailto:` link | Differs (PRD + Han) |
| Side effect | `window.open` stubbed: called once with `("mailto:contact@satnaing.dev", "_self")`                           | `window.location.href = "mailto:…"`                   | Same (API: PRD)     |
| `email foo` | `Usage: email`, no navigation                                                                                | Same                                                  | Same                |

### Edge cases

- Themes: the link follows `accent`; the rest follows `fg`.

## Plan

### Files

```
src/commands/email/
  email.ts              EMAIL_ADDRESS, MAILTO, EMAIL_QUOTE, EMAIL_INVITE, EMAIL_LEAD (the last line before the address), emailText()
  EmailOutput.tsx       the Output component (not Email.tsx: on macOS's case-insensitive file system, `./Email` would resolve to `email.ts`)
  email.test.ts         Vitest
  Email.stories.tsx     Storybook interaction tests (real Terminal)
src/terminal/types.ts      CommandEffects gains navigate
src/terminal/Terminal.tsx  default navigate
src/terminal/commands.ts   email: { Output: EmailOutput, onSubmit }
```

### Types

```ts
export const EMAIL_ADDRESS = "hanyutseng.hyt@gmail.com";
export const MAILTO = `mailto:${EMAIL_ADDRESS}`;
export function emailText(): string; // the PRD text, lines joined by "\n"

// src/terminal/types.ts
export type CommandEffects = {
  setTheme: (theme: string) => void;
  openUrl: (url: string) => void;
  navigate: (url: string) => void;
};
```

- Default `navigate = (url) => { window.location.href = url; }`.
- `onSubmit: (_ctx, { navigate }) => navigate(MAILTO)`.

### Rendering

```
<div data-testid="email" class="whitespace-pre-wrap">
  <div>My favorite quote from the show How I Met Your Mother</div>
  <div>Barney: "Ted, say 'I'm' your best friend."</div>
  <div>&nbsp;</div>
  <div>Well, hey, you! Be my best friend!</div>
  <div>Shoot me an email, let's chat: <a href="mailto:…" class="text-accent underline wrap-break-word">hanyutseng.hyt@gmail.com</a></div>
</div>
```

### Test hooks

`email` (the output root).

### Dependencies

None.

### Order of work

1. `email.ts` with TC-1.
2. `navigate` in `CommandEffects` and `Terminal`.
3. `EmailOutput.tsx` and the registry entry (TC 2–5).

## Test cases

Test names start with the ID, e.g. `it("TC-CMD-EMAIL-1: ...")`.

- **TC-CMD-EMAIL-1** (Vitest) [CMD-EMAIL] Then `emailText()` equals the code block under `### email — CMD-EMAIL` in `docs/product-requirements.md`, character for character.
- **TC-CMD-EMAIL-2** (Storybook) [CMD-EMAIL] Given an `effects.navigate` spy, when `email` is submitted twice, then there are two `email` outputs, and each output's `innerText`, with trailing whitespace trimmed per line, equals the PRD block.
- **TC-CMD-EMAIL-3** (Storybook) [CMD-EMAIL] Given the dark theme and an `effects.navigate` spy, when `email` is submitted, then the output has exactly one link (`role="link"`), named `hanyutseng.hyt@gmail.com`, with `href` `mailto:hanyutseng.hyt@gmail.com` and no `target`; it is `accent` (`rgb(84, 220, 192)`) and underlined. The line `Well, hey, you! Be my best friend!` is `fg` (`rgb(211, 233, 230)`).
- **TC-CMD-EMAIL-4** (Storybook) [CMD-EMAIL, INPUT-6, INPUT-4] Given an `effects.navigate` spy, when `email` is submitted, then the spy was called once with `mailto:hanyutseng.hyt@gmail.com`. When `pwd` is submitted, Ctrl+L is pressed and `help` is submitted, then it has still been called once. When `email foo` is submitted, then the output is `Usage: email` and the spy has still been called once.
- **TC-CMD-EMAIL-5** (Storybook) [CMD-EMAIL, NFR-MOBILE-1] Given 375px and an `effects.navigate` spy, when `email` is submitted, then `document.documentElement.scrollWidth <= window.innerWidth` and the a11y addon reports no violations.

### Test-tooling notes

- Every story passes an `effects.navigate` spy: the real default would navigate the Storybook iframe to `mailto:`.
