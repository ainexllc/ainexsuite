# Navigation

Complete navigation architecture including top nav, slide-out panels, routing, and responsive behavior.

## Navigation Structure

```
┌────────────────────────────────────────────────────────────┐
│  TopNav (Fixed, h-16, z-30)                               │
│  [Menu] [Logo]     [Search...]       [AI] [Profile]       │
└────────────────────────────────────────────────────────────┘
       │                                              │
       │                                              │
       ▼                                              ▼
┌──────────────┐                              ┌──────────────┐
│ Left Panel   │                              │ Right Panels │
│ (280px)      │                              │ (480px)      │
│              │                              │              │
│ WORKSPACE    │                              │ • Activity   │
│ • Notes      │                              │ • Settings   │
│ • Reminders  │                              │ • AI Assist  │
│ • Focus      │                              │              │
│ • Shared     │                              │              │
│              │                              │              │
│ UTILITIES    │                              │              │
│ • Ideas [AI] │                              │              │
│ • Archive    │                              │              │
│ • Trash      │                              │              │
│              │                              │              │
│ LABELS       │                              │              │
│ ○ Work       │                              │              │
│   ○ Projects │                              │              │
│ ○ Personal   │                              │              │
│              │                              │              │
│ + New label  │                              │              │
└──────────────┘                              └──────────────┘
```

## Top Navigation (TopNav)

### Specifications

| Property | Value |
|----------|-------|
| Height | `64px` (h-16) |
| Position | `fixed inset-x-0 top-0` |
| Z-index | `30` |
| Max-width | `1280px` |
| Background | `bg-[#050507]/95` (dark), `bg-white/92` (light) |
| Backdrop | `backdrop-blur-2xl` |
| Shadow | Orange glow in dark mode |

### Layout Sections

**Three-column layout:**

```tsx
<header className="fixed inset-x-0 top-0 z-30">
  <div className="mx-auto flex h-16 max-w-[1280px] items-center px-4 sm:px-6">
    {/* Left: Menu + Logo */}
    <div className="flex items-center gap-3">
      <button>☰</button>
      <LogoWordmark />
    </div>

    {/* Center: Search (flex-1) */}
    <div className="mx-4 flex-1">
      <SearchInput />
    </div>

    {/* Right: Actions (ml-auto) */}
    <div className="ml-auto flex items-center gap-2">
      <button>✨ AI</button>
      <ProfileDropdown />
    </div>
  </div>
</header>
```

### Responsive Behavior

**Mobile (< 640px via container query):**
- Logo hidden: `hidden sm:block`
- Search input collapsed to icon
- Actions compressed (gap reduced)

**Desktop (>= 640px):**
- All elements visible
- Full search bar
- Actions with labels

**Container Query:**
```tsx
<div className="cq-nav">
  {/* Elements respond to container width */}
</div>
```

### Search Bar States

**Default:**
```tsx
<div className="flex items-center gap-2 rounded-full bg-surface-muted/80 px-3 py-1">
  <Search className="h-4 w-4" />
  <input placeholder="Search notes..." />
</div>
```

**With Query (shows clear button):**
```tsx
{searchQuery && (
  <button onClick={() => setSearchQuery("")}>
    <X className="h-4 w-4" />
  </button>
)}
```

**Mobile (icon-only):**
```tsx
<button className="top-nav-search-button">
  <Search className="h-4 w-4" />
</button>
```

---

## Left Panel (NavigationPanel)

### Specifications

| Property | Value |
|----------|-------|
| Width | `280px` (w-[280px]) |
| Position | `fixed inset-y-0 left-0` |
| Z-index | `40` |
| Border radius | `rounded-r-3xl` (24px right corners) |
| Background | `bg-surface-elevated/95 backdrop-blur-2xl` |
| Border | `border-r border-outline-subtle/60` |
| Transform | `translate-x-0` (open), `-translate-x-full` (closed) |
| Transition | `duration-300 ease-out` |

### Panel Structure

```tsx
<div className="fixed inset-y-0 left-0 z-40 w-[280px]">
  {/* Header */}
  <div className="border-b border-outline-subtle/40 px-5 py-4">
    <span>Navigation</span>
    <button onClick={onClose}>
      <X className="h-4 w-4" />
    </button>
  </div>

  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto px-3">
    <NavSection title="WORKSPACE">
      {/* Primary nav items */}
    </NavSection>

    <NavSection title="UTILITIES">
      {/* Secondary nav items */}
    </NavSection>

    <NavSection title="LABELS">
      {/* Label tree */}
    </NavSection>
  </div>
</div>
```

### Nav Item Styling

**Active Item:**
```tsx
<Link className="bg-ink-200 text-ink-900">
  <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-300/80">
    <Icon className="h-4 w-4" />
  </span>
  <span>Label</span>
</Link>
```

