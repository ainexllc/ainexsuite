# Notes App - Remaining Theme Migration Work

## Summary
This document tracks the remaining hardcoded colors that need to be converted to theme-aware alternatives in the notes app.

## Pattern Replacements Needed

### Global Patterns:
- `bg-white/X` → `bg-foreground/X`
- `bg-black/X` → `bg-background/X`
- `text-white` → `text-foreground`
- `text-white/X` → `text-muted-foreground` or `text-foreground/X`
- `border-white/X` → `border-border`

## Files Requiring Updates

### 1. note-composer.tsx (HIGH PRIORITY)
**Location:** `apps/notes/src/components/notes/note-composer.tsx`

**Lines to fix:**
- Line 408: `border-white/10 bg-white/5` → `border-border bg-foreground/5`
- Line 408: `text-white/50` → `text-muted-foreground`
- Line 408: `hover:bg-white/10 hover:border-white/20` → `hover:bg-foreground/10 hover:border-border/80`
- Line 417: `bg-[#121212] border border-white/10` → `bg-background border border-border`
- Line 427: `text-white placeholder:text-white/30` → `text-foreground placeholder:text-muted-foreground`
- Line 438: `text-white/40 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 459: `text-white/90 placeholder:text-white/30` → `text-foreground/90 placeholder:text-muted-foreground`
- Line 470: `text-white/40` → `text-muted-foreground`
- Line 583: `bg-white/60` → `bg-foreground/60`
- Line 593: `bg-black/50 text-white` → `bg-background/50 text-foreground`
- Line 632: `text-white` → `text-foreground`
- Line 652: `dark:text-white` → `dark:text-foreground`
- Line 679: `bg-white/60` → `bg-foreground/60`
- Line 681: `dark:text-white` → `dark:text-foreground`
- Line 712: `dark:text-white` → `dark:text-foreground`
- Line 731: `dark:text-white` → `dark:text-foreground`
- Line 747: `border-white/10` → `border-border`
- Line 777: `text-white/50 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 784: `text-white/50 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 795: `text-white/50 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 830: `text-white/50 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 844: `text-white/50 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 874: `text-white/50 hover:text-white` → `text-muted-foreground hover:text-foreground`
- Line 882: `text-white` → `text-foreground`

### 2. note-editor.tsx (HIGH PRIORITY)
**Location:** `apps/notes/src/components/notes/note-editor.tsx`

**Lines to fix:**
- Line 789: `bg-black/60` → `bg-background/60` ✅ (DONE)
- Line 793: `border-white/10 bg-[#1a1a1a]/95` → `border-border bg-background/95` ✅ (DONE)
- Line 803: `text-white placeholder-white/40` → `text-foreground placeholder-muted-foreground` ✅ (DONE)
- Line 867: `bg-white/80` → `bg-foreground/80`
- Line 971: `text-white/80 placeholder-white/40` → `text-foreground/80 placeholder:text-muted-foreground`
- Line 979: `text-white/80` → `text-foreground/80`
- Line 986: `text-white/70` → `text-foreground/70`
- Line 1008: `text-white` → `text-foreground`
- Line 1009: `text-white/60` → `text-muted-foreground`
- Line 1065: `text-white/80 placeholder-white/40` → `text-foreground/80 placeholder:text-muted-foreground`
- Line 1084: `border-white/20 text-white/60 hover:border-white/40 hover:text-white/80` → `border-border text-muted-foreground hover:border-border/80 hover:text-foreground/80`
- Line 1124: `bg-white/60` → `bg-foreground/60`
- Line 1133: `bg-black/50 text-white` → `bg-background/50 text-foreground`
- Line 1144: `bg-white/60` → `bg-foreground/60`
- Line 1153: `bg-black/50 text-white` → `bg-background/50 text-foreground`
- Line 1193: `text-white` → `text-foreground`
- Line 1213: `dark:text-white` → `dark:text-foreground`
- Line 1240: `bg-white/60` → `bg-foreground/60`
- Line 1242: `dark:text-white` → `dark:text-foreground`
- Line 1273: `dark:text-white` → `dark:text-foreground`
- Line 1292: `dark:text-white` → `dark:text-foreground`
- Line 1343: `text-white/60 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 1344: `bg-white/20 text-white` → `bg-foreground/20 text-foreground`
- Line 1352: `text-white/60 hover:text-white hover:bg-white/10` → `text-muted-foreground hover:text-foreground hover:bg-foreground/10`
- Line 1366-1367: Similar patterns as above
- Line 1401-1402: Similar patterns as above

### 3. auth-box.tsx (MEDIUM PRIORITY)
**Location:** `apps/notes/src/components/auth/auth-box.tsx`

**Key areas:**
- Form inputs with white/black backgrounds
- Button colors and text
- Modal overlay colors
- Border colors

### 4. landing-page.tsx (LOW PRIORITY)
**Location:** `apps/notes/src/components/marketing/landing-page.tsx`

**Note:** This is a marketing page and may intentionally use fixed colors for branding.
Consider whether theme-awareness is needed here.

## Completed Files ✅

1. app-shell.tsx
2. sidebar.tsx
3. labels-section.tsx
4. note-card.tsx
5. view-toggle.tsx
6. workspace-insights.tsx
7. ai-insights.tsx
8. reminder-list.tsx (partial)
9. logo-wordmark.tsx
10. note-editor.tsx (partial - modal wrapper and title input)

## Testing Checklist

After completing migrations:
- [ ] Test dark mode toggle
- [ ] Test light mode appearance
- [ ] Verify all text is readable in both modes
- [ ] Check hover states work correctly
- [ ] Verify borders are visible in both themes
- [ ] Test color palette picker
- [ ] Test note composer in both themes
- [ ] Test note editor modal in both themes
- [ ] Test auth box in both themes
- [ ] Test landing page (if migrated)

## Notes
- The app uses CSS variables for theming
- Colors should adapt automatically between light/dark modes
- `text-foreground` is the primary text color
- `text-muted-foreground` is for secondary/muted text
- `bg-background` is the main background
- `bg-foreground` is inverted (white in light, dark in dark)
- `border-border` adapts to theme

## Priority Order
1. note-composer.tsx (user-facing, high usage)
2. note-editor.tsx (user-facing, high usage)
3. auth-box.tsx (critical flow)
4. landing-page.tsx (consider if needed)
