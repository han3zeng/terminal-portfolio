---
name: product-exploration
description: Explore the reference product, analyze the PRD, and generate implementation-ready specifications under docs/features/.
---

# Product Exploration Workflow

## Phase 1: Understand requirements

Read:
- docs/product-requirements.md (the PRD, highest priority)
- CLAUDE.md (stack and architecture)
- Existing specs under docs/features/

Extract functional and non-functional requirements, keeping their PRD IDs (e.g. CMD-HELP, INPUT-6).
Every `TODO(Han)` item is an open question. Never pick an answer for it.

## Phase 2: Explore the reference product

Reference product: https://terminal.satnaing.dev/

The site is client-rendered, so WebFetch returns only the page title. Use:
- Source code: clone https://github.com/satnaing/terminal-portfolio into a temp directory and read `src/`.
- Rendered behavior: use the Playwright MCP browser tools if available. Otherwise mark rendered-only behavior as Unknown.

Inspect:
- UI and interactions (input, keyboard shortcuts, autocomplete, history)
- Command outputs and argument handling
- Responsive behavior
- Accessibility behavior

The reference uses Vite, styled-components, and lodash. Study its behavior, not its architecture.
Record evidence (file path + line, or what was observed in the browser) for each behavior.

## Phase 3: Gap analysis

For each PRD requirement, compare with the reference and classify:
- Same as reference
- Differs from reference (the PRD wins)
- Not in reference
- Unknown

Do not confuse missing evidence with missing functionality.

## Phase 4: Plan implementation

Follow the architecture in CLAUDE.md. Identify:
- Components to create or update
- Props and TypeScript interfaces
- State management
- Dependencies
- File locations
- Implementation order

## Phase 5: Define acceptance criteria

Write testable conditions using Given/When/Then. Include:
- Happy paths
- Edge cases (invalid args, empty input)
- Accessibility
- Responsive behavior (≤ 768px and > 768px)

For each criterion, name the test layer: Vitest (pure functions) or Storybook interaction test (components).

## Phase 6: Write documentation

One folder per feature: `docs/features/<feature-slug>/`.
A feature is one command (e.g. `cmd-help`), or one cross-cutting area: `terminal-shell` (input, prompt, history, keyboard), `themes`, `layout`.

Each folder contains:
- specification.md
- implementation-plan.md
- test-cases.md

Cross-reference PRD requirement IDs in all three files.
List unresolved `TODO(Han)` items under an "Open questions" heading in specification.md.

Do not implement source code.
