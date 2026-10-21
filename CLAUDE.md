# terminal-portfolio

Han's portfolio: a single-page, terminal-style website. This repo is also a practice ground for AI-driven development, so most work is done by agents.

## Sources of truth

- `docs/product-requirements.md` is the PRD. It overrides the reference site (https://terminal.satnaing.dev/).
- `docs/features/<feature>/spec.md` is the spec for one feature (spec, plan and test cases), written with the `product-exploration` skill. Implement from it.
- `docs/harness-guide.md` tracks which harness pieces are set up and when to add the next one.
- To implement a feature from its spec, use the `implement-feature` skill.
- If the PRD or a spec is ambiguous, ask Han. Never decide product behavior yourself.

## Stack

- Next.js (App Router) with static export (`output: 'export'`), React, TypeScript
- Tailwind CSS v4
- next-themes for theme switching (themes: dark, light, matrix, ubuntu)
- Vitest for unit tests of pure functions
- Playwright Test (`e2e/`) for behavior that only exists in the built site: what the static HTML and inline scripts do before React hydrates
- Storybook for component tests: one story per command output, plus interaction tests (`play`) for terminal behavior such as submitting commands and `clear`
- ESLint + Prettier
- JetBrains Mono via `next/font`
- Deployed to GitHub Pages under `basePath: '/terminal-portfolio'`

## Commands

Package manager: pnpm (never npm or yarn).

- `pnpm dev`: Next.js dev server
- `pnpm build`: static export to `out/`
- `pnpm lint` / `pnpm typecheck` / `pnpm format`
- `pnpm test`: all tests. `pnpm test:unit` for Vitest unit tests (`src/**/*.test.ts(x)` and `scripts/**/*.test.ts`, Node), `pnpm test:storybook` for stories run as tests in headless Chromium
- `pnpm test:e2e`: Playwright tests in `e2e/` against the real static export. `playwright.config.ts` builds the site and serves `out/` under `/terminal-portfolio/`; tests use `page.goto("./")`. One case: `pnpm test:e2e -g "TC-THEMES-16"`
- `pnpm test:unit -t "TC-THEMES-2"`: run one test case by ID
- `pnpm spec:status [feature]`: for each `TC-*` ID in the specs, shows missing, failing or passing. Exits 0 only when all pass. This, not `pnpm test` alone, is the definition of a feature's tests being done.
- `pnpm storybook`: Storybook UI on port 6006

## Next.js docs

@AGENTS.md

## Architecture

- Each command's output is its own React component (`About`, `Help`, …).
- The terminal state is a list of entries (submitted input + parsed command). Each entry renders a prompt line followed by its command component. `clear` empties the list. Never append DOM nodes manually.
- Command parsing and lookup are pure functions with Vitest tests.
- Side effects (`email`, `resume`, `themes set`, `connect go`) fire once at submit time, in the submit handler, never in a component render or effect.

## Stack pitfalls

- Tailwind v4 is configured in CSS (`@import "tailwindcss"`, `@theme`, `@custom-variant`). There is no `tailwind.config.js`.
- Theme colors are CSS variables per `[data-theme="..."]`, mapped to Tailwind tokens with `@theme`. Use semantic names from the PRD (`bg`, `fg`, `primary`, `accent`, …).
- next-themes: `attribute="data-theme"`, `themes={['dark','light','matrix','ubuntu']}`, `enableSystem={false}`. Theme-dependent UI must handle the unmounted state to avoid hydration mismatch.
- GitHub Pages serves the site under `/terminal-portfolio`. Files in `public/` (e.g. `resume.pdf`) must be linked with the base path; `next/link` adds it automatically; plain `<a href>` and string `src` paths do not.
- Static export: no API routes, server actions, middleware, or runtime `next/image` optimization. `next start` does not work; preview with any static server on `out/`.
- ESLint 9 uses flat config (`eslint.config.mjs`). `eslint-config-prettier` must stay the last entry.
- Storybook builds with Vite, not Turbopack: Tailwind is added through `@tailwindcss/vite` in `.storybook/main.ts`, and `next/font` CSS variables set in `layout.tsx` do not exist in stories unless added in `.storybook/preview.tsx`.
- Learn the reference site only from the live page: use it, and inspect what it delivers (DOM, CSS, shipped JS, network). Never read its GitHub repository or source-map sources, and never copy its code or dependencies.

## Visual verification

The Playwright MCP (`.mcp.json`) gives Claude a headless browser for looking at the real page. Tests check behavior; use the browser for what they can't judge: how it looks.

- Start the dev server in the background (`pnpm dev`), then open http://localhost:3000/terminal-portfolio/ (the base path is required).
- Check at 375px and at a desktop width (e.g. 1280px) with `browser_resize`. Once `themes` exists, check all four themes.
- Take screenshots with `browser_take_screenshot`; use `browser_snapshot` (the accessibility tree) to find elements.
- Use it after UI changes, before saying a UI feature is done, and to inspect the reference site (https://terminal.satnaing.dev/).
- Stop the dev server when finished.

## Workflow: TDD

1. Write tests for the spec's test cases. Each test name starts with its ID (`TC-<FEATURE>-<n>: ...`). Do not write implementation yet.
2. Run the tests and confirm they fail for the expected reason (not an import or syntax error).
3. Stop and show Han the tests for review. After approval, Han commits them.
4. Implement the minimum code to make them pass. Never edit or delete an approved test to make it pass; if a test seems wrong, ask.
5. Refactor with tests green. Run lint and typecheck.

## Done means

Lint, typecheck, and all tests pass, and `pnpm spec:status <feature>` is green (every spec test case has a passing test).
