# Toast System Migration Guide

## Overview

A unified Toast/Notification system has been created in `@ainexsuite/ui` using Radix UI primitives. This system provides consistent, glassmorphism-styled notifications across all AinexSuite apps.

## What Was Created

### Core Files

1. **`/packages/ui/src/components/toast/toast.tsx`**
   - Toast primitive components (Toast, ToastTitle, ToastDescription, etc.)
   - 5 variants with glassmorphism styling
   - Radix UI integration with accessibility

2. **`/packages/ui/src/components/toast/use-toast.ts`**
   - Hook for triggering toasts: `useToast()`
   - Global toast state management
   - Convenience methods: `toast.success()`, `toast.error()`, etc.
   - Auto-dismiss with configurable duration

3. **`/packages/ui/src/components/toast/toaster.tsx`**
   - Toast container/provider component
   - Queue management (max 3 toasts by default)
   - Position options (top-left, top-right, bottom-left, bottom-right)

4. **`/packages/ui/src/components/toast/index.ts`**
   - Exports all toast components and types

5. **`/packages/ui/src/components/toast/README.md`**
   - Complete documentation with examples

## Features

### Toast Variants

All variants use glassmorphism styling (`bg-black/80 backdrop-blur-xl border-white/10`):

1. **default** - Standard notification
2. **success** - Green accent border (`border-green-500/30`)
3. **error** - Red accent border (`border-red-500/30`)
4. **warning** - Amber accent border (`border-amber-500/30`)
5. **info** - Blue accent border (`border-blue-500/30`)

### Key Features

- Auto-dismiss with configurable duration (default: 5000ms)
- Manual dismiss with close button
- Support for action buttons
- Queue management (max toasts configurable)
- Position options
- Swipe to dismiss on touch devices
- Fully accessible (ARIA support)
- TypeScript with full type safety

## How to Use

### 1. Add Toaster to App Layout

```tsx
import { Toaster } from "@ainexsuite/ui";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### 2. Use in Components (Hook Method)

```tsx
"use client";

import { useToast } from "@ainexsuite/ui";

export function MyComponent() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Success!",
      description: "Your changes have been saved.",
      variant: "success",
    });
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### 3. Use Convenience Methods (Anywhere)

```tsx
import { toast } from "@ainexsuite/ui";

// Success
toast.success({ title: "Saved!", description: "Changes saved successfully." });

// Error
toast.error({ title: "Error", description: "Something went wrong." });

// Warning
toast.warning({ title: "Warning", description: "This action cannot be undone." });

// Info
toast.info({ title: "Info", description: "New updates available." });
```

## Migration Status

### Completed

- ✅ Created unified toast system in `@ainexsuite/ui`
- ✅ Added @radix-ui/react-toast dependency
- ✅ Implemented all 5 variants with glassmorphism styling
- ✅ Built and tested successfully
- ✅ Updated Notes app to use shared toast:
  - Updated `apps/notes/src/app/layout.tsx`
  - Updated `apps/notes/src/components/auth/auth-box.tsx`

### Apps to Migrate

The following apps should migrate to use the shared toast system:

1. **journey** - Check if it has local toast implementation
2. **grow** - Has `NotificationToast.tsx` (different use case - may keep)
3. **main** - Check for toast usage
4. **fit** - Check for toast usage
5. **moments** - Check for toast usage
6. **pulse** - Check for toast usage
7. **todo** - Check for toast usage
8. **track** - Check for toast usage

### Migration Steps (Per App)

1. Find local toast/toaster files:
   ```bash
   find apps/<app-name> -name "*toast*" -o -name "*toaster*"
   ```

2. Update imports:
   ```tsx
   // Before
   import { Toaster, useToast } from "@/components/ui/toaster";

   // After
   import { Toaster, useToast } from "@ainexsuite/ui";
   ```

3. Update variant names if needed:
   - `destructive` → `error`

4. Remove local toast files after migration

5. Test the app to ensure toasts work correctly

## Special Cases

### Grow App's NotificationToast

The Grow app has a specialized `NotificationToast.tsx` that:
- Displays game-specific notifications (wagers, quests, nudges)
- Shows emojis based on notification type
- Pulls from store state

**Decision**: Keep this separate as it's app-specific logic. Consider using the shared toast system for general notifications while keeping this for game-specific alerts.

## Package Dependencies

Added to `packages/ui/package.json`:
```json
{
  "dependencies": {
    "@radix-ui/react-toast": "1.2.15"
  }
}
```

## Technical Details

### State Management

- Uses global state pattern (similar to Notes app implementation)
- Listeners pattern for React updates
- Auto-cleanup on unmount

### Styling

- Uses inline `cn()` utility (clsx)
- Glassmorphism: `bg-black/80 backdrop-blur-xl`
- Variant-specific borders and shadows
- Smooth animations (slide in/out)

### Accessibility

- Full ARIA support via Radix UI
- Keyboard navigation
- Screen reader announcements
- Focus management

## Testing Checklist

For each app migration:

- [ ] App builds successfully
- [ ] Toasts appear in correct position
- [ ] All variants display correctly
- [ ] Auto-dismiss works
- [ ] Manual dismiss works
- [ ] Multiple toasts queue correctly
- [ ] Animations are smooth
- [ ] Keyboard navigation works
- [ ] No console errors

## Future Enhancements

Potential improvements:

1. **Persistent toasts** - Option to keep toast until user dismisses
2. **Sound effects** - Optional audio feedback
3. **Custom icons** - Allow custom icons per variant
4. **Position per toast** - Override position for individual toasts
5. **Stacking vs replacing** - Option to replace existing toast of same type
6. **Progress bar** - Visual countdown for auto-dismiss
7. **Rich content** - Support for images, custom components

## Notes

- The toast system is ready to use across all AinexSuite apps
- Notes app has been successfully migrated
- All other apps should follow the same migration pattern
- The shared system ensures consistency across the suite

---

**Created**: November 28, 2025
**Status**: Complete and ready for cross-app migration
