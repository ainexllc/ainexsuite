# Icons

Complete icon system reference using Lucide React. Every icon used in NoteNex with sizing conventions and usage context.

## Icon Library

**Package**: `lucide-react` (v0.468.0)

Lucide provides a comprehensive set of clean, consistent SVG icons. All icons are tree-shakeable and support custom sizing and styling.

**Installation:**

```bash
npm install lucide-react
```

## Icon Inventory

### Navigation Icons

| Icon | Component | Usage | Locations |
|------|-----------|-------|-----------|
| 📋 | `StickyNote` | Notes/main workspace | Primary nav, note cards |
| 🔔 | `BellRing` | Reminders & notifications | Primary nav, reminder UI |
| 👥 | `Users` | Shared/collaboration | Primary nav, sharing UI |
| ⏰ | `Clock8` | Focus mode & time | Primary nav, focus UI |
| ✨ | `Sparkles` | AI features | Secondary nav, AI assistant |
| 📦 | `Archive` | Archived items | Secondary nav, archive UI |
| 🗑️ | `Trash2` | Deleted items | Secondary nav, trash UI |
| 🏷️ | `Tag` | Labels/tags | Label UI, tagging |

### Action Icons

| Icon | Component | Usage | Context |
|------|-----------|-------|---------|
| 📌 | `Pin` | Pin item | Note cards, pin action |
| 📍 | `PinOff` | Unpin item | Note cards, unpin action |
| 🎨 | `Palette` | Color picker | Note editor, color selector |
| 🖼️ | `LayoutGrid` | Pattern picker | Note editor, pattern selector |
| ✅ | `CheckSquare` | Checklist mode | Note editor, checklist toggle |
| 🖼️ | `Image` | Image attachment | Note editor, file upload |
| 🔗 | `Share2` | Share action | Note editor, sharing |
| 💾 | `Save` | Save action | Forms, editors |

### UI Icons

| Icon | Component | Usage | Context |
|------|-----------|-------|---------|
| ☰ | `Menu` | Hamburger menu | TopNav, open nav panel |
| 🔍 | `Search` | Search input | TopNav, search bar |
| ❌ | `X` | Close/clear | Modals, search clear, panel close |
| ✓ | `Check` | Confirm/success | Success states, checkboxes |
| ⚠️ | `AlertTriangle` | Warning/alert | Confirm modals, warnings |
| ⟳ | `Loader2` | Loading spinner | Loading states (with `animate-spin`) |
| ⌄ | `ChevronDown` | Dropdown indicator | Profile dropdown, selects |
| 📨 | `Send` | Send/submit | AI assistant, form submit |
| 💬 | `MessageSquarePlus` | Feedback | Feedback button |

### Status Icons

| Icon | Component | Usage | Context |
|------|-----------|-------|---------|
| ✓ | `CheckCircle2` | Pinned/complete | Activity feed, status badges |
| ☑️ | `ListChecks` | Checklist type | Activity feed, note type badge |
| 🌙 | `Moon` | Dark mode | Theme toggle |
| ☀️ | `Sun` | Light mode | Theme toggle |
| 🛡️ | `Shield` | Security/privacy | Settings, privacy options |
| 📱 | `Phone` | Phone/SMS | Settings, notifications |
| ✉️ | `Mail` | Email | Settings, notifications |
| 📥 | `Inbox` | Inbox/default | Settings, general |

## Icon Sizing Patterns

### Standard Sizes

| Context | Tailwind Class | Pixels | Usage |
|---------|----------------|---------|-------|
| Tiny | `h-3 w-3` | 12px | Inline badges, small indicators |
| Small | `h-3.5 w-3.5` | 14px | Inline text icons, compact UI |
| Default | `h-4 w-4` | 16px | **Most common** - buttons, nav, inputs |
| Medium | `h-5 w-5` | 20px | Larger buttons, headings |
| Large | `h-6 w-6` | 24px | Section headers, large buttons |
| XL | `h-8 w-8` | 32px | Feature icons, empty states |
| 2XL | `h-12 w-12` | 48px | Large empty states, modals |

### Usage by Component

**TopNav:**
```tsx
<Menu className="h-5 w-5" />
<Search className="h-4 w-4" />
<Sparkles className="h-4 w-4" />
```

**Navigation Panel:**
```tsx
// Nav item icons
<Icon className="h-4 w-4" />

// Label dots
<span className="h-2.5 w-2.5 rounded-full" />

// Create label icon
<Tag className="h-3.5 w-3.5" />
```

**Note Cards:**
```tsx
// Action buttons
<Pin className="h-4 w-4" />
<Archive className="h-4 w-4" />
<Palette className="h-4 w-4" />
```

**Modals:**
```tsx
// Warning icon
<AlertTriangle className="h-12 w-12" />

// Close button
<X className="h-4 w-4" />
```

