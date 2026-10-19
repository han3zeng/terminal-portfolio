---
name: product-exploration
description: Explore the reference product, analyze the PRD, and write one implementation-ready spec for a feature under docs/features/. Use when starting a new feature.
argument-hint: <feature-slug>
---

# Product Exploration Workflow

Target feature: `$ARGUMENTS`.
If no feature was given, list the features from Phase 6 that have no spec yet and ask Han which one to do.

## Phase 1: Understand requirements

Read:
- docs/product-requirements.md (the PRD, highest priority)
- CLAUDE.md (stack and architecture)
- Existing specs under docs/features/, so shared types and components stay consistent

Extract the requirements for this feature, keeping their PRD IDs (e.g. CMD-HELP, INPUT-6).

If the PRD is ambiguous or silent on something this feature needs, ask Han before writing the spec. Never pick an answer yourself. After Han answers, propose the matching PRD edit.

## Phase 2: Explore the reference product

Reference product: https://terminal.satnaing.dev/

The site is client-rendered, so WebFetch returns only the page title. Use:
- Source code: clone https://github.com/satnaing/terminal-portfolio into a temp directory and read `src/`.
- Rendered behavior: use the Playwright MCP browser tools if available. Otherwise mark rendered-only behavior as Unknown.

Inspect what is relevant to this feature:
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

## Phase 5: Define test cases

Write testable conditions using Given/When/Then. Include:
- Happy paths
- Edge cases (invalid args, empty input)
- Accessibility
- Responsive behavior (≤ 768px and > 768px)

Each test case has:
- An ID `TC-<FEATURE>-<n>`, where `<FEATURE>` is the feature slug in upper case (e.g. `TC-THEMES-2`, `TC-TERMINAL-SHELL-5`). IDs are never reused or renumbered.
- The PRD IDs it covers.
- Its test layer: Vitest (pure functions) or Storybook interaction test (components).

The test that implements a case must start its name with the ID, e.g. `it("TC-THEMES-2: unknown theme shows usage", ...)`.

## Phase 6: Write the spec

Write exactly one file: `docs/features/<feature-slug>/spec.md`.

Features:
- Cross-cutting: `terminal-shell` (input, prompt, history, keyboard), `themes`, `layout` (page shell, font, responsive, SEO), `deploy`
- One per command: `cmd-about`, `cmd-connect`, `cmd-help`, …

Template:

```markdown
# <feature-slug>
PRD: <IDs covered>

## Spec
- Behavior and exact output text
- Edge cases
- Reference vs PRD (with evidence)
- Open questions (only if Han has not answered yet)

## Plan
- Files, components, types, dependencies, order of work

## Test cases
- TC-<FEATURE>-1 (Vitest | Storybook) [PRD-ID] Given … when … then …
```

Do not implement source code.
