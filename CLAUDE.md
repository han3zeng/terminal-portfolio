# terminal-style-portfolio

Han's portfolio: a single-page, terminal-style website. This repo is also a practice ground for AI-driven development, so most work is done by agents.

## Sources of truth
- `docs/product-requirements.md` is the PRD. It overrides the reference site (https://terminal.satnaing.dev/).
- `docs/features/<feature>/spec.md` is the spec for one feature (spec, plan and test cases), written with the `product-exploration` skill. Implement from it.
- `docs/harness-guide.md` tracks which harness pieces are set up and when to add the next one.
- If the PRD or a spec is ambiguous, ask Han. Never decide product behavior yourself.

## Stack
- Next.js (App Router) with static export (`output: 'export'`), React, TypeScript
- Tailwind CSS v4
- next-themes for theme switching (themes: dark, light, matrix, ubuntu)
- Vitest for unit tests of pure functions
- Storybook for component tests: one story per command output, plus interaction tests (`play`) for terminal behavior such as submitting commands and `clear`
- ESLint + Prettier
- JetBrains Mono via `next/font`
- Deployed to GitHub Pages under `basePath: '/terminal-style-portfolio'`

## Commands
TODO: fill in after scaffolding (package manager, dev, build, lint, typecheck, test, storybook).

## Architecture
- Each command's output is its own React component (`About`, `Help`, …).
- The terminal state is a list of entries (submitted input + parsed command). Each entry renders a prompt line followed by its command component. `clear` empties the list. Never append DOM nodes manually.
- Command parsing and lookup are pure functions with Vitest tests.
- Side effects (`email`, `resume`, `themes set`, `connect go`) fire once at submit time, in the submit handler, never in a component render or effect.

## Stack pitfalls
- Tailwind v4 is configured in CSS (`@import "tailwindcss"`, `@theme`, `@custom-variant`). There is no `tailwind.config.js`.
- Theme colors are CSS variables per `[data-theme="..."]`, mapped to Tailwind tokens with `@theme`. Use semantic names from the PRD (`bg`, `fg`, `primary`, `accent`, …).
- next-themes: `attribute="data-theme"`, `themes={['dark','light','matrix','ubuntu']}`, `enableSystem={false}`. Theme-dependent UI must handle the unmounted state to avoid hydration mismatch.
- GitHub Pages serves the site under `/terminal-style-portfolio`. Files in `public/` (e.g. `resume.pdf`) must be linked with the base path; `next/link` adds it automatically; plain `<a href>` and string `src` paths do not.
- Static export: no API routes, server actions, middleware, or runtime `next/image` optimization.
- ESLint 9 uses flat config (`eslint.config.mjs`).
- The reference site uses Vite, styled-components, and lodash. Copy its behavior, not its code or dependencies.

## Workflow: TDD
1. Write tests for the spec's test cases. Each test name starts with its ID (`TC-<FEATURE>-<n>: ...`). Do not write implementation yet.
2. Run the tests and confirm they fail for the expected reason (not an import or syntax error).
3. Stop and show Han the tests for review. After approval, Han commits them.
4. Implement the minimum code to make them pass. Never edit or delete an approved test to make it pass; if a test seems wrong, ask.
5. Refactor with tests green. Run lint and typecheck.

## Done means
Lint, typecheck, and all tests pass, and the change covers its spec's test cases.
