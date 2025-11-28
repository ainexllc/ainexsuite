# Theme System Fix Plan

## Problem Analysis

### Root Cause: Class Name Mismatch + Hardcoded Colors

**Issue 1: `next-themes` applies `class="light"` but CSS only defines `.theme-light`**

```css
/* What next-themes adds: */
<html class="light">

/* What CSS defines: */
.theme-light { ... }  /* NOT .light! */
```

**Issue 2: `:root` defaults to DARK surface colors but LIGHT HSL colors**

In `packages/ui/src/styles/globals.css`:
```css
:root {
  /* HSL says LIGHT */
  --background: 0 0% 98%;         /* White */
  --foreground: 240 10% 4%;       /* Dark text */

  /* RGB says DARK */
  --color-surface-base: 20 20 22; /* Near black! */
  --color-ink-900: 247 247 250;   /* White text! */
}
```

**Issue 3: Components use hardcoded dark-mode values**

```tsx
// These assume dark background - won't work in light mode!
className="bg-white/5"
className="text-white/70"
className="border-white/10"
className="bg-black/40"
```

---

## Detailed Fix Plan

### Phase 1: Fix CSS Class Names (Critical - Do First)

**File: `packages/ui/src/styles/globals.css`**

Add `.light` class that mirrors `.theme-light`:

```css
/* Add after line 234 */
.light {
  /* Copy all .theme-light variables here */
}
```

OR change next-themes config to use `theme-light` class name.

### Phase 2: Fix `:root` Variable Defaults

**Current Problem:**
- `:root` has mismatched light/dark values
- This causes the "identical" appearance

**Solution:**
Make `:root` consistent. Since most components expect dark mode:

```css
:root {
  color-scheme: dark;  /* Change from light */

  /* HSL variables - Dark Mode */
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;
  /* ... rest of dark mode HSL values */
}
```

### Phase 3: Create Proper Light Mode Token Values

**Key differences needed:**

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--color-surface-base` | `20 20 22` (near black) | `250 251 252` (off-white) |
| `--color-surface-elevated` | `36 36 40` | `255 255 255` (white) |
| `--color-ink-900` | `247 247 250` (white) | `12 12 12` (black) |
| `--background` | `240 10% 4%` | `0 0% 98%` |
| `--foreground` | `0 0% 98%` | `240 10% 4%` |
| `--card` | `240 10% 4%` | `0 0% 100%` |
| `--border` | `240 4% 16%` | `240 6% 90%` |

### Phase 4: Audit and Replace Hardcoded Colors

**Find all hardcoded colors:**
```bash
grep -r "bg-white" apps/ packages/ui/
grep -r "bg-black" apps/ packages/ui/
grep -r "text-white" apps/ packages/ui/
grep -r "border-white" apps/ packages/ui/
```

**Replace with theme-aware alternatives:**

| Hardcoded | Replace With |
|-----------|--------------|
| `bg-white/5` | `bg-foreground/5` or `bg-muted` |
| `bg-white/10` | `bg-foreground/10` or `bg-accent` |
| `bg-black/40` | `bg-background/40` |
| `text-white` | `text-foreground` |
| `text-white/70` | `text-muted-foreground` |
| `border-white/10` | `border-border` or `border-muted` |

### Phase 5: Component-by-Component Fixes

**High-priority components (used everywhere):**

1. `WorkspaceLayout` - `packages/ui/src/components/layouts/workspace-layout.tsx`
2. `WorkspaceHeader` - `packages/ui/src/components/layouts/workspace-header.tsx`
3. `ProfileDropdown` - `packages/ui/src/components/layout/profile-dropdown.tsx`
4. `ProfileSidebar` - `packages/ui/src/components/layout/profile-sidebar.tsx`
5. `AppNavigationSidebar` - `packages/ui/src/components/layout/app-navigation-sidebar.tsx`
6. `Modal` components
7. `Card` components
8. `Button` components

---

## Implementation Order

### Step 1: Quick Fix (Immediate Impact)
Add `.light` class to CSS that copies `.theme-light` values.

### Step 2: Variable Audit
Create a mapping of which variables need light/dark variants.

### Step 3: CSS Consolidation
Merge the two theme systems (`packages/theme/globals.css` and `packages/ui/globals.css`).

### Step 4: Component Migration
- Start with `WorkspaceLayout` (affects all apps)
- Then shared UI components
- Then app-specific components

### Step 5: Testing
- Test each app in both modes
- Visual regression checks

---

## Files to Modify

### CSS Files
1. `packages/ui/src/styles/globals.css` - Main theme tokens
2. `packages/theme/src/globals.css` - Legacy tokens (consolidate)

### High-Impact Components
1. `packages/ui/src/components/layouts/workspace-layout.tsx`
2. `packages/ui/src/components/layouts/workspace-header.tsx`
3. `packages/ui/src/components/layouts/workspace-background.tsx`
4. `packages/ui/src/components/layout/profile-dropdown.tsx`
5. `packages/ui/src/components/layout/profile-sidebar.tsx`
6. `packages/ui/src/components/layout/app-navigation-sidebar.tsx`
7. `packages/ui/src/components/layout/sidebar.tsx`

### Per-App Files (if needed)
- Each app's `globals.css` may need updates
- Each app's custom components

---

## Estimated Effort

| Phase | Effort | Impact |
|-------|--------|--------|
| Phase 1: Class fix | 15 min | High - enables theme switching |
| Phase 2: Root defaults | 30 min | High - fixes base appearance |
| Phase 3: Light tokens | 1 hour | High - proper light mode |
| Phase 4: Hardcoded audit | 2-3 hours | Medium - consistent components |
| Phase 5: Component fixes | 3-4 hours | Medium - polish |

**Total: ~6-8 hours for comprehensive fix**

---

## Quick Win: Minimum Viable Fix

To get light mode working quickly, just do:

1. Add `.light` class to `globals.css` (copy from `.theme-light`)
2. Fix `--color-surface-*` and `--color-ink-*` in `.light` class
3. Test with one app

This will make ~70% of the UI work in light mode immediately.
