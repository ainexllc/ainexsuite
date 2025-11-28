# Toast/Notification System

A unified, glassmorphism-styled toast notification system built with Radix UI primitives for the AinexSuite.

## Features

- **5 Variants**: default, success, error, warning, info
- **Glassmorphism Styling**: Consistent with the AinexSuite design system
- **Auto-dismiss**: Configurable duration (default: 5000ms)
- **Position Options**: top-left, top-right, bottom-left, bottom-right
- **Accessible**: Full ARIA support via Radix UI
- **Type-safe**: Full TypeScript support
- **Queue Management**: Automatically manages multiple toasts

## Installation

The toast system is already included in `@ainexsuite/ui`. No additional installation needed.

## Usage

### 1. Add the Toaster to your app layout

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

### 2. Use the toast hook in components

```tsx
"use client";

import { useToast } from "@ainexsuite/ui";

export function MyComponent() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Success!",
      description: "Your changes have been saved.",
      variant: "success",
      duration: 5000, // optional, defaults to 5000ms
    });
  };

  return <button onClick={handleClick}>Save</button>;
}
```

### 3. Or use the convenience methods

```tsx
import { toast } from "@ainexsuite/ui";

// Success toast
toast.success({
  title: "Success!",
  description: "Your changes have been saved.",
});

// Error toast
toast.error({
  title: "Error",
  description: "Something went wrong.",
});

// Warning toast
toast.warning({
  title: "Warning",
  description: "Are you sure you want to do this?",
});

// Info toast
toast.info({
  title: "Info",
  description: "New updates are available.",
});

// Default toast
toast.default({
  title: "Notification",
  description: "This is a default notification.",
});
```

## API

### `<Toaster />`

Container component that renders and manages toasts.

**Props:**
- `maxToasts?: number` - Maximum number of toasts to show at once (default: 3)
- `position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"` - Position of the toast viewport (default: "bottom-right")

### `useToast()`

Hook that provides toast management functions.

**Returns:**
- `toasts: ToastData[]` - Array of current toasts
- `toast: (data: ToastInput) => string` - Function to show a toast, returns toast ID
- `dismiss: (id: string) => void` - Function to dismiss a specific toast
- `clear: () => void` - Function to clear all toasts

### `toast` (convenience methods)

Global toast methods for common variants.

**Methods:**
- `toast.success(data)` - Show success toast
- `toast.error(data)` - Show error toast
- `toast.warning(data)` - Show warning toast
- `toast.info(data)` - Show info toast
- `toast.default(data)` - Show default toast
- `toast.dismiss(id)` - Dismiss a specific toast
- `toast.clear()` - Clear all toasts

### `ToastInput`

```typescript
interface ToastInput {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number; // milliseconds, 0 = no auto-dismiss
}
```

## Examples

### With Action Button

```tsx
import { useToast, ToastAction } from "@ainexsuite/ui";

const { toast } = useToast();

toast({
  title: "Update available",
  description: "A new version is available.",
  action: (
    <ToastAction altText="Update now" onClick={() => window.location.reload()}>
      Update
    </ToastAction>
  ),
});
```

### No Auto-dismiss

```tsx
toast({
  title: "Important!",
  description: "This toast will not auto-dismiss.",
  variant: "warning",
  duration: 0, // 0 = no auto-dismiss
});
```

### Manual Dismiss

```tsx
const toastId = toast.success({
  title: "Processing...",
  description: "Please wait while we process your request.",
  duration: 0,
});

// Later, dismiss manually
toast.dismiss(toastId);
```

## Styling

The toast system uses glassmorphism styling with variant-specific accents:

- **Default**: Black/80 background, white/10 border
- **Success**: Green/30 border, green/10 shadow
- **Error**: Red/30 border, red/10 shadow
- **Warning**: Amber/30 border, amber/10 shadow
- **Info**: Blue/30 border, blue/10 shadow

All toasts include:
- Backdrop blur (backdrop-blur-xl)
- Smooth animations (slide in/out)
- Hover effects on close button
- Accessible focus states

## Migration from Local Toast

If migrating from a local toast implementation (like Notes app):

1. Remove local toast files (`components/ui/toaster.tsx`)
2. Update imports:
   ```tsx
   // Before
   import { Toaster, useToast } from "@/components/ui/toaster";

   // After
   import { Toaster, useToast } from "@ainexsuite/ui";
   ```
3. Update variant names if needed (e.g., "destructive" → "error")

## Notes

- Toasts are rendered in a portal and positioned fixed
- Maximum 3 toasts shown by default (configurable)
- Older toasts are removed when limit is reached
- Swipe to dismiss is supported on touch devices
- All components are client-side ("use client")
