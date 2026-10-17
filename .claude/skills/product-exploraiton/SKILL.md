---
name: explore-product
description: Explore existing product behavior, analyze product requirements, and generate implementation-ready specifications.
---

# Product Exploration Workflow

## Phase 1: Understand requirements

Read:
- requirements/product-requirements.md
- Relevant architecture documents
- Existing feature specifications

Extract functional and nonfunctional requirements.

## Phase 2: Explore existing product

Existing product: 
https://terminal.satnaing.dev/

Inspect:
- Existing UI and interactions
- Source code and component structure
- State management
- Accessibility behavior
- Responsive behavior
- Error and loading states

Record evidence for each observed behavior.

## Phase 3: Gap analysis

For each requirement, classify:

- Implemented
- Partially implemented
- Missing
- Unknown

Do not confuse missing evidence with missing functionality.

## Phase 4: Plan implementation

Identify:
- Components to create or update
- Props and TypeScript interfaces
- State management
- Dependencies
- File locations
- Implementation order

## Phase 5: Define acceptance criteria

Write testable conditions using Given/When/Then.

Include:
- Happy paths
- Edge cases
- Accessibility
- Responsive behavior
- Failure states

Test tech stack:
- vitest
- storybook

## Phase 6: Write documentation

Create:
- specification.md
- implementation-plan.md
- test-cases.md

Cross-reference requirement IDs across files.

Do not implement source code.