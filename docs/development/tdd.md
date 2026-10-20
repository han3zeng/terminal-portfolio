# TDD in This Project

How test-driven development shapes this repo: the flow, the pieces, the rules, and the results so far.

## Overview

Every feature goes **spec → tests → review → implementation**. The tests are written from the spec before any code, Han approves them, and from then on they are frozen: the agent may change the code until the tests pass, never the tests. That makes the approved tests the contract between Han and the agent.

## The chain from requirement to test

```
PRD requirement      INPUT-7                     docs/product-requirements.md
      ↓
Spec test case       TC-TERMINAL-SHELL-21        docs/features/terminal-shell/spec.md
      ↓
Test name            "TC-TERMINAL-SHELL-21: Tab completes and lists hints…"
      ↓
Result               passing                     pnpm spec:status
```

- PRD IDs (`INPUT-7`, `CMD-HELP`, …) name requirements.
- Each spec test case has an ID `TC-<FEATURE>-<n>` and lists the PRD IDs it covers.
- Each test's name starts with its test case ID. That string match is the only link, so it must be exact.

## The flow

| #   | Step                                                               | Who                          | Tool                               |
| --- | ------------------------------------------------------------------ | ---------------------------- | ---------------------------------- |
| 1   | Write the spec, with Given/When/Then test cases                    | agent, Han answers questions | `product-exploration` skill        |
| 2   | Review the spec                                                    | Han                          |                                    |
| 3   | Write tests and stubs; confirm every ID fails for the right reason | agent                        | `implement-feature` skill, Phase A |
| 4   | Review and commit the tests                                        | Han                          |                                    |
| 5   | Implement until `spec:status` is green                             | agent                        | `implement-feature` skill, Phase B |
| 6   | Refactor; lint, typecheck, build                                   | agent                        |                                    |
| 7   | Review and commit the code                                         | Han                          |                                    |

Steps 3 and 5 were done by hand for the first feature (harness Step 4), then automated in the `implement-feature` skill (harness Step 5).

## Test layers

| Layer                       | What it tests                                                     | Where                           | Runs in           |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------- | ----------------- |
| Vitest unit tests           | Pure functions: parsing, completion, the terminal reducer         | `src/**/*.test.ts`              | Node              |
| Storybook interaction tests | Components: typing, keyboard shortcuts, focus, layout, a11y       | `src/**/*.stories.tsx` (`play`) | headless Chromium |
| Script tests                | `spec:status` itself, against fixture specs and hand-made reports | `scripts/*.test.ts`             | Node              |

Stories use a fake command registry, so shell tests don't break when a command's text changes.

## Checking

| Command            | Question it answers                                      | Source of truth                    |
| ------------------ | -------------------------------------------------------- | ---------------------------------- |
| `pnpm test`        | Do all the tests that exist pass?                        | the test files                     |
| `pnpm spec:status` | Does every spec test case have a test, and does it pass? | the spec IDs plus the test results |

For each ID in a `spec.md`, `spec:status` reports one of three states:

- **missing**: no test name starts with this ID.
- **failing**: a test exists, but it fails (or is skipped).
- **passing**: a test exists, and it passes.

It also lists tests whose ID is in no spec (usually a typo). `spec:status` runs the tests itself, so it doesn't replace `pnpm test`; it adds the comparison with the spec on top. A feature's tests are done when `pnpm spec:status <feature>` exits 0.

## Rules

- Tests first. Before implementing, every ID must be failing, for the expected reason (not an import, syntax or environment error).
- Never edit or delete an approved test to make it pass. If a test seems wrong, stop and ask Han, with evidence.
- Behavior changes go test-first too: change the test, see it fail, then change the code.

## What TDD caught

| When           | What happened                                                                                                                                                  | Caught by    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Implementation | The cursor drifted off screen on long input at 375px: the browser doesn't update an input's scroll position when the value is set from code.                   | TC-33        |
| Implementation | Following any `#` link closes the Vitest browser page. A test-environment issue that looked like a code bug; the test's check was changed with Han's approval. | TC-29        |
| Change request | Breakpoint moved from ≤ 768px to < 768px: the 768px tests were updated first, failed, then the code changed.                                                   | TC-32, TC-33 |

## Results

Update this table when a feature is done. Numbers come from `pnpm spec:status` and `pnpm test`.

| Feature        | PRD IDs covered | Test cases | Tests                     | Status          |
| -------------- | --------------- | ---------- | ------------------------- | --------------- |
| terminal-shell | 15              | 33         | 36 (13 unit + 23 stories) | 33 / 33 passing |

| Totals (Oct 20)      |                                                                       |
| -------------------- | --------------------------------------------------------------------- |
| Features with a spec | 1 of 14                                                               |
| Features done        | 1 of 14                                                               |
| Spec test cases      | 33, all passing                                                       |
| Tests (`pnpm test`)  | 47 passing: 36 for terminal-shell, 9 for `spec:status`, 2 smoke tests |
