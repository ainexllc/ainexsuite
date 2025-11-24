# AinexSuite Project Context

**Project**: AinexSuite - Multi-App Monorepo
**Architecture**: Turborepo with shared packages
**Vercel**: ✅ Auto-deploy enabled (main, pulse, journey, notes, todo, etc.)

## ⚠️ Critical Policies

### Git Safety
- ❌ NEVER rebase, force push, or commit without explicit user request
- ✅ ALWAYS confirm before git operations
- See `~/.claude/CLAUDE.md` for full guidelines

### Vercel Auto-Deploy
- ✅ All commits to `main` trigger production deployment
- ✅ MUST verify `pnpm build` succeeds before pushing to main
- ✅ Auto-fix skill: `vercel-build-fixer` handles common failures
- Check status: `vercel logs --scope=ainexllc`

## 📁 Project Structure

```
ainexsuite/
├── apps/           # 9 apps: main, journey, notes, fit, grow, moments, pulse, todo, track
├── packages/       # Shared: ui, types, auth, theme, ai, config, generators
└── .claude/        # Project-specific Claude config
```

## 🎯 Multi-App Consistency

### Core Principle
**When changing shared elements (footers, themes, components, configs), apply changes consistently across ALL affected apps.**

### Shared Elements
1. **Components**: `packages/ui/src/components/*` → Used by all apps
2. **Types**: `packages/types/src/*` → Shared TypeScript definitions
3. **Auth**: `packages/auth/*` → SSO across all apps
4. **Themes**:
   - Journey: Orange (#f97316) + Forest green (#22c55e) - Glassmorphism
   - Notes: Blue (#3b82f6) - Clean, professional
   - Main: Unified theme switcher

### When to Use Cross-App Skills
Use global skills (from `~/.claude/skills/`) when:
- Making same change to 3+ apps
- Updating shared components
- Syncing configurations
- Applying security patches

**Available Skills**:
- 🧭 `cross-app-navigation-sync` - Sync navigation across apps
- 🎨 `theme-consistency-enforcer` - Enforce theme standards
- 🔍 `monorepo-consistency-audit` - Audit entire monorepo
- 📦 `component-library-migrator` - Migrate to shared packages
- 📐 `layout-standardizer` - Standardize layouts
- 🚀 `app-shell-generator` - Generate new app shells

## 🔧 Essential Commands

```bash
# Development
pnpm dev                                    # Run all apps
pnpm --filter @ainexsuite/main dev          # Run specific app

# Build & Test
pnpm build                                  # Build all apps (REQUIRED before main push)
pnpm --filter @ainexsuite/journey build     # Build specific app
pnpm test                                   # Run tests
pnpm lint                                   # Lint all apps

# Turborepo
pnpm turbo run build --filter=main          # Turbo-specific command
```

## 📋 Pre-Change Checklist

Before modifying shared elements:
- [ ] Identify all affected apps
- [ ] Check if cross-app skill exists
- [ ] If 3+ apps affected, use or create skill
- [ ] Document theme-specific variations
- [ ] Test build: `pnpm build`
- [ ] Verify themes remain distinct

## 🚨 Common Pitfalls

1. **Inconsistent Updates** → Use cross-app skills
2. **Theme Mixing** → Journey (Orange) ≠ Notes (Blue)
3. **Type Mismatches** → Update `packages/types` once
4. **Config Drift** → Use shared config in `packages/config`
5. **Forgot to Build** → `pnpm build` BEFORE pushing to main

## 📚 Documentation

### In This Repo
- `/docs/DESIGN_SYSTEM.md` - Complete design reference (v2.1)
- `/docs/FIRESTORE_INDEXES.md` - Firestore operations guide
- `/docs/project-structure.md` - Monorepo architecture
- `/docs/setup-guides/` - Firebase, Vercel, environment setup
- `/.claude/reference/turborepo-commands.md` - Turborepo reference
- `/packages/*/README.md` - Package-specific docs

### Global Config
- `~/.claude/CLAUDE.md` - Global settings and skills
- `~/.claude/skills/` - 17 global skills
- `~/.claude/VISUAL_REFERENCE.md` - Icon/color guide

## 💡 Notes for Claude

When working:
- **Always ask**: "Does this affect multiple apps?"
- **Before propagating**: "Should I use a cross-app skill?"
- **After changes**: "Let me verify build: `pnpm build`"
- **Theme awareness**: Respect app-specific themes
- **Leverage Turborepo**: Use shared packages

---
*Last updated: November 2025*