**Loading Spinners:**
```tsx
<Loader2 className="h-4 w-4 animate-spin" />
```

## Icon Color Patterns

### By State

**Default (Inactive):**
```tsx
<Icon className="text-ink-500" />
```

**Hover:**
```tsx
<Icon className="text-ink-500 hover:text-ink-700" />
```

**Active:**
```tsx
<Icon className="text-ink-900" />
```

**Accent (Primary Action):**
```tsx
<Icon className="text-accent-500" />
```

**Semantic Colors:**
```tsx
<AlertTriangle className="text-warning" />
<Check className="text-success" />
<X className="text-danger" />
```

### By Component

**Icon Button:**
```tsx
<button className="icon-button">
  <Icon className="h-4 w-4" /> {/* Color managed by .icon-button class */}
</button>
```

**Nav Item (Active):**
```tsx
<Icon className="h-4 w-4 text-ink-900" />
```

**Nav Item (Inactive):**
```tsx
<Icon className="h-4 w-4 text-ink-600" />
```

**AI Assistant Button:**
```tsx
<Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-300" />
```

## Import Pattern

**Single Import:**
```tsx
import { Icon } from "lucide-react";
```

**Multiple Imports:**
```tsx
import {
  Menu,
  Search,
  Pin,
  Archive,
  Trash2,
  X,
} from "lucide-react";
```

**All Common Icons:**
```tsx
import {
  // Navigation
  Menu,
  Search,
  StickyNote,
  BellRing,
  Users,
  Clock8,
  Sparkles,
  Archive,
  Trash2,
  Tag,

  // Actions
  Pin,
  PinOff,
  Palette,
  LayoutGrid,
  CheckSquare,
  Image,
  Share2,

  // UI
  X,
  Check,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Send,
  MessageSquarePlus,

  // Status
  CheckCircle2,
  ListChecks,
  Moon,
  Sun,
} from "lucide-react";
```

## Usage Examples

### Icon Button

```tsx
<button
  className="icon-button"
  aria-label="Close"
>
  <X className="h-4 w-4" />
</button>
```

### Loading Spinner

```tsx
{isLoading && (
  <Loader2 className="h-4 w-4 animate-spin text-accent-500" />
)}
```

### Empty State

```tsx
<div className="text-center">
  <Archive className="mx-auto h-12 w-12 text-ink-400" />
  <p className="mt-2">No archived notes</p>
</div>
```

### Status Badge

```tsx
<span className="inline-flex items-center gap-1">
  <CheckCircle2 className="h-3.5 w-3.5" />
  Pinned
</span>
```

### Nav Item with Icon

```tsx
<Link href="/workspace" className="flex items-center gap-3">
  <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-muted">
    <StickyNote className="h-4 w-4" />
  </span>
  <span>Notes</span>
</Link>
```

## Accessibility

### Always Include aria-label

For icon-only buttons:

```tsx
<button aria-label="Delete note">
  <Trash2 className="h-4 w-4" />
</button>
```

### Hide Decorative Icons

For icons accompanying text:

```tsx
<button>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
  Delete
</button>
```

### Loading States

```tsx
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
  ) : (
    <Send className="h-4 w-4" aria-hidden="true" />
  )}
  <span>{isLoading ? "Sending..." : "Send"}</span>
</button>
```

## Customizing for Your App

When adapting this system for a new app (like TaskNex or HabitNex):

1. **Review navigation icons** - swap to match your features:
   ```tsx
   // NoteNex
   { icon: StickyNote, label: "Notes" }

   // TaskNex
   { icon: CheckSquare, label: "Tasks" }

   // HabitNex
   { icon: BarChart3, label: "Habits" }
   ```

2. **Update action icons** - match your core actions:
   ```tsx
   // NoteNex: Pin notes
   <Pin className="h-4 w-4" />

   // TaskNex: Mark complete
   <CheckCircle2 className="h-4 w-4" />

   // HabitNex: Log completion
   <CalendarCheck className="h-4 w-4" />
   ```

3. **Keep UI icons consistent** - Menu, X, Search, Loader2, etc. stay the same

4. **Maintain sizing patterns** - Don't change icon sizes, keep consistency

## Icon Reference Quick Copy

```tsx
// Most commonly used icons (copy/paste ready)
import {
  Menu,           // Hamburger menu
  Search,         // Search input
  X,              // Close/clear
  Pin, PinOff,    // Pin actions
  Archive,        // Archive
  Trash2,         // Delete
  Sparkles,       // AI features
  Loader2,        // Loading (with animate-spin)
  Check,          // Success
  AlertTriangle,  // Warning
  ChevronDown,    // Dropdowns
} from "lucide-react";
```

---

**Next Steps:**
- [Animations →](./animations.md) - Icon animations and transitions
- [UI Patterns →](./ui-patterns.md) - Icons in button and UI patterns
- [Accessibility →](./advanced-patterns/accessibility.md) - Icon accessibility best practices
