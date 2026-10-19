# terminal-style-portfolio

Han's portfolio: a single-page, terminal-style website. This repo is also a practice ground for AI-driven development, so most work is done by agents.

## Sources of truth
- `docs/product-requirements.md` is the PRD. It overrides the reference site (https://terminal.satnaing.dev/).
- `docs/features/<feature>/` holds implementation specs generated from the PRD. Implement from these.
- Never resolve a `TODO(Han)` item yourself. Ask.

## Stack
- Next.js (App Router) with static export (`output: 'export'`), React, TypeScript
- Tailwind CSS v4
- next-themes for theme switching (themes: dark, light, matrix, ubuntu)
- Vitest for unit tests of pure functions
- Storybook for component tests: one story per command output, plus interaction tests (`play`) for terminal behavior such as submitting commands and `clear`
- ESLint + Prettier

## Commands
TODO: fill in after scaffolding (package manager, dev, build, lint, typecheck, test, storybook).

## Architecture
- Each command's output is its own React component (`About`, `Help`, …).
- The terminal state is a list of entries (submitted input + parsed command). Each entry renders a prompt line followed by its command component. `clear` empties the list. Never append DOM nodes manually.
- Command parsing and lookup are pure functions with Vitest tests.
- Side effects (`email`, `resume`, `themes set`) fire once at submit time, in the submit handler, never in a component render or effect.

## Stack pitfalls
- Tailwind v4 is configured in CSS (`@import "tailwindcss"`, `@theme`, `@custom-variant`). There is no `tailwind.config.js`.
- Theme colors are CSS variables per `[data-theme="..."]`, mapped to Tailwind tokens with `@theme`. Use semantic names from the PRD (`bg`, `fg`, `primary`, `accent`, …).
- next-themes: `attribute="data-theme"`, `themes={['dark','light','matrix','ubuntu']}`, `enableSystem={false}`. Theme-dependent UI must handle the unmounted state to avoid hydration mismatch.
- Static export: no API routes, server actions, middleware, or runtime `next/image` optimization.
- ESLint 9 uses flat config (`eslint.config.mjs`).
- The reference site uses Vite, styled-components, and lodash. Copy its behavior, not its code or dependencies.

## Done means
Lint, typecheck, and all tests pass, and the change matches its spec's acceptance criteria.
