# Animations

Motion design patterns and animation guidelines for consistent, performant transitions throughout the application.

## Animation Philosophy

**Principles:**
1. **Purposeful** - Every animation serves a functional purpose
2. **Subtle** - Animations should enhance, not distract
3. **Fast** - Keep durations short (150-300ms for most transitions)
4. **Performant** - Use transform and opacity for GPU acceleration

**When to Animate:**
- State changes (open/close, show/hide)
- User feedback (hover, click, loading)
- Content appearance (fade-in, slide-in)
- Navigation transitions (panel slide, page transitions)

**When NOT to Animate:**
- Instant user actions (checkbox toggle, input focus)
- Frequent updates (live data, counters)
- Accessibility: Respect `prefers-reduced-motion`

---

## Transition Durations

### Standard Durations

| Speed | Duration | Tailwind Class | Usage |
|-------|----------|----------------|-------|
| Instant | 0ms | _(none)_ | State toggles, immediate feedback |
| Fast | 150ms | `duration-150` | **Default** - hover states, dropdowns |
| Normal | 300ms | `duration-300` | Panels, modals, page transitions |
| Slow | 500ms | `duration-500` | Large content changes, page loads |

**Default:**
```tsx
className="transition-all duration-150"
```

**Panel Slide:**
```tsx
className="transition-transform duration-300 ease-out"
```

---

## Easing Functions

### Available Easings

| Easing | Tailwind Class | Usage |
|--------|----------------|-------|
| Linear | `ease-linear` | Progress bars, loading animations |
| Ease (default) | `ease` | General purpose |
| Ease-in | `ease-in` | Elements leaving the screen |
| Ease-out | `ease-out` | **Panels, modals** - elements entering |
| Ease-in-out | `ease-in-out` | Hover states, smooth transitions |

**Recommended:**
- **Panels sliding in**: `ease-out` (starts fast, ends slow)
- **Hover states**: `ease-in-out` (smooth both ways)
- **Modals**: `ease-out`
- **Dropdowns**: `ease-in-out`

---

## Panel Transitions

### Left Panel (NavigationPanel)

**Slide Animation:**

```tsx
<div className={clsx(
  "fixed inset-y-0 left-0 z-40 w-[280px]",
  "transform transition-transform duration-300 ease-out",
  "bg-surface-elevated/95 backdrop-blur-2xl",
  isOpen ? "translate-x-0" : "-translate-x-full"
)}>
```

**Properties Animated:**
- `transform: translateX()` - GPU accelerated

**Timeline:**
- Closed: `translateX(-100%)`
- Opening: 300ms transition with `ease-out`
- Open: `translateX(0)`

### Right Panels (Activity, Settings, AI)

**Slide Animation:**

```tsx
<div className={clsx(
  "fixed inset-y-0 right-0 z-40 w-[480px]",
  "transform transition-transform duration-300 ease-out",
  "bg-surface-elevated/95 backdrop-blur-2xl",
  activePanel ? "translate-x-0" : "translate-x-full"
)}>
```

**Properties Animated:**
- `transform: translateX()` - GPU accelerated

**Timeline:**
- Closed: `translateX(100%)`
- Opening: 300ms transition with `ease-out`
- Open: `translateX(0)`

---

## Backdrop Transitions

### Panel Overlays

**Fade-in backdrop:**

```tsx
{isOpen && (
  <div className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm" />
)}
```

**Note:** No transition on backdrop - instant appearance/disappearance is fine since panel animation provides visual continuity.

**Optional fade transition:**

```tsx
<div className={clsx(
  "fixed inset-0 z-30",
  "bg-overlay/60 backdrop-blur-sm",
  "transition-opacity duration-300",
  isOpen ? "opacity-100" : "opacity-0"
)} />
```

---

## Hover Effects

### Button Hover

**Icon Button:**

```tsx
<button className="icon-button">
  <Icon className="h-4 w-4" />
</button>

// From globals.css:
.icon-button {
  @apply transition-all duration-150
         hover:bg-surface-muted hover:text-ink-700;
}
```

**Properties Animated:**
- `background-color` - 150ms
- `color` - 150ms

**Primary Button:**

```tsx
<button className="rounded-lg bg-accent-500 px-4 py-2 text-white transition duration-150 hover:bg-accent-400">
  Create
</button>
```

**Properties Animated:**
- `background-color` - 150ms

### Card Hover

```tsx
<div className="surface-card transition duration-150 hover:bg-surface-muted">
  {/* Content */}
</div>
```

**Properties Animated:**
- `background-color` - 150ms

### Link Hover

```tsx
<Link
  href="/workspace"
  className="transition-colors hover:text-ink-700"
>
  Notes
</Link>
```

**Properties Animated:**
- `color` - default transition duration (150ms)

---

## Loading Animations

### Spinner (Rotate)

```tsx
import { Loader2 } from "lucide-react";

<Loader2 className="h-4 w-4 animate-spin text-accent-500" />
```

**Tailwind `animate-spin`:**
- Infinite rotation
- Linear easing
- 1s duration
- Uses CSS animation (not transition)

### Skeleton Loading (Pulse)

```tsx
{loading ? (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="h-14 animate-pulse rounded-2xl bg-surface-muted/80"
      />
    ))}
  </div>
) : (
  // Actual content
)}
```

**Tailwind `animate-pulse`:**
- Opacity fades: `1 → 0.5 → 1`
- 2s duration
- Cubic-bezier easing
- Infinite loop

