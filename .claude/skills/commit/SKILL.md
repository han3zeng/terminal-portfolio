## General Rule
- Be concise, just add the key points
- Before each commit ask user permission

## Titles
- `feat` — Introduce a new feature
- `fix` — Fix a bug
- `refactor` — Restructure code without changing behavior
- `perf` — Improve performance
- `docs` — Documentation changes
- `style` — Formatting changes without affecting logic
- `test` — Add or modify tests
- `build` — Build system or dependency changes
- `ci` — CI/CD configuration changes
- `chore` — Routine maintenance
- `revert` — Revert a previous commit


## Examples

```
feat(auth): add Google OAuth authentication

Implement Google OAuth login to simplify account creation
and eliminate the need for password management.

- Add Google OAuth authorization flow
- Exchange authorization codes through the backend
- Store refresh tokens securely on the server
- Add authentication middleware for protected routes
```