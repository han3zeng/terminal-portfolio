# Harness Guide

Which piece of the Claude Code harness to set up, and when. Rule of thumb: add a piece only when the work in front of you needs it.

## Steps

### Step 0 — Foundation ✅

- [x] PRD with requirement IDs, all `TODO(Han)` answered — `docs/product-requirements.md`
- [x] `CLAUDE.md` draft: stack, architecture, pitfalls, TDD workflow
- [x] Skill `product-exploration`: writes one `docs/features/<feature>/spec.md` per feature
- [x] Prettier hook in `.claude/settings.json`: formats each file Claude edits. Inactive until Prettier is installed in Step 1.

### Step 1 — Scaffold the project ✅

- [x] Pick a package manager: pnpm
- [x] Next.js (App Router, TypeScript, Tailwind v4, ESLint), static export, `basePath: '/terminal-portfolio'`
- [x] Prettier, Vitest, Storybook with its Vitest addon
- [x] One passing smoke test in Vitest and one in Storybook, so you know both runners work
- [x] Fill in the "Commands" section of `CLAUDE.md` with the real scripts
- [x] Check that the Prettier hook now formats files Claude edits
- [x] Check whether the installed Next.js ships docs for agents (e.g. an `AGENTS.md` or docs inside `node_modules/next`). If it does, point to them from `CLAUDE.md`. (Yes: `AGENTS.md`, imported into `CLAUDE.md`.)

### Step 2 — Deploy the empty skeleton

Do this early: base-path bugs are easier to find in an empty site.

- [x] GitHub Actions workflow that builds and deploys to Pages on push to `main` — `.github/workflows/deploy.yml`
- [x] Repo Settings → Pages → Source: GitHub Actions
- [x] Open https://han3zeng.github.io/terminal-portfolio/ and check CSS and fonts load

### Step 3 — First spec

- [x] Run `/product-exploration terminal-shell`
- [x] Review `docs/features/terminal-shell/spec.md`, especially the test cases

### Step 4 — First feature with TDD, by hand

Follow the "Workflow: TDD" section in `CLAUDE.md`, prompting each step yourself.

- [x] Tests written and failing for the right reason
- [x] You reviewed and committed the tests
- [x] Implementation passes; lint and typecheck pass
- [x] Write down where the agent struggled (see "Notes" below). That decides what Step 5 should contain.

### Step 5 — Automate the loop (after the first feature)

- [x] `spec:status` script: for each `TC-*` ID in the specs, shows **missing**, **failing** or **passing** (from Vitest's JSON report)
- [x] Skill `implement-feature <feature>`: write tests → stop for review → implement until `spec:status` is green, max ~5 rounds without progress → check `git diff` on test files is empty

### Step 6 — Visual verification (before `layout` and `themes`) ✅

- [x] Playwright MCP in `.mcp.json`. Claude can open the dev server, take screenshots, and check the four themes and the 375px layout. The `product-exploration` skill uses it as the only way to study the reference site: the live page, not its GitHub repo.
- [x] Re-verify the "Reference vs PRD" table in `docs/features/terminal-shell/spec.md` in the browser, replacing its source-code citations with observations.

### Step 7 — Reduce permission prompts (after a few sessions) ✅

- [x] Run `/fewer-permission-prompts`: 15 read-only rules in `.claude/settings.json` (`pnpm lint`/`typecheck`/`test`/`spec:status`, `prettier --check`, the Playwright navigate/resize/screenshot/snapshot/close tools). Re-run after more sessions.
- [x] Re-ran 2026-10-22: +5 rules (`pnpm test:unit`, `pnpm test:storybook`, each with and without args; `pnpm prettier --check *`). Most other frequent commands were already allowed or auto-allowed.

## Feature tracker

| Feature             | Spec | Tests approved | Done |
| ------------------- | ---- | -------------- | ---- |
| terminal-shell      | [x]  | [x]            | [x]  |
| layout              | [x]  | [x]            | [x]  |
| themes              | [x]  | [x]            | [x]  |
| cmd-welcome         | [x]  | [x]            | [x]  |
| cmd-help            | [x]  | [x]            | [x]  |
| cmd-about           | [x]  | [ ]            | [ ]  |
| cmd-education       | [x]  | [ ]            | [ ]  |
| cmd-projects        | [x]  | [ ]            | [ ]  |
| cmd-connect         | [ ]  | [ ]            | [ ]  |
| cmd-email           | [ ]  | [ ]            | [ ]  |
| cmd-resume          | [ ]  | [ ]            | [ ]  |
| cmd-history         | [x]  | [ ]            | [ ]  |
| cmd-clear           | [x]  | [x]            | [x]  |
| cmd-pwd, cmd-whoami | [x]  | [x]            | [x]  |

Small commands (`pwd`, `whoami`, `about`, `education`) can share one spec, or skip the skill and implement straight from the PRD.

## Not set up on purpose

| Piece                                      | Why not now                                                                              | Add it when                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Subagents                                  | One feature at a time doesn't need them, and a subagent can't stop to ask you questions. | You want several features specced or built in parallel.                           |
| Docs MCP (e.g. Context7)                   | `CLAUDE.md` pitfalls plus version-matched docs from `node_modules` should be enough.     | Claude keeps using outdated APIs (e.g. Tailwind v3 config, old Next.js patterns). |
| Hard copies of library docs                | They go stale and waste context.                                                         | Never.                                                                            |
| `.claude/rules/`                           | `CLAUDE.md` is still short.                                                              | `CLAUDE.md` passes ~150 lines, or some rules apply only to certain folders.       |
| Hook that blocks stopping while tests fail | It would block the deliberate stop in TDD step 3, and it pushes the agent to edit tests. | Claude often says "done" with failing tests, even with the Step 5 skill.          |
| Lint/typecheck hook                        | The TDD workflow already runs them at the end.                                           | Claude often finishes with lint or type errors.                                   |

## Notes

- Write down what went wrong or felt repetitive while working. That is the evidence for the next harness change.
- The tests relied on test-environment behavior nobody had checked first: following a link closed the browser (TC-29), and the screen-size and reduced-motion workarounds were unverified. Skill idea: run the new tests once early, to tell environment problems apart from real failures.
- Browser-only bugs (the TC-33 cursor) needed a throwaway debug story to diagnose. Skill idea: allow temporary debug stories, but they must be deleted. Step 6 (Playwright) will help further.
- I had to stop and ask before changing an approved test. That worked. Skill idea: keep it as a hard rule. Any change to a test file means stop and ask.
- Step 6: checking the reference in the browser found three things the source-code reading got wrong or missed: whitespace-only input prints `command not found:` (not an empty entry), typing doesn't end ↑/↓ navigation, and side effects visibly fire once. Lesson: the live page is better evidence than the source. Playwright writes its files to `.playwright-mcp/`, now gitignored. If a dev server is already running on port 3000, use it; a second `pnpm dev` fails.
- E2e is for what only the built site can show (the base path, files in `public/`, reloads, behavior before hydration). Browser built-ins such as `target="_blank"` are checked through attributes, not clicks. Decided 2026-10-22 while reviewing cmd-projects TC-4; first real use: `resume`. If `email` or `connect` need e2e for something else, turn this into a skill rule.
