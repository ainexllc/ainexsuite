# UI Patterns

Comprehensive UI component patterns for buttons, forms, cards, modals, and common interface elements.

## Button Patterns

### Primary Button

**Usage:** Main actions, CTAs, form submissions

```tsx
<button className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
  Create Note
</button>
```

**States:**
- Default: `bg-accent-500`
- Hover: `hover:bg-accent-400`
- Focus: `focus-visible:ring-2 focus-visible:ring-accent-500`
- Disabled: `disabled:opacity-60 disabled:cursor-not-allowed`

### Secondary Button

**Usage:** Alternative actions, cancel buttons

```tsx
<button className="rounded-lg border border-outline-subtle bg-surface-elevated px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm transition duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-400">
  Cancel
</button>
```

### Ghost Button

**Usage:** Tertiary actions, subtle interactions

```tsx
<button className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-600 transition duration-150 hover:bg-surface-muted hover:text-ink-800">
  Learn More
</button>
```

### Icon Button

**Usage:** Toolbar actions, compact UIs

```tsx
<button className="icon-button" aria-label="Close">
  <X className="h-4 w-4" />
</button>

/* Utility class from globals.css */
.icon-button {
  @apply grid place-items-center rounded-full p-2
         text-ink-500 transition-all duration-150
         hover:bg-surface-muted hover:text-ink-700
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500;
}
```

### Button Sizes

```tsx
/* Small */
<button className="... px-3 py-1.5 text-xs">Small</button>

/* Medium (Default) */
<button className="... px-4 py-2 text-sm">Medium</button>

/* Large */
<button className="... px-6 py-3 text-base">Large</button>
```

### Button with Icon

```tsx
<button className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white">
  <Plus className="h-4 w-4" />
  Create
</button>
```

### Loading Button

```tsx
<button disabled className="... inline-flex items-center gap-2" aria-busy="true">
  <Loader2 className="h-4 w-4 animate-spin" />
  {isLoading ? "Saving..." : "Save"}
</button>
```

---

## Form Patterns

### Text Input

```tsx
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-medium text-ink-700">
    Email
  </label>
  <input
    id="email"
    type="email"
    placeholder="you@example.com"
    className="w-full rounded-lg border border-outline-subtle bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:bg-surface-elevated dark:text-ink-900"
  />
</div>
```

### Text Input with Error

```tsx
<div className="space-y-2">
  <label htmlFor="password" className="block text-sm font-medium text-ink-700">
    Password
  </label>
  <input
    id="password"
    type="password"
    className="w-full rounded-lg border border-danger bg-white px-3 py-2 text-sm text-ink-900 focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger"
    aria-invalid="true"
    aria-describedby="password-error"
  />
  <p id="password-error" className="text-sm text-danger">
    Password must be at least 8 characters
  </p>
</div>
```

### Textarea

```tsx
<textarea
  rows={4}
  placeholder="Enter description..."
  className="w-full rounded-lg border border-outline-subtle bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-elevated"
/>
```

### Select Dropdown

```tsx
<select className="w-full rounded-lg border border-outline-subtle bg-white px-3 py-2 text-sm text-ink-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-elevated">
  <option>Select option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

### Checkbox

```tsx
<label className="inline-flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="h-4 w-4 rounded border-outline-subtle text-accent-500 focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
  />
  <span className="text-sm text-ink-700">Remember me</span>
</label>
```

### Radio Button

```tsx
<div className="space-y-2">
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      name="frequency"
      value="daily"
      className="h-4 w-4 border-outline-subtle text-accent-500 focus:ring-2 focus:ring-accent-500"
    />
    <span className="text-sm text-ink-700">Daily</span>
  </label>
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      name="frequency"
      value="weekly"
      className="h-4 w-4 border-outline-subtle text-accent-500 focus:ring-2 focus:ring-accent-500"
    />
    <span className="text-sm text-ink-700">Weekly</span>
  </label>
</div>
```

### Toggle Switch

```tsx
<button
  onClick={toggleEnabled}
  className={clsx(
    "relative inline-flex h-6 w-11 items-center rounded-full transition",
    enabled ? "bg-accent-500" : "bg-ink-300"
  )}
  aria-pressed={enabled}
>
  <span
    className={clsx(
      "inline-block h-5 w-5 transform rounded-full bg-white transition",
      enabled ? "translate-x-5" : "translate-x-0.5"
    )}
  />
</button>
```

---

## Card Patterns

### Surface Card

```tsx
<div className="surface-card p-5">
  <h3 className="text-lg font-semibold text-ink-800">Card Title</h3>
  <p className="mt-2 text-sm text-ink-600">Card content goes here.</p>
</div>

/* Utility class */
.surface-card {
  @apply rounded-xl border border-outline-subtle bg-surface-elevated shadow-sm;
}
```

### Interactive Card

```tsx
<button className="w-full rounded-xl border border-outline-subtle bg-surface-elevated p-5 text-left shadow-sm transition hover:bg-surface-muted hover:shadow-md">
  <h3 className="text-lg font-semibold text-ink-800">Clickable Card</h3>
  <p className="mt-2 text-sm text-ink-600">Click to view details</p>
</button>
```

### Card with Header and Footer

```tsx
<div className="surface-card overflow-hidden">
  <div className="border-b border-outline-subtle px-5 py-4">
    <h3 className="text-lg font-semibold text-ink-800">Header</h3>
  </div>
  <div className="p-5">
    <p className="text-sm text-ink-600">Content</p>
  </div>
  <div className="border-t border-outline-subtle bg-surface-muted px-5 py-3">
    <button className="text-sm font-medium text-accent-500">Action</button>
  </div>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <div key={item.id} className="surface-card p-5">
      {/* Card content */}
    </div>
  ))}
