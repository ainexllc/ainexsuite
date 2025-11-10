# AinexSuite Project Context

**Project**: AinexSuite - Multi-App Monorepo
**Architecture**: Turborepo with shared packages
**Date**: November 6, 2025

## ⚠️ CRITICAL: Git Safety Policy
**See global ~/.claude/CLAUDE.md for full git safety guidelines**
- ❌ NEVER rebase, force push, or commit without explicit user request
- ✅ ALWAYS confirm before ANY git operations

## 📁 Project Structure

```
ainexsuite/
├── apps/
│   ├── main/         # Main dashboard app
│   ├── journey/      # Journal app (Orange/Forest theme)
│   ├── notes/        # Notes app (Blue theme)
│   ├── fit/          # Fitness tracking
│   ├── grow/         # Growth tracking
│   ├── moments/      # Photo memories
│   ├── pulse/        # Health metrics
│   ├── todo/         # Task management
│   └── track/        # General tracking
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configurations
└── .claude/
    ├── CLAUDE.md     # This file (project-specific)
    ├── skills/       # Project-specific skills
    └── agents/       # Project-specific agents
```

## 🎯 Multi-App Consistency Requirements

### Critical Principle
**When making changes to shared elements (footers, themes, components, configs), changes MUST be applied consistently across ALL apps that use them.**

### Common Shared Elements

1. **Footer Components**
   - Location: `apps/*/src/components/footer.tsx`
   - Shared package: `packages/ui/src/components/footer.tsx`
   - Apps using: All apps

2. **Theme Systems**
   - Journey: Orange/Forest glassmorphism
   - Notes: Blue professional
   - Main: Unified theme switcher

3. **Authentication**
   - Shared across all apps
   - Single sign-on integration
   - Context in `packages/ui`

4. **TypeScript Types**
   - Location: `packages/types/src/`
   - Used by: All apps
   - Changes propagate automatically

## 🔄 Cross-App Update Workflow

### Manual Approach (NOT Recommended)
❌ Updating each app individually
❌ Copy-pasting changes
❌ Risk of inconsistencies

### Skill-Based Approach (Recommended)
✅ Create or use existing cross-app skills
✅ Automated consistency
✅ Single source of truth

### When to Use Cross-App Skills

**Trigger Conditions:**
- Making the same change to 3+ apps
- Updating shared components
- Propagating theme changes
- Syncing configurations
- Applying security patches

**Available Global Skills** (see `~/.claude/skills/`):
1. 🧭 **cross-app-navigation-sync** - Sync navigation components across all apps
2. 🎨 **theme-consistency-enforcer** - Enforce theme standards and consistency
3. 🔍 **monorepo-consistency-audit** - Audit entire monorepo for issues
4. 📦 **component-library-migrator** - Migrate components to shared packages
5. 📐 **layout-standardizer** - Standardize page layouts across apps
6. 🚀 **app-shell-generator** - Generate new app shells

**How to Use:**
- Skills activate automatically when you describe relevant tasks
- Or explicitly: "Use cross-app-navigation-sync to update navigation"
- Full documentation: `~/.claude/CLAUDE.md` (Skills section)

## 🛠️ Active Cross-App Skills

### 🧭 cross-app-navigation-sync (Blue #3b82f6)
**Purpose**: Synchronize navigation components across all apps while maintaining theme-specific styling

**Triggers**:
- "update navigation across all apps"
- "sync navigation components"
- "standardize app navigation"

**Capabilities**:
- Detects apps using shared navigation components
- Migrates apps to NavigationPanel/TopNav pattern
- Maintains theme-specific colors (Journey: Orange, Notes: Blue)
- Verifies consistency with build checks

**Location**: `~/.claude/skills/cross-app-navigation-sync/`

### 🎨 theme-consistency-enforcer (Purple #a855f7)
**Purpose**: Enforce consistent theming and design tokens across all apps

**Triggers**:
- "check theme consistency"
- "enforce theme standards"
- "validate design tokens"

**Capabilities**:
- Audits Tailwind configs and CSS variables
- Identifies hardcoded colors
- Validates dark mode implementation
- Fixes theme inconsistencies automatically

**Location**: `~/.claude/skills/theme-consistency-enforcer/`

### 🔍 monorepo-consistency-audit (Red #ef4444)
**Purpose**: Comprehensive audit of the entire monorepo for consistency issues

**Triggers**:
- "audit monorepo"
- "check for inconsistencies"
- "consistency report"

**Capabilities**:
- Navigation component audit
- Theme consistency check
- Component duplication detection
- Layout standardization review
- Dependency version analysis

**Location**: `~/.claude/skills/monorepo-consistency-audit/`

## 📋 Pre-Change Checklist

