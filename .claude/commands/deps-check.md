---
description: Check for outdated dependencies and security vulnerabilities
---

# Dependency Check

Audit dependencies for updates and security issues.

## Commands

Check for outdated packages:
```bash
pnpm outdated
```

Check for security vulnerabilities:
```bash
pnpm audit
```

Update all dependencies (interactive):
```bash
pnpm update --interactive --latest
```

Update a specific package:
```bash
pnpm update react --filter @ainexsuite/journal
```

## Before Updating

1. Check the changelog for breaking changes
2. Update in a separate branch
3. Run tests after updating
4. Check the app still builds and runs

## Common Issues

| Issue | Fix |
|-------|-----|
| Peer dependency warning | Usually safe to ignore for dev deps |
| Version conflict | Check which packages need specific versions |
| Security vulnerability | Update the package or check if exploitable |