</div>
```

---

## Modal Patterns

### Centered Modal

```tsx
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl border border-outline-subtle bg-surface-elevated p-6 shadow-2xl">
      <h2 className="text-xl font-semibold text-ink-900">Modal Title</h2>
      <p className="mt-2 text-sm text-ink-600">Modal content goes here.</p>
      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white">
          Confirm
        </button>
        <button className="flex-1 rounded-lg border border-outline-subtle px-4 py-2 text-sm font-semibold text-ink-700">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

### Confirm Dialog

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 backdrop-blur-sm">
  <div className="w-full max-w-md rounded-2xl border border-outline-subtle bg-surface-elevated p-6 shadow-2xl">
    <AlertTriangle className="h-12 w-12 text-warning" />
    <h2 className="mt-4 text-xl font-semibold text-ink-900">Delete note?</h2>
    <p className="mt-2 text-sm text-ink-600">
      This action cannot be undone. The note will be permanently deleted.
    </p>
    <div className="mt-6 flex gap-3">
      <button className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white">
        Delete
      </button>
      <button className="flex-1 rounded-lg border border-outline-subtle px-4 py-2 text-sm font-semibold text-ink-700">
        Cancel
      </button>
    </div>
  </div>
</div>
```

---

## Empty State Patterns

### Basic Empty State

```tsx
<div className="rounded-2xl bg-surface-muted/40 px-6 py-8 text-center">
  <Archive className="mx-auto h-12 w-12 text-ink-400" />
  <h3 className="mt-4 text-lg font-semibold text-ink-700">No archived notes</h3>
  <p className="mt-2 text-sm text-muted">
    Notes you archive will appear here for easy access.
  </p>
</div>
```

### Empty State with Action

```tsx
<div className="rounded-2xl bg-surface-muted/40 px-6 py-8 text-center">
  <StickyNote className="mx-auto h-12 w-12 text-ink-400" />
  <h3 className="mt-4 text-lg font-semibold text-ink-700">No notes yet</h3>
  <p className="mt-2 text-sm text-muted">
    Get started by creating your first note.
  </p>
  <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white">
    <Plus className="h-4 w-4" />
    Create Note
  </button>
</div>
```

---

## Loading State Patterns

### Skeleton Loader

```tsx
{loading ? (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-muted/80" />
    ))}
  </div>
) : (
  <div>{/* Actual content */}</div>
)}
```

### Spinner

```tsx
<div className="flex items-center justify-center py-12">
  <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
</div>
```

### Inline Loading

```tsx
<div className="flex items-center gap-2 text-sm text-ink-600">
  <Loader2 className="h-4 w-4 animate-spin" />
  Loading...
</div>
```

---

## Badge Patterns

### Status Badge

```tsx
<span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent-600 dark:bg-accent-900/30 dark:text-accent-300">
  <CheckCircle2 className="h-3 w-3" />
  Pinned
</span>
```

### Count Badge

```tsx
<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">
  3
</span>
```

### Dot Badge

```tsx
<span className="inline-flex items-center gap-2">
  <span className="h-2 w-2 rounded-full bg-success" />
  Active
</span>
```

---

## Dropdown Menu Pattern

```tsx
<div className="relative">
  <button onClick={() => setIsOpen(prev => !prev)}>
    Menu
  </button>

  {isOpen && (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-outline-subtle bg-surface-elevated shadow-lg">
        <div className="p-1">
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-surface-muted">
            <Icon className="h-4 w-4" />
            Menu Item
          </button>
        </div>
      </div>
    </>
  )}
</div>
```

---

## Toast Notification Pattern

```tsx
import { Toaster } from "@/components/ui/toaster";

// In layout or app root
<Toaster />

// Show toast
import { toast } from "@/components/ui/use-toast";

toast({
  title: "Success",
  description: "Note saved successfully",
});

// Error toast
toast({
  title: "Error",
  description: "Failed to save note",
  variant: "destructive",
});
```

---

## Tooltip Pattern

```tsx
<div className="group relative inline-block">
  <button className="icon-button">
    <Info className="h-4 w-4" />
  </button>
  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition group-hover:opacity-100">
    <div className="rounded-lg bg-ink-900 px-3 py-2 text-xs text-white shadow-lg">
      Tooltip text
    </div>
  </div>
</div>
```

---

## Search Input Pattern

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
  <input
    type="search"
    placeholder="Search..."
    className="w-full rounded-full bg-surface-muted/80 py-2 pl-10 pr-4 text-sm focus:bg-surface-muted focus:outline-none"
  />
</div>
```

---

## Tabs Pattern

```tsx
<div className="border-b border-outline-subtle">
  <div className="flex gap-1">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={clsx(
          "px-4 py-2 text-sm font-medium transition",
          activeTab === tab.id
            ? "border-b-2 border-accent-500 text-accent-500"
            : "text-ink-600 hover:text-ink-800"
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

---

## Implementation Checklist

- [ ] Create button component variants (primary, secondary, ghost, icon)
- [ ] Implement form components with error states
- [ ] Build card patterns with surface-card utility
- [ ] Create modal/dialog components with backdrop
- [ ] Design empty states for all data views
- [ ] Implement loading skeletons for async content
- [ ] Add badge components for status indicators
- [ ] Build dropdown menus with proper z-index
- [ ] Set up toast notification system
- [ ] Create accessible tooltips
- [ ] Implement tabs for content organization

---

**Next Steps:**
- [Components →](./components.md) - Component implementation details
- [Design System →](./design-system.md) - Design tokens for styling
- [Accessibility →](./advanced-patterns/accessibility.md) - Accessible UI patterns
