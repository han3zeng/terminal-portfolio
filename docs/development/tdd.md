## TDD Concepts


### Overview 
This repo follow TDD.
First specify the spec, then creates testing around it and then implement features.


### Testing

| Command | Question it answers | Source of truth |
| --- | --- | --- |
| `pnpm test` | Do all the tests that exist pass? | the test files |
| `pnpm spec:status` | Does every spec test case have a test, and does it pass? | the spec IDs plus the test results |

So for each ID in `spec.md`, `spec:status` reports one of three states:
- **missing**: no test name starts with this ID.
- **failing**: a test exists, but it fails.
- **passing**: a test exists, and it passes.

`spec:status` uses the results of a test run, so it doesn't replace `pnpm test`. It adds the comparison with the spec on top.