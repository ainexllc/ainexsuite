---
description: Run lint, type-check, and build before pushing to main. Pre-push validation.
---

# Build Check

Run comprehensive validation before pushing to main.

## Steps

1. **Run lint** with auto-fix:
```bash
pnpm lint
```

2. **Run type checking** across all packages:
```bash
pnpm build --filter @ainexsuite/types
```

3. **Run full build** to catch any issues:
```bash
pnpm build
```

4. **Report results**:
   - If all pass: "All checks passed. Safe to push."
   - If any fail: Show the specific errors and suggest fixes.

## Quick Fix Commands

If lint fails:
```bash
pnpm lint --fix  # Auto-fix what's possible
```

If types build fails:
```bash
pnpm build --filter @ainexsuite/types 2>&1 | head -50
```

If app build fails:
```bash
pnpm build --filter [app-name] 2>&1 | tail -100
```

## Common Issues

| Error | Fix |
|-------|-----|
| `console.log` warnings | Remove debug statements |
| Unused variables | Prefix with `_` or remove |
| Missing dependencies | Run `pnpm install` |
| Type errors | Check the specific file |
| Import errors | Verify package exports |
