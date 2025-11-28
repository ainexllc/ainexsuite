# Toast System Structure

## File Organization

```
packages/ui/src/components/toast/
├── toast.tsx           # Core toast primitives & components
├── use-toast.ts        # Hook & global state management
├── toaster.tsx         # Toast container & queue manager
├── index.ts            # Public exports
├── README.md           # Usage documentation
├── STRUCTURE.md        # This file
└── dist/              # Built output (generated)
    ├── toast.js
    ├── toast.d.ts
    ├── use-toast.js
    ├── use-toast.d.ts
    ├── toaster.js
    └── toaster.d.ts
```

## Component Hierarchy

```
<Toaster>                           # Container (add to app layout)
  └─ <ToastProvider>                # Radix provider
      ├─ <Toast variant="...">      # Individual toast
      │   ├─ <ToastTitle>          # Title text
      │   ├─ <ToastDescription>    # Description text
      │   ├─ <ToastAction>         # Optional action button
      │   └─ <ToastClose>          # Close button
      └─ <ToastViewport>           # Positioning container
```

## Data Flow

```
Component → useToast() → toastState → Listeners → Toaster → Toast

1. Component calls toast() or useToast().toast()
2. Toast added to global toastState
3. State emits to all listeners
4. Toaster receives update via useToast()
5. Toaster renders Toast components
6. Auto-dismiss timer triggers removal
```

## Type System

```typescript
ToastVariant = "default" | "success" | "error" | "warning" | "info"

ToastInput {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: ToastVariant
  duration?: number
}

ToastData = ToastInput & {
  id: string
}

ToasterProps {
  maxToasts?: number
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}
```

## Import Paths

### From Components
```tsx
import { 
  Toaster,           // Container component
  useToast,          // Hook
  toast,             // Convenience methods
  Toast,             // Primitive (usually not needed)
  ToastAction,       // Action button (for custom actions)
} from "@ainexsuite/ui";
```

### From Packages
```tsx
// In other packages/ui components
import { toast } from "../toast";
import { useToast } from "../toast/use-toast";
```

## Styling Classes

### Base (All Variants)
- `bg-black/80` - Semi-transparent black background
- `backdrop-blur-xl` - Glassmorphism blur effect
- `rounded-xl` - Rounded corners
- `shadow-2xl` - Large shadow
- `p-6 pr-8` - Padding (extra right for close button)

### Variant-Specific
```css
default:  border-white/10
success:  border-green-500/30 shadow-green-500/10
error:    border-red-500/30 shadow-red-500/10
warning:  border-amber-500/30 shadow-amber-500/10
info:     border-blue-500/30 shadow-blue-500/10
```

## State Management

```javascript
toastState {
  toasts: ToastData[]              // Queue of toasts
  listeners: Function[]            // React components listening
  
  subscribe(listener)              // Add listener
  emit()                          // Notify all listeners
  add(toast) → id                 // Add toast to queue
  remove(id)                      // Remove toast from queue
  clear()                         // Remove all toasts
}
```

## Animation Classes

Radix UI provides data attributes for animations:

```css
data-[state=open]   → slide-in-from-bottom-full
data-[state=closed] → slide-out-to-right-full, fade-out-80
data-[swipe=move]   → translate-x with swipe distance
data-[swipe=end]    → animate-out
```

## Usage Patterns

### Pattern 1: Simple Toast
```tsx
toast.success({ title: "Saved!" });
```

### Pattern 2: With Description
```tsx
toast.error({
  title: "Error",
  description: "Failed to save changes."
});
```

### Pattern 3: With Action
```tsx
toast.info({
  title: "Update available",
  action: <ToastAction onClick={update}>Update</ToastAction>
});
```

### Pattern 4: Manual Control
```tsx
const id = toast.warning({
  title: "Processing...",
  duration: 0  // No auto-dismiss
});

// Later...
toast.dismiss(id);
```

### Pattern 5: Using Hook
```tsx
const { toast, toasts, dismiss, clear } = useToast();

// Show toast
toast({ title: "Hello" });

// Check active toasts
console.log(toasts);

// Clear all
clear();
```

## Dependencies

### External
- `@radix-ui/react-toast` - Primitives (viewport, root, action, etc.)
- `lucide-react` - Icons (X for close button)
- `clsx` - Class name utility

### Internal
- None (self-contained)

## Browser Support

Same as Radix UI Toast:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Accessibility APIs (NVDA, JAWS, VoiceOver)

## Performance Notes

- Toasts use React portals (no layout thrashing)
- Global state prevents prop drilling
- Auto-cleanup prevents memory leaks
- Efficient re-renders (only when toasts change)
- Max toast limit prevents overflow

## Accessibility Features

- ARIA roles and labels
- Keyboard navigation (Tab, Escape)
- Screen reader announcements
- Focus management
- High contrast support