### Progress Bar

```tsx
<div className="h-1 w-full bg-surface-muted rounded-full overflow-hidden">
  <div
    className="h-full bg-accent-500 transition-all duration-300 ease-linear"
    style={{ width: `${progress}%` }}
  />
</div>
```

**Properties Animated:**
- `width` - 300ms linear

---

## Modal Transitions

### Modal Backdrop

```tsx
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 backdrop-blur-sm">
    <div className="transform transition-all duration-300 scale-100">
      {/* Modal content */}
    </div>
  </div>
)}
```

**Scale-in Animation (Optional):**

```tsx
<div className={clsx(
  "transition-all duration-300",
  isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
)}>
```

**Properties Animated:**
- `transform: scale()` - 300ms
- `opacity` - 300ms

---

## Fade Transitions

### Fade-in Content

```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>

// Custom animation in globals.css or Tailwind config:
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 300ms ease-out;
}
```

### Fade-out and Remove

```tsx
<div className={clsx(
  "transition-opacity duration-300",
  isVisible ? "opacity-100" : "opacity-0"
)}>
```

**Removing from DOM after fade:**

```tsx
const [isVisible, setIsVisible] = useState(true);
const [shouldRender, setShouldRender] = useState(true);

const handleRemove = () => {
  setIsVisible(false);
  setTimeout(() => setShouldRender(false), 300); // Match duration
};

{shouldRender && (
  <div className={clsx(
    "transition-opacity duration-300",
    isVisible ? "opacity-100" : "opacity-0"
  )}>
    {/* Content */}
  </div>
)}
```

---

## Gradient Overlays

### Orange Accent Glow (TopNav)

```tsx
<div className="pointer-events-none fixed inset-x-0 top-16 z-20 h-3 bg-gradient-to-b from-orange-400/45 via-orange-400/15 to-transparent blur-md" />
```

**Properties:**
- No animation (static)
- Subtle blur effect
- Gradient opacity fade
- Below TopNav, above content

---

## Active State Transitions

### Navigation Item

```tsx
<Link className={clsx(
  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold",
  "transition-colors",
  isActive
    ? "bg-ink-200 text-ink-900"
    : "text-ink-500 hover:bg-surface-muted hover:text-ink-700"
)}>
```

**Properties Animated:**
- `background-color` - default 150ms
- `color` - default 150ms

---

## Custom Animations

### Tailwind Config Custom Animations

Add to `tailwind.config.ts`:

```ts
export default {
  theme: {
    extend: {
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 300ms ease-out",
        "slide-in-left": "slide-in-left 300ms ease-out",
        "fade-in-up": "fade-in-up 300ms ease-out",
      },
    },
  },
};
```

**Usage:**

```tsx
<div className="animate-slide-in-right">
  {/* Panel content */}
</div>
```

---

## Performance Guidelines

### Use Transform and Opacity

**Good (GPU Accelerated):**
```tsx
// Transform
<div className="transition-transform duration-300">

// Opacity
<div className="transition-opacity duration-300">
```

**Avoid (CPU Intensive):**
```tsx
// Width/Height
<div className="transition-all"> // if animating width/height

// Left/Top positioning
<div className="transition-all"> // if animating position
```

### Will-Change Property

For frequently animated elements:

```tsx
<div className="transition-transform duration-300" style={{ willChange: "transform" }}>
```

**Use sparingly** - only for elements that animate frequently.

---

## Reduced Motion

### Respect User Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Tailwind utility:**

```tsx
<div className="motion-reduce:transition-none">
  {/* No animation for users who prefer reduced motion */}
</div>
```

---

## Animation Cheat Sheet

### Common Patterns

**Panel slide-in (left):**
```tsx
className="transition-transform duration-300 ease-out -translate-x-full data-[state=open]:translate-x-0"
```

**Panel slide-in (right):**
```tsx
className="transition-transform duration-300 ease-out translate-x-full data-[state=open]:translate-x-0"
```

**Fade-in:**
```tsx
className="transition-opacity duration-300 opacity-0 data-[state=open]:opacity-100"
```

**Scale-in:**
```tsx
className="transition-transform duration-300 scale-95 data-[state=open]:scale-100"
```

**Hover lift:**
```tsx
className="transition-transform duration-150 hover:-translate-y-0.5"
```

**Button press:**
```tsx
className="transition-transform duration-75 active:scale-95"
```

**Spinner:**
```tsx
<Loader2 className="animate-spin" />
```

**Skeleton:**
```tsx
<div className="animate-pulse bg-surface-muted" />
```

---

## Implementation Checklist

When adding animations to a new app:

- [ ] Configure reduced motion media query
- [ ] Set default transition duration (150ms)
- [ ] Use `ease-out` for panel transitions
- [ ] Use `transform` and `opacity` for performance
- [ ] Add hover transitions to buttons (150ms)
- [ ] Implement panel slide animations (300ms)
- [ ] Add loading spinners (`animate-spin`)
- [ ] Add skeleton loaders (`animate-pulse`)
- [ ] Test on lower-end devices
- [ ] Verify accessibility with reduced motion

---

**Next Steps:**
- [UI Patterns →](./ui-patterns.md) - Apply animations to UI components
- [Navigation →](./navigation.md) - Panel transition implementation
- [Accessibility →](./advanced-patterns/accessibility.md) - Motion accessibility
