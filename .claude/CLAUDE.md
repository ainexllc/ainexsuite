# AinexSuite Project Context

**Project**: AinexSuite - Multi-App Monorepo
**Architecture**: Turborepo with shared packages
**Date**: November 6, 2025

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

**Available Skills** (Create if needed):
1. `cross-app-footer-updater` - Update footer across all apps
2. `theme-consistency-checker` - Ensure theme alignment
3. `shared-component-propagator` - Update shared UI components
4. `config-synchronizer` - Sync shared configs
5. `type-propagator` - Update TypeScript types

## 🛠️ Project-Specific Skills to Create

### Priority 1: Component Synchronization

**Skill Name**: `cross-app-component-sync`

**Purpose**: Update the same component across multiple apps while respecting theme differences

**Triggers**:
- "update footer across all apps"
- "sync component to all apps"
- "propagate component changes"

**Logic**:
```yaml
1. Identify which apps use the component
2. Check for theme-specific variations
3. Update base component in shared package
4. Apply theme-specific overrides per app
5. Verify consistency with git diff
6. Run build check on all affected apps
```

### Priority 2: Theme Propagation

**Skill Name**: `theme-propagator`

**Purpose**: Apply theme changes while maintaining app-specific color schemes

**Triggers**:
- "update theme across apps"
- "sync theme system"
- "apply theme changes"

**Logic**:
```yaml
1. Detect base theme changes
2. Map to app-specific color palettes:
   - Journey: Orange (#f97316) / Forest (#22c55e)
   - Notes: Blue (#3b82f6)
   - Main: Multi-theme support
3. Update Tailwind configs
4. Rebuild all apps
5. Visual regression test
```

### Priority 3: Configuration Sync

**Skill Name**: `config-synchronizer`

**Purpose**: Sync shared configurations (Firebase, Next.js, TypeScript, ESLint)

**Triggers**:
- "sync configs across apps"
- "update shared configuration"
- "propagate config changes"

**Logic**:
```yaml
1. Identify shared config files
2. Update in shared package
3. Propagate to apps if overridden
4. Verify no breaking changes
5. Run build tests
```

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

- Global CLAUDE.md: `~/.claude/CLAUDE.md`
- Visual Reference: `~/.claude/VISUAL_REFERENCE.md`
- Skills Directory: `.claude/skills/`
- Shared Packages: `packages/*/README.md`

---
*Project CLAUDE.md created: November 6, 2025*
*Multi-app consistency guidelines established*