**Inactive Item:**
```tsx
<Link className="text-ink-500 hover:bg-surface-muted hover:text-ink-700">
  <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-muted">
    <Icon className="h-4 w-4 text-ink-600" />
  </span>
  <span>Label</span>
</Link>
```

### Active State Detection

```tsx
const isActive = pathname === href ||
  (href !== "/" && pathname?.startsWith(`${href}/`));
```

### Opening/Closing

**Trigger:**
```tsx
// Open from hamburger menu
<button onClick={() => setNavOpen(true)}>
  <Menu />
</button>

// Close from X button or overlay
<button onClick={() => setNavOpen(false)}>
  <X />
</button>
```

**Overlay:**
```tsx
{isNavOpen && (
  <div
    className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
    onClick={() => setNavOpen(false)}
  />
)}
```

**Keyboard:**
- Escape key closes panel (handled in AppShell)

---

## Right Panels

### Specifications

| Property | Value |
|----------|-------|
| Width | `480px` (w-[480px]) |
| Position | `fixed inset-y-0 right-0` |
| Z-index | `40` |
| Border radius | `rounded-l-3xl` (24px left corners) |
| Background | `bg-surface-elevated/95 backdrop-blur-2xl` |
| Border | `border-l border-outline-subtle/60` |
| Transform | `translate-x-0` (open), `translate-x-full` (closed) |
| Transition | `duration-300 ease-out` |

### Panel Types

**Activity Center:**
- Recent note updates
- Pinned count
- Activity feed

**Settings:**
- Text notifications
- Reminder channels
- Quiet hours
- Workspace tuning

**AI Assistant:**
- Chat interface
- Suggested prompts
- Message input

### Panel State Management

```tsx
type ActivePanel = "notifications" | "settings" | "ai-assistant" | null;

const [activePanel, setActivePanel] = useState<ActivePanel>(null);

// Toggle panel
const togglePanel = (panel: Exclude<ActivePanel, null>) => {
  setActivePanel(prev => prev === panel ? null : panel);
};
```

### Panel Triggers

**From TopNav:**
```tsx
<TopNav
  onOpenActivity={() => togglePanel("notifications")}
  onOpenSettings={() => togglePanel("settings")}
  onOpenAiAssistant={() => togglePanel("ai-assistant")}
/>
```

**From ProfileDropdown:**
```tsx
<ProfileDropdown
  onOpenSettings={() => {
    setProfileOpen(false);
    togglePanel("settings");
  }}
  onOpenActivity={() => {
    setProfileOpen(false);
    togglePanel("notifications");
  }}
/>
```

### Panel Header

```tsx
<div className="border-b border-outline-subtle/40 px-5 py-4">
  <span className="text-sm font-semibold">
    {activePanel === "notifications" ? "Activity Center" :
     activePanel === "settings" ? "Settings" :
     "AI Assistant"}
  </span>
  <button onClick={() => setActivePanel(null)}>
    <X className="h-4 w-4" />
  </button>
</div>
```

---

## Navigation Items

### Primary Navigation

**File**: `src/lib/constants/navigation.ts`

```tsx
export const PRIMARY_NAV_ITEMS = [
  {
    href: "/workspace",
    label: "Notes",
    icon: StickyNote,
  },
  {
    href: "/reminders",
    label: "Reminders",
    icon: BellRing,
  },
  {
    href: "/focus",
    label: "Focus Mode",
    icon: Clock8,
  },
  {
    href: "/shared",
    label: "Shared",
    icon: Users,
  },
];
```

### Secondary Navigation

```tsx
export const SECONDARY_NAV_ITEMS = [
  {
    href: "/ideas",
    label: "Ideas Lab",
    icon: Sparkles,
    badge: "AI",
  },
  {
    href: "/archive",
    label: "Archive",
    icon: Archive,
  },
  {
    href: "/trash",
    label: "Trash",
    icon: Trash2,
  },
];
```

### Customization for New Apps

**TaskNex Example:**

```tsx
export const PRIMARY_NAV_ITEMS = [
  { href: "/workspace", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/team", label: "Team", icon: Users },
];

export const SECONDARY_NAV_ITEMS = [
  { href: "/insights", label: "AI Insights", icon: Sparkles, badge: "AI" },
  { href: "/completed", label: "Completed", icon: CheckCircle2 },
  { href: "/trash", label: "Trash", icon: Trash2 },
];
```

---

## Routing

### File-Based Routing

Using Next.js 15 App Router:

```
src/app/
├── page.tsx              → /
├── workspace/
│   └── page.tsx          → /workspace
├── reminders/
│   └── page.tsx          → /reminders
├── focus/
│   └── page.tsx          → /focus
├── shared/
│   └── page.tsx          → /shared
├── ideas/
│   └── page.tsx          → /ideas
├── archive/
│   └── page.tsx          → /archive
└── trash/
    └── page.tsx          → /trash
```

### Navigation Component

```tsx
import Link from "next/link";
import type { Route } from "next";

<Link href={href as Route}>
  {label}
</Link>
```

