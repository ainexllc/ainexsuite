# Layouts

Layout architecture patterns, container systems, and responsive grid layouts used throughout the application.

## Layout Architecture

### Three-Layer System

```
┌──────────────────────────────────────────────────────────┐
│ AppShell (Root Container)                                │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ TopNav (Fixed Header)                                │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Main Content Area                                    │ │
│ │ ┌────────────────────────────────────────────────┐   │ │
│ │ │ Centered Shell (max-width: 1280px)             │   │ │
│ │ │ ┌────────────────────────────────────────────┐ │   │ │
│ │ │ │ Container (responsive max-width)           │ │   │ │
│ │ │ │ ┌────────────────────────────────────────┐ │ │   │ │
│ │ │ │ │ Page Content                           │ │ │   │ │
│ │ │ │ └────────────────────────────────────────┘ │ │   │ │
│ │ │ └────────────────────────────────────────────┘ │   │ │
│ │ └────────────────────────────────────────────────┘   │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Layers:**
1. **AppShell** - Root wrapper with navigation panels
2. **Centered Shell** - Max 1280px centered container
3. **Container** - Responsive content width wrapper
4. **Page Content** - Your actual content

---

## Centered Shell

**Class**: `.centered-shell`

Maximum 1280px container with auto margins and responsive padding.

**Implementation** (from `globals.css`):

```css
.centered-shell {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;
  padding-bottom: 0;
}

@media (min-width: 1024px) {
  .centered-shell {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}
```

**Responsive Padding:**
- Mobile/Tablet (< 1024px): No padding
- Desktop (>= 1024px): `1.5rem` horizontal, `2rem` vertical

**Usage:**

```tsx
<main className="flex-1 overflow-x-hidden pt-16">
  <div className="centered-shell">
    {children}
  </div>
</main>
```

---

## Container Component

**File**: `src/components/layout/container.tsx`

Responsive width wrapper with variants for different content types.

### Variants

#### Default Container (Content-Focused)

**Best for**: Articles, forms, content pages

| Breakpoint | Max Width |
|------------|-----------|
| xs | 100% |
| sm (640px+) | 560px |
| md (768px+) | 720px |
| lg (1024px+) | 820px |
| xl (1280px+) | 880px |

```tsx
<Container variant="default">
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</Container>
```

#### Wide Container (Dashboards)

**Best for**: Dashboards, data tables, wide layouts

| Breakpoint | Max Width |
|------------|-----------|
| xs | 100% |
| sm (640px+) | 700px |
| md (768px+) | 1120px |
| lg (1024px+) | 1280px |
| xl (1280px+) | 1440px |

```tsx
<Container variant="wide">
  <Dashboard />
</Container>
```

#### Narrow Container (Note Board)

**Best for**: Masonry grids, note boards, card layouts

| Breakpoint | Max Width |
|------------|-----------|
| xs | 100% |
| sm (640px+) | 520px |
| md (768px+) | 720px |
| lg (1024px+) | 1024px |
| xl (1280px+) | 1200px |

```tsx
<Container variant="narrow">
  <NoteBoard />
</Container>
```

#### Full Container (No Constraints)

**Best for**: Full-width heroes, full-bleed images

```tsx
<Container variant="full" padding="none">
  <FullWidthHero />
</Container>
```

### Padding Options

**Default Padding** (`padding="default"`):
- Mobile: `px-4` (16px horizontal)
- Tablet: `px-6` (24px horizontal)
- Desktop: `px-8` (32px horizontal)

**No Padding** (`padding="none"`):
- No padding on any breakpoint

---

## Page Layouts

### Standard Page

```tsx
// app/workspace/page.tsx
export default function WorkspacePage() {
  return (
    <Container variant="narrow">
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Workspace</h1>
        </header>
        <NoteBoard />
      </div>
    </Container>
  );
}
```

### Wide Dashboard Page

```tsx
// app/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <Container variant="wide">
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Analytics</h1>
        </header>
        <DashboardGrid />
      </div>
    </Container>
  );
}
```

### Full-Width Landing Page

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <>
      <Container variant="full" padding="none">
        <Hero />
      </Container>
      <Container variant="default">
        <Features />
      </Container>
    </>
  );
}
```

---

## Grid Layouts

### Masonry Grid (Note Board)

**CSS Implementation:**

```css
/* globals.css */
.note-board-columns {
  column-count: 1;
  column-gap: 1rem;
}

@container board (min-width: 640px) {
  .note-board-columns {
    column-count: 2;
    column-gap: 1.25rem;
  }
}

@container board (min-width: 960px) {
  .note-board-columns {
    column-count: 3;
    column-gap: 1.5rem;
  }
}
```

**Usage:**

```tsx
<div className="cq-board">
  <div className="note-board-columns">
    {notes.map(note => (
      <div key={note.id} className="break-inside-avoid mb-4">
        <NoteCard note={note} />
      </div>
    ))}
  </div>
</div>
```

