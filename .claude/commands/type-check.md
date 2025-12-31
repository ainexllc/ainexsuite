---
description: Run TypeScript type checking across all apps and packages
---

# Type Check

Verify TypeScript types without building.

## Commands

Check types package first (other packages depend on it):
```bash
pnpm build --filter @ainexsuite/types
```

Check a specific app:
```bash
cd apps/journal && npx tsc --noEmit
```

Check all packages:
```bash
pnpm build
```

## Common Type Errors

| Error | Fix |
|-------|-----|
| `Property 'x' does not exist` | Add to interface or check spelling |
| `Type 'X' is not assignable to 'Y'` | Check types match or add type assertion |
| `Cannot find module` | Check import path or run `pnpm install` |
| `Object is possibly undefined` | Add null check or use optional chaining |