### Programmatic Navigation

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

// Navigate
router.push("/workspace");

// Refresh
router.refresh();

// Back
router.back();
```

---

## Keyboard Shortcuts

**Implemented:**
- `Escape` - Close active panel (left or right)

**Recommended additions:**
- `Cmd/Ctrl + K` - Focus search
- `Cmd/Ctrl + /` - Toggle navigation panel
- `Cmd/Ctrl + ,` - Open settings
- `N` - New note/item
- `?` - Show keyboard shortcuts

**Implementation:**

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Close panels
    if (e.key === "Escape") {
      setActivePanel(null);
      setNavOpen(false);
    }

    // Focus search (Cmd/Ctrl + K)
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchInputRef.current?.focus();
    }

    // Toggle nav (Cmd/Ctrl + /)
    if ((e.metaKey || e.ctrlKey) && e.key === "/") {
      e.preventDefault();
      setNavOpen(prev => !prev);
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

## Mobile Behavior

### Navigation Panel

**Mobile (< 1024px):**
- Panel overlays content
- Backdrop visible
- Full-height
- Swipe to close (can be added with gestures library)

**Desktop (>= 1024px):**
- Same behavior (slide-out overlay)
- Keyboard shortcuts more prominent

### Top Nav

**Mobile:**
- Logo hidden
- Search collapses to icon
- Actions icon-only

**Tablet:**
- Logo visible
- Full search bar
- Actions with labels

**Desktop:**
- All elements visible
- Spacious layout
- Larger touch targets optional

---

## Z-Index Layering

**Navigation Z-Index Stack:**

```
┌─────────────────────────────────────┐
│ Panels (z-40)                       │  ← Slide-out panels
├─────────────────────────────────────┤
│ Overlays (z-30)                     │  ← Panel backdrops
├─────────────────────────────────────┤
│ TopNav (z-30)                       │  ← Fixed top nav
├─────────────────────────────────────┤
│ Content (z-0)                       │  ← Page content
└─────────────────────────────────────┘
```

**Full Stack:**
- Toast notifications: `z-100`
- Modal content: `z-60`
- Modal backdrop: `z-50`
- Panels: `z-40`
- Panel overlays: `z-30`
- TopNav: `z-30`
- Sticky elements: `z-20`
- Dropdowns: `z-10`
- Base content: `z-0`

---

## Transitions

### Panel Slide Animation

```tsx
<div className={clsx(
  "fixed inset-y-0 left-0 z-40 w-[280px]",
  "transition-transform duration-300 ease-out",
  isOpen ? "translate-x-0" : "-translate-x-full"
)}>
```

**Timing:**
- Duration: `300ms`
- Easing: `ease-out`
- Property: `transform`

### Backdrop Fade

```tsx
<div className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm" />
```

**Properties:**
- Background opacity: `60%`
- Backdrop blur: `sm` (4px)
- Instant appearance (no transition needed)

---

## Accessibility

### Keyboard Navigation

**Tab Order:**
1. TopNav menu button
2. TopNav logo (if link)
3. TopNav search input
4. TopNav AI button
5. TopNav profile button
6. Panel content (when open)
7. Main content

**Focus Trapping:**

```tsx
// When panel opens, focus first interactive element
useEffect(() => {
  if (isOpen) {
    firstButtonRef.current?.focus();
  }
}, [isOpen]);
```

### ARIA Labels

```tsx
// Menu button
<button aria-label="Toggle navigation" aria-expanded={isNavOpen}>
  <Menu />
</button>

// Close button
<button aria-label="Close navigation" onClick={onClose}>
  <X />
</button>

// Nav items
<Link href="/workspace" aria-current={isActive ? "page" : undefined}>
  Notes
</Link>
```

### Screen Reader Announcements

```tsx
<nav aria-label="Main navigation">
  <ul role="list">
    {items.map(item => (
      <li key={item.href}>
        <Link href={item.href}>{item.label}</Link>
      </li>
    ))}
  </ul>
</nav>
```

---

## Implementation Checklist

When setting up navigation in a new app:

- [ ] Create navigation constants file with primary/secondary items
- [ ] Configure TopNav with logo, search, and actions
- [ ] Set up NavigationPanel with custom nav items
- [ ] Configure right panels (activity, settings, AI)
- [ ] Implement panel state management (isOpen, activePanel)
- [ ] Add overlay backdrops with click-to-close
- [ ] Implement Escape key to close panels
- [ ] Test responsive behavior (mobile/tablet/desktop)
- [ ] Add keyboard shortcuts (Cmd+K for search, etc.)
- [ ] Verify accessibility (ARIA labels, focus management)
- [ ] Test navigation active states
- [ ] Ensure proper z-index layering

---

**Next Steps:**
- [Components →](./components.md) - Component implementation details
- [Layouts →](./layouts.md) - Overall layout architecture
- [Animations →](./animations.md) - Transition and motion details