Before making changes to shared elements:

- [ ] Identify all apps affected
- [ ] Check if a cross-app skill exists
- [ ] If no skill exists and 3+ apps affected, create one
- [ ] Document theme-specific variations
- [ ] Plan rollout order (test in dev app first)
- [ ] Verify build success in all affected apps
- [ ] Check git diff for unintended changes

## 🎨 Theme-Specific Considerations

### Journey App (Orange/Forest)
- Primary: Orange (#f97316)
- Secondary: Forest green (#22c55e)
- Style: Glassmorphism with backdrop blur
- Components: Enhanced with glass effects

### Notes App (Blue)
- Primary: Blue (#3b82f6)
- Style: Clean, professional
- Components: Minimal decoration
- Focus: Readability

### Main App (Unified)
- Theme switcher for all app themes
- Detects active app
- Applies corresponding theme

## 🚨 Common Pitfalls to Avoid

1. **Inconsistent Footer Updates**
   - ❌ Updating footer in one app, forgetting others
   - ✅ Use `cross-app-footer-updater` skill

2. **Theme Drift**
   - ❌ Journey and Notes themes diverge
   - ✅ Use `theme-consistency-checker` skill

3. **Type Mismatches**
   - ❌ Types out of sync between apps
   - ✅ Update in `packages/types` once

4. **Config Inconsistencies**
   - ❌ Different ESLint rules per app
   - ✅ Shared config in `packages/config`

## 🔧 Development Commands

```bash
# Run all apps
pnpm dev

# Run specific app
pnpm --filter @ainexsuite/main dev
pnpm --filter @ainexsuite/journey dev

# Build all apps
pnpm build

# Build specific app
pnpm --filter @ainexsuite/main build

# Run tests across all apps
pnpm test

# Lint all apps
pnpm lint
```

## 📊 Cross-App Testing Strategy

### After Making Shared Changes

1. **Build Test**: Verify all apps build successfully
   ```bash
   pnpm build
   ```

2. **Visual Test**: Check key pages in each app
   - Main: Dashboard, Settings
   - Journey: Workspace, Entries
   - Notes: Notes list, Editor

3. **Theme Test**: Verify themes are correct
   - Journey: Orange/Forest
   - Notes: Blue
   - Main: Switcher works

4. **Component Test**: Verify shared components render correctly
   - Footer in all apps
   - Navigation consistency
   - Shared UI elements

## 🎯 Success Metrics

**Good Cross-App Update:**
- ✅ All apps build successfully
- ✅ Themes remain distinct and correct
- ✅ Shared components consistent
- ✅ No unintended changes in git diff
- ✅ Completed in < 5 minutes

**Signs of Problems:**
- ❌ Build failures in any app
- ❌ Theme mixing (Orange in Notes app, Blue in Journey)
- ❌ Inconsistent component appearance
- ❌ Large git diff with unexpected changes
- ❌ Takes > 15 minutes manually

## 🔄 Skill Creation Workflow

When you identify a repetitive cross-app task:

1. **Document the pattern** in this file
2. **Create skill file** in `.claude/skills/`
3. **Test on 2 apps** to verify logic
4. **Apply to all apps** using the skill
5. **Commit skill** to version control
6. **Update this document** with the new skill

## 📝 Notes for Claude

When working in this project:
- **Always ask**: "Does this change affect multiple apps?"
- **Before propagating**: "Should I create a skill for this?"
- **After changes**: "Let me verify all affected apps build"
- **Theme awareness**: Respect Journey (Orange) vs Notes (Blue)
- **Use turborepo**: Leverage shared packages when possible

## 🔗 Related Documentation

### Global Documentation
- **Global CLAUDE.md**: `~/.claude/CLAUDE.md` - Core configuration and settings
- **Visual Reference**: `~/.claude/VISUAL_REFERENCE.md` - Icon and color guide
- **Skills Directory**: `~/.claude/skills/` - Global skills (17 active)
- **Agents Directory**: `~/.claude/agents/` - Subagents (17 active)

### Project-Specific Documentation
- **Turborepo Commands**: `.claude/reference/turborepo-commands.md` - Complete development commands
- **Cross-App Testing**: `.claude/checklists/cross-app-testing.md` - Testing checklist for multi-app changes
- **Project Skills**: `.claude/skills/` - Project-specific skills (if any)
- **Shared Packages**: `packages/*/README.md` - Documentation for shared packages

### Quick Reference
```bash
# View global skills
ls ~/.claude/skills/

# View project checklists
ls .claude/checklists/

# View project references
ls .claude/reference/
```

---
*Project CLAUDE.md created: November 6, 2025*
*Multi-app consistency guidelines established*
*Skills and references updated: November 6, 2025*