**Responsive Columns:**
- Mobile (< 640px): 1 column, 16px gap
- Tablet (640-959px): 2 columns, 20px gap
- Desktop (>= 960px): 3 columns, 24px gap

### Standard Grid

**Tailwind Grid:**

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>
```

**Responsive:**
- Mobile: 1 column
- Tablet (sm): 2 columns
- Desktop (lg): 3 columns

---

## Container Queries

### Named Containers

From `globals.css`:

```css
.cq-shell { container-name: shell; }
.cq-nav { container-name: nav; }
.cq-sidebar { container-name: sidebar; }
.cq-board { container-name: board; }
.cq-inspector { container-name: inspector; }
.cq-utility { container-name: utility; }
.cq-ribbon { container-name: ribbon; }
.cq-canvas { container-name: canvas; }
.cq-footer { container-name: footer; }
```

**All containers:**
```css
container-type: inline-size;
```

### Container Query Usage

**TopNav responsive search:**

```css
@container nav (max-width: 640px) {
  .top-nav-search-input {
    display: none;
  }
  .top-nav-search-button {
    display: inline-flex;
  }
}
```

**Note board columns:**

```css
@container board (min-width: 640px) {
  .note-board-columns {
    column-count: 2;
  }
}
```

**Component usage:**

```tsx
<div className="cq-board">
  {/* Elements inside respond to this container's width */}
  <div className="note-board-columns">
    {/* Columns adjust based on container width, not viewport */}
  </div>
</div>
```

---

## Spacing System

### Page Spacing

**Vertical spacing between sections:**

```tsx
<div className="space-y-6">
  <section>{/* Section 1 */}</section>
  <section>{/* Section 2 */}</section>
  <section>{/* Section 3 */}</section>
</div>
```

**Common values:**
- `space-y-4` (16px) - Tight spacing
- `space-y-6` (24px) - **Default page sections**
- `space-y-8` (32px) - Loose spacing

### Component Spacing

**Internal padding:**
- Cards: `p-5` (20px) or `p-6` (24px)
- Panels: `px-5 py-4` (header), `p-6` (content)
- Modals: `p-6` (24px)

**Gaps in flex/grid:**
- Tight: `gap-2` (8px)
- Default: `gap-4` (16px)
- Loose: `gap-6` (24px)

---

## Responsive Patterns

### Mobile-First Approach

```tsx
<div className="
  px-4           /* Mobile: 16px padding */
  sm:px-6        /* Tablet: 24px padding */
  lg:px-8        /* Desktop: 32px padding */
">
```

### Hide/Show Elements

```tsx
{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">

{/* Show on mobile, hide on desktop */}
<div className="block lg:hidden">

{/* Show on tablet and up */}
<div className="hidden sm:block">
```

### Responsive Flexbox

```tsx
<div className="
  flex
  flex-col         /* Mobile: stack vertically */
  lg:flex-row      /* Desktop: horizontal layout */
  gap-4
">
```

---

## Z-Index System

### Layering Order

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Default content |
| Dropdown | 10 | Dropdowns, tooltips |
| Sticky | 20 | Sticky headers |
| Fixed Nav | 30 | TopNav, overlays |
| Panels | 40 | Slide-out panels |
| Modal Backdrop | 50 | Modal backgrounds |
| Modal Content | 60 | Modal dialogs |
| Toast | 100 | Toast notifications |

**Usage:**

```tsx
<header className="fixed inset-x-0 top-0 z-30">  /* TopNav */
<div className="fixed inset-y-0 left-0 z-40">     /* Panel */
<div className="fixed inset-0 z-50">              /* Modal backdrop */
```

---

## Overflow Handling

### Scroll Containers

**Panel scroll:**

```tsx
<div className="flex-1 overflow-y-auto">
  {/* Scrollable content */}
</div>
```

**Hide horizontal overflow:**

```tsx
<main className="overflow-x-hidden">
```

**Custom scrollbars** (from `globals.css`):

```css
@media (pointer: fine) {
  ::-webkit-scrollbar {
    width: 0.75rem;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.5);
    border-radius: 999px;
  }
}
```

---

## Implementation Checklist

When setting up layouts in a new app:

- [ ] Wrap app in AppShell component
- [ ] Use `.centered-shell` class in main content area
- [ ] Import and use Container component with appropriate variant
- [ ] Set up container queries with `.cq-*` classes
- [ ] Configure masonry grid for card layouts
- [ ] Implement responsive padding (mobile-first)
- [ ] Set up z-index system for overlays
- [ ] Configure custom scrollbar styles
- [ ] Test on mobile, tablet, and desktop breakpoints
- [ ] Verify overflow behavior on all screen sizes

---

**Next Steps:**
- [Components →](./components.md) - Container component details
- [Navigation →](./navigation.md) - AppShell and panel layouts
- [UI Patterns →](./ui-patterns.md) - Content layout patterns
