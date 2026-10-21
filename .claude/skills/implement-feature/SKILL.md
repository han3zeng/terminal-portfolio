---
name: implement-feature
description: Implement one feature from its spec with TDD - write tests for every TC ID, stop for Han's review, then implement until `pnpm spec:status <feature>` is green. Use after product-exploration has written docs/features/<feature>/spec.md.
argument-hint: <feature-slug>
---

# Implement Feature (TDD)

Target feature: `$ARGUMENTS`.

If no feature was given, run `pnpm spec:status` and list the features that have a spec but are not all passing, then ask Han which one to do.

The spec is `docs/features/<feature>/spec.md`. Follow CLAUDE.md, especially "Architecture", "Stack pitfalls" and "Workflow: TDD". The skill has two phases separated by a hard stop.

## Phase A: Tests

1. **Read** the spec (all of it, including "Test hooks" if present), the PRD IDs it covers, and existing code it builds on (e.g. `src/terminal/`). If the spec is ambiguous, ask Han before writing tests. Never decide product behavior yourself.
2. **Check the test environment first** (lesson from terminal-shell, TC-29). Before writing many tests that rely on something the test runner might not support (navigation, viewport, media emulation, clipboard, timers, new browser APIs), write one throwaway probe story or test, run it, then delete it. Record the result in the spec's test-tooling notes.
3. **Write the tests.** One test (or story) per TC ID; several variants may share an ID (e.g. two viewports). Each test name starts with `TC-<FEATURE>-<n>: `. Unit tests use Vitest (`*.test.ts`, pure functions); component behavior uses Storybook stories with `play`. Behavior of the built site (static HTML, inline scripts before hydration, real page loads) uses Playwright Test in `e2e/*.spec.ts`; `playwright.config.ts` already builds and serves the export, so never write your own build or server code in a test. Prefer roles and accessible names; use `data-testid` only for elements without one, and add every hook to the spec's "Test hooks" section.
4. **Add stubs**, not implementation: exported types and signatures that throw `not implemented` or render nothing, so tests fail on assertions, not imports.
5. **Run** `pnpm spec:status <feature>`. Every ID must be **failing** (none missing, none passing). Look at the actual failure messages: each must be "not implemented" or a missing element, never an import, syntax, or environment error. Also run `pnpm lint` and `pnpm typecheck`.
6. **STOP.** Report to Han: the test files, the `spec:status` output, any new test hooks or tooling notes, anything uncertain. Do not implement. Han reviews and commits the tests.

## Phase B: Implementation

Start only after Han says the tests are approved and committed. Record the commit: `git log -1 --format=%h`.

1. **Implement** following the spec's Plan. Replace the stubs.
2. **Loop:** run `pnpm spec:status <feature>`, fix, repeat.
   - Count a round as **progress** if the number of passing IDs went up.
   - After **5 rounds in a row without progress**, stop and report to Han: which IDs still fail, the error, what you tried, your best guess at the cause.
   - To diagnose a browser-only failure, a temporary debug story is fine (`src/**/Debug.stories.tsx`). Delete it before you finish.
3. **Never change an approved test file to make it pass.** If a test seems wrong, or the environment breaks it, stop and ask Han, with evidence (e.g. a minimal reproduction). Only change it after Han agrees.
4. **Refactor** with everything green.
5. **Finish checks**, all required:
   - `pnpm spec:status <feature>` exits 0.
   - `pnpm test`, `pnpm lint`, `pnpm typecheck` pass. `pnpm build` succeeds.
   - `git diff --stat <approved-commit> -- '*.test.ts' '*.test.tsx' '*.stories.tsx'` shows only changes Han approved. If anything else changed, revert it or ask.
   - No `Debug.stories.tsx` or other probe files left.
   - If the implementation differs from the spec's Plan, update the Plan.
   - If the feature changes the UI: look at it in the browser ("Visual verification" in CLAUDE.md) at 375px and desktop width, and fix anything that looks wrong. Mention what you checked in the report.
6. **Report** to Han: files changed, the final `spec:status` summary, what was hard (for the "Notes" section of `docs/harness-guide.md` and `docs/development/log.md`), and anything not covered by tests (e.g. needs a visual check). Update the feature tracker in `docs/harness-guide.md`. Do not commit; Han commits.
