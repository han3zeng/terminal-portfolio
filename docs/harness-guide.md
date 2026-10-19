# Harness Guide

Which piece of the Claude Code harness to set up, and when. Rule of thumb: add a piece only when the work in front of you needs it.

## Steps

### Step 0 — Foundation ✅
- [x] PRD with requirement IDs, all `TODO(Han)` answered — `docs/product-requirements.md`
- [x] `CLAUDE.md` draft: stack, architecture, pitfalls, TDD workflow
- [x] Skill `product-exploration`: writes one `docs/features/<feature>/spec.md` per feature
- [x] Prettier hook in `.claude/settings.json`: formats each file Claude edits. Inactive until Prettier is installed in Step 1.

### Step 1 — Scaffold the project
- [ ] Pick a package manager (npm or pnpm)
- [ ] Next.js (App Router, TypeScript, Tailwind v4, ESLint), static export, `basePath: '/terminal-style-portfolio'`
- [ ] Prettier, Vitest, Storybook with its Vitest addon
- [ ] One passing smoke test in Vitest and one in Storybook, so you know both runners work
- [ ] Fill in the "Commands" section of `CLAUDE.md` with the real scripts
- [ ] Check that the Prettier hook now formats files Claude edits
- [ ] Check whether the installed Next.js ships docs for agents (e.g. an `AGENTS.md` or docs inside `node_modules/next`). If it does, point to them from `CLAUDE.md`.

### Step 2 — Deploy the empty skeleton
Do this early: base-path bugs are easier to find in an empty site.
- [ ] GitHub Actions workflow that builds and deploys to Pages on push to `main`
- [ ] Repo Settings → Pages → Source: GitHub Actions
- [ ] Open https://han3zeng.github.io/terminal-style-portfolio/ and check CSS and fonts load

### Step 3 — First spec
- [ ] Run `/product-exploration terminal-shell`
- [ ] Review `docs/features/terminal-shell/spec.md`, especially the test cases

### Step 4 — First feature with TDD, by hand
Follow the "Workflow: TDD" section in `CLAUDE.md`, prompting each step yourself.
- [ ] Tests written and failing for the right reason
- [ ] You reviewed and committed the tests
- [ ] Implementation passes; lint and typecheck pass
- [ ] Write down where the agent struggled (see "Notes" below). That decides what Step 5 should contain.

### Step 5 — Automate the loop (after the first feature)
- [ ] `spec:status` script: for each `TC-*` ID in the specs, shows **missing**, **failing** or **passing** (from Vitest's JSON report)
- [ ] Skill `implement-feature <feature>`: write tests → stop for review → implement until `spec:status` is green, max ~5 rounds without progress → check `git diff` on test files is empty

### Step 6 — Visual verification (before `layout` and `themes`)
- [ ] Playwright MCP in `.mcp.json`. Claude can open the dev server, take screenshots, and check the four themes and the 375px layout. The `product-exploration` skill also uses it to see the rendered reference site.

### Step 7 — Reduce permission prompts (after a few sessions)
- [ ] Run `/fewer-permission-prompts`

## Feature tracker

| Feature | Spec | Tests approved | Done |
| --- | --- | --- | --- |
| terminal-shell | [ ] | [ ] | [ ] |
| layout | [ ] | [ ] | [ ] |
| themes | [ ] | [ ] | [ ] |
| cmd-welcome | [ ] | [ ] | [ ] |
| cmd-help | [ ] | [ ] | [ ] |
| cmd-about | [ ] | [ ] | [ ] |
| cmd-education | [ ] | [ ] | [ ] |
| cmd-projects | [ ] | [ ] | [ ] |
| cmd-connect | [ ] | [ ] | [ ] |
| cmd-email | [ ] | [ ] | [ ] |
| cmd-resume | [ ] | [ ] | [ ] |
| cmd-history | [ ] | [ ] | [ ] |
| cmd-clear | [ ] | [ ] | [ ] |
| cmd-pwd, cmd-whoami | [ ] | [ ] | [ ] |

Small commands (`pwd`, `whoami`, `about`, `education`) can share one spec, or skip the skill and implement straight from the PRD.

## Not set up on purpose

| Piece | Why not now | Add it when |
| --- | --- | --- |
| Subagents | One feature at a time doesn't need them, and a subagent can't stop to ask you questions. | You want several features specced or built in parallel. |
| Docs MCP (e.g. Context7) | `CLAUDE.md` pitfalls plus version-matched docs from `node_modules` should be enough. | Claude keeps using outdated APIs (e.g. Tailwind v3 config, old Next.js patterns). |
| Hard copies of library docs | They go stale and waste context. | Never. |
| `.claude/rules/` | `CLAUDE.md` is still short. | `CLAUDE.md` passes ~150 lines, or some rules apply only to certain folders. |
| Hook that blocks stopping while tests fail | It would block the deliberate stop in TDD step 3, and it pushes the agent to edit tests. | Claude often says "done" with failing tests, even with the Step 5 skill. |
| Lint/typecheck hook | The TDD workflow already runs them at the end. | Claude often finishes with lint or type errors. |

## Notes
Write down what went wrong or felt repetitive while working. That is the evidence for the next harness change.

-
