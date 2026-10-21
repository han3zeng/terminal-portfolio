# Dev Log

Time spent on the agent-harness workflow for this portfolio, and what happened in each session. Raw material for a blog post about the journey.

How to add an entry: one block per session, newest at the bottom. Hours are your own time (prompting, reviewing, deciding), not the agent's run time. Fill in **Friction** and **Insight** while they are fresh; they are the blog.

## Totals

| Phase                         | Harness step | Hours            |
| ----------------------------- | ------------ | ---------------- |
| Spec, skill and project setup | 0–1          | 8–10             |
| Detailed specs, harness guide | 0–2          | 6                |
| First spec (`terminal-shell`) | 3            | (in the 6)       |
| First feature by hand, TDD    | 4            | 1 + TODO         |
| Automate the loop             | 5            | TODO             |
| **Total so far**              |              | **15–17 + TODO** |

## Sessions

### Until Oct 19 — foundation (8–10 h, across 2 days)

- **Did:** hand-wrote the PRD; defined the `product-exploration` skill (inspired by art craft); refined the spec and created the skill-made spec; initial project setup.
- **Output:** `docs/product-requirements.md`, `.claude/skills/product-exploration/`, the Next.js scaffold (commits `fbb1e7f`, `b07203a`).
- **Friction:** TODO(Han)
- **Insight:** TODO(Han)

### Oct 19 — specs and the harness guide (6 h)

- **Did:** used the skill to create detailed specs; started the TDD harness setup; wrote `docs/harness-guide.md` from the existing spec; followed the guide about halfway (Steps 1–3).
- **Output:** the harness guide (`3e494ab`), Steps 1–2 (`fad15f6`, `a6417a6`), the `terminal-shell` spec with 33 test cases (`aff913a`).
- **Friction:** the PRD was silent on ~9 shell details (Tab behavior, empty input in history, Ctrl+L, cursor when unfocused, narrow-screen prompt…). The skill stopped and asked instead of guessing.
- **Insight:** TODO(Han)

### Oct 19–20 — Step 4: first feature with TDD by hand (1 h review on Oct 20 + TODO)

- **Did:** the agent wrote 34 failing tests and stubs; reviewed and committed the tests (`ea1f1b9`); the agent implemented until all passed (`7f53e63`); changed the prompt breakpoint from ≤ 768px to < 768px, test-first (`6f06b77`).
- **Output:** `src/terminal/`, 38 passing tests.
- **Friction:**
  - TC-29 crashed the test browser: following any `#` link closes Vitest's page. An environment problem, not a code bug, but it looked like one.
  - TC-33 (cursor at 375px) needed a throwaway debug story to find the cause.
  - The agent had to stop and ask before changing an approved test. Slower, but the right call.
- **Insight:** TODO(Han)

### Oct 20 — Step 5: automate the loop (5 hrs)

- **Did:**
  - added `pnpm spec:` and the `implement-feature` skill, built from the Step 4 notes.
  - Completed layout, themes, cmd-welcome and cmd-help
- **Output:** `scripts/spec-status.mjs`, `.claude/skills/implement-feature/SKILL.md`.
- **Friction:**
  - Find out agent peeks the original source code
  - To describe responsive layout in plain English is hard
      - flex-row, flex-reverser
- **Insight:**
  - Need prehook setting to prevent agent from accessing original source code (

### Oct 20 — Step 5: automate the loop (5 hrs)

- **Did:**
  - Review and update all commits messages
  - Update cmd-help
- **Output:**
- **Friction:**
- **Insight:**
  



## Blog threads

Ideas to collect as you go, so the post writes itself:

- **The PRD is the bottleneck, not the code.** Most of the human time went into deciding behavior, not writing code.
- **Asking beats guessing.** The skills are built to stop and ask; count how often that saved a wrong turn.
- **Build the harness from evidence.** Step 5's skill rules came straight from the Step 4 notes, not from guessing up front.
- **Tests as the contract with the agent.** Approved tests are frozen; the agent may only change code.
- **Where the agent struggled:** test-environment quirks, browser-only layout bugs.


## My Note
- The whole process, human should just review the testing
- For rapid development spec becomes an memory record for confirmation if we found something unexpected in component or vitest.
- If we only have limited time, it is hard to review such detail spec, or we need to specify how spec should be written.
  - The specs generate by skill are just too granular
- The agent act on its own to find out the source code



### TO Understand
- pre hook vs. permission on setting rules


