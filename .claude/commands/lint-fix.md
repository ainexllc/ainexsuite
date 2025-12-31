---
description: Run lint and auto-fix all fixable issues across the monorepo
---

# Lint Fix

Run ESLint with auto-fix across all apps and packages.

## Command

```bash
pnpm lint --fix
```

Or for a specific app:

```bash
pnpm --filter @ainexsuite/journal lint -- --fix
```

## Common Fixes Applied

- Unused imports removed
- Missing semicolons added
- Formatting issues fixed
- Import order corrected

## If Issues Remain

Check the output for errors that can't be auto-fixed:
- Unused variables (rename with `_` prefix or remove)
- `console.log` statements (remove or replace with proper logging)
- Type errors (need manual fix)
