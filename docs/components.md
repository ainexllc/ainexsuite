# Components

Complete reference for all reusable components in the AiNex app architecture. Every component documented with props, usage examples, and implementation details.

## Table of Contents

- [Layout Components](#layout-components)
- [Navigation Components](#navigation-components)
- [Branding Components](#branding-components)
- [UI Components](#ui-components)
- [Provider Components](#provider-components)

---

## Layout Components

### AppShell

**File**: `src/components/layout/app-shell.tsx`

Main application container that orchestrates the entire app layout including top navigation, slide-out panels, and content area.

**Props:**

```tsx
type AppShellProps = {
  children: React.ReactNode;
};
```

**Features:**
- Fixed top navigation (TopNav)
- Left slide-out navigation panel (NavigationPanel)
- Right slide-out panels (Activity, Settings, AI Assistant)
- Centered content shell with max-width 1280px
- Fixed feedback button (bottom-left)
- Escape key to close panels
- Overlay backdrops for panels

**Panel Types:**
```tsx
type ActivePanel = "notifications" | "settings" | "ai-assistant" | null;
```

**Structure:**
```tsx
<AppShell>
  <TopNav /> {/* Fixed top, h-16, z-30 */}
  <main> {/* pt-16 to account for fixed nav */}
    <div className="centered-shell">
      {children} {/* Your page content */}
    </div>
  </main>

  <Link to="/workspace/feedback"> {/* Fixed bottom-left feedback button */}

  <NavigationPanel /> {/* Left panel, 280px, z-40 */}
  <RightPanel /> {/* Right panels, 480px, z-40 */}
</AppShell>
```

**Key Dimensions:**
- Top nav height: `64px` (h-16)
- Left panel width: `280px`
- Right panel width: `480px`
- Panel border radius: `rounded-l-3xl` / `rounded-r-3xl` (24px)
- Content max-width: `1280px`
- Z-index: Nav (30), Overlay (30), Panels (40)

**Usage:**

```tsx
// app/layout.tsx
import { AppShell } from "@/components/layout/app-shell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AppProviders>
          <AppShell>
            {children}
          </AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
```

**State Management:**
- `isNavOpen` - Left navigation panel visibility
- `activePanel` - Currently active right panel (`null`, `"notifications"`, `"settings"`, `"ai-assistant"`)

**Keyboard Shortcuts:**
- `Escape` - Close active panel

**Panel Content:**
- **Activity Center**: Recent note activity, pinned count
- **Settings**: User preferences (from SettingsPanel component)
- **AI Assistant**: AI chat interface with suggested prompts

---

### TopNav

**File**: `src/components/layout/top-nav.tsx`

Fixed top navigation bar with menu button, logo, search, and user actions.

**Props:**

```tsx
type TopNavProps = {
  onMenuClick?: () => void;
  onRefresh?: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onOpenAiAssistant?: () => void;
  onSearchFocus?: () => void;
};
```

**Structure:**

```
┌─────────────────────────────────────────────────────┐
│ [Menu] [Logo]    [Search bar...]      [AI] [Profile]│
└─────────────────────────────────────────────────────┘
  Left              Center                Right
```

**Layout Sections:**

**Left Section:**
- Hamburger menu button (icon-button, h-10 w-10)
- LogoWordmark (hidden on mobile: `hidden sm:block`)

**Center Section:**
- Search input with icon and clear button
- Responsive: Full input on desktop, icon-only on mobile
- Max-width: `max-w-2xl`
- Height: `h-9`
- Container queries: `.cq-nav`

**Right Section:**
- AI Assistant button (purple badge)
- Profile dropdown (if authenticated)
- Sign in button (if unauthenticated)

**Responsive Behavior:**

```tsx
// Mobile (< 640px via container query)
- Logo hidden
- Search input hidden, only icon button visible
- Actions compressed

// Desktop (>= 640px)
- All elements visible
- Full search bar
- Spaced actions
```

**Theme Adaptation:**

```tsx
const navBackgroundClass = theme === "dark"
  ? "bg-[#050507]/95"
  : "bg-white/92 border-b border-outline-subtle/60";
```

**Key Styles:**
- Position: `fixed inset-x-0 top-0 z-30`
- Height: `h-16` (64px)
- Backdrop: `backdrop-blur-2xl`
- Shadow: Orange glow in dark mode
- Max-width: `1280px` container

**Usage:**

```tsx
<TopNav
  onMenuClick={() => setNavOpen(true)}
  onRefresh={() => router.refresh()}
  onOpenSettings={() => setActivePanel("settings")}
  onOpenActivity={() => setActivePanel("notifications")}
  onOpenAiAssistant={() => setActivePanel("ai-assistant")}
/>
```

---

### NavigationPanel

**File**: `src/components/layout/navigation-panel.tsx`

Left slide-out navigation panel with primary/secondary nav items and label filtering.

**Props:**

```tsx
type NavigationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};
```

**Structure:**

```
┌─────────────────────────┐
│ Navigation          [X] │
├─────────────────────────┤
│ WORKSPACE               │
│ • Notes                 │
│ • Reminders             │
│ • Focus Mode            │
│ • Shared                │
│                         │
│ UTILITIES               │
│ • Ideas Lab     [AI]    │
│ • Archive               │
│ • Trash                 │
│                         │
│ LABELS                  │
│ ○ Work                  │
│   ○ Projects            │
│ ○ Personal              │
│                         │
│ + New label             │
└─────────────────────────┘
```

**Dimensions:**
- Width: `280px` (w-[280px])
- Position: `fixed inset-y-0 left-0 z-40`
- Border radius: `rounded-r-3xl` (24px right corners)
- Background: `bg-surface-elevated/95 backdrop-blur-2xl`
- Border: `border-r border-outline-subtle/60`

**Sections:**

1. **Header**
   - Title: "Navigation"
   - Close button (X icon)

2. **Primary Navigation** (Workspace)
   - Items from `PRIMARY_NAV_ITEMS`
   - Active state highlighting
   - Icon + label layout

3. **Secondary Navigation** (Utilities)
   - Items from `SECONDARY_NAV_ITEMS`
   - Optional badges (e.g., "AI" badge)

4. **Labels Section**
   - Hierarchical label tree
   - Color-coded label indicators
   - Active filter state
   - Create new label form
   - Indentation for nested labels: `paddingLeft: ${12 + depth * 16}px`

**Nav Item Styling:**

```tsx
// Active item
className="bg-ink-200 text-ink-900"

// Inactive item
className="text-ink-500 hover:bg-surface-muted hover:text-ink-700"

// Icon container
<span className="grid h-8 w-8 place-items-center rounded-lg">
  <Icon className="h-4 w-4" />
</span>
```

**Label Tree:**
- Hierarchical structure with parent-child relationships
- Visual depth with indentation
- Color dots indicating label color
- Click to filter notes by label
- "Active" badge on filtered label

**Transitions:**
```tsx
className="transition-transform duration-300 ease-out"
{isOpen ? "translate-x-0" : "-translate-x-full"}
```

**Usage:**

```tsx
const [isNavOpen, setNavOpen] = useState(false);

<NavigationPanel
  isOpen={isNavOpen}
  onClose={() => setNavOpen(false)}
/>
```

---

### Container

**File**: `src/components/layout/container.tsx`

Responsive width wrapper with predefined max-width variants.

**Props:**

```tsx
type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  variant?: "default" | "wide" | "narrow" | "full";
  padding?: "default" | "none";
};
```

**Variants:**

| Variant | XS | SM | MD | LG | XL |
|---------|----|----|----|----|-----|
| `default` | 100% | 560px | 720px | 820px | 880px |
| `wide` | 100% | 700px | 1120px | 1280px | 1440px |
| `narrow` | 100% | 520px | 720px | 1024px | 1200px |
| `full` | No max-width constraint |

**Padding Options:**

```tsx
// "default"
className="px-4 sm:px-6 lg:px-8"

// "none"
className="" // No padding
```

**Implementation:**

```tsx
<Container variant="default" padding="default">
  {children}
</Container>
```

**CSS Custom Properties Used:**
```css
/* Default variant */
--app-shell-max-width-sm: 560px;
--app-shell-max-width-md: 720px;
--app-shell-max-width-lg: 820px;
--app-shell-max-width-xl: 880px;

/* Wide variant */
--app-shell-wide-max-width-sm: 700px;
/* ...and so on */
```

**Usage Examples:**

```tsx
// Content-focused page
<Container variant="default">
  <h1>Article Title</h1>
  <p>Content...</p>
</Container>

// Board/grid view
<Container variant="narrow">
  <NoteBoard />
</Container>

// Full-width dashboard
<Container variant="wide">
  <Dashboard />
</Container>

// No constraints
<Container variant="full" padding="none">
  <FullWidthHero />
</Container>
```

---

### SettingsPanel

**File**: `src/components/layout/settings-panel.tsx`

User preferences configuration panel (used in right slide-out panel).

**Props:**

```tsx
type SettingsPanelProps = {
  preferences: UserPreferences;
  isLoading: boolean;
  onUpdate: (prefs: Partial<UserPreferences>) => Promise<void>;
  onClose: () => void;
};
```

**Settings Sections:**

1. **Text Notifications**
   - Phone number input
   - Validation for US phone format

2. **Reminder Channels**
   - Push notifications toggle
   - Email notifications toggle

3. **Quiet Hours**
   - Start/end time selectors
   - Enabled toggle

4. **Workspace Tuning**
   - Daily digest toggle
   - Smart suggestions toggle
   - Focus mode default toggle

**Component Pattern:**
```tsx
<div className="space-y-6">
  <section>
    <h3>Section Title</h3>
    <p className="text-sm text-muted">Description</p>
    {/* Controls */}
  </section>
</div>
```

---

## Navigation Components

### Navigation Constants

**File**: `src/lib/constants/navigation.ts`

```tsx
import { StickyNote, BellRing, Users, Clock8, Sparkles, Archive, Trash2 } from "lucide-react";

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

**Customization for New Apps:**

```tsx
// For TaskNex
export const PRIMARY_NAV_ITEMS = [
  { href: "/workspace", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/team", label: "Team", icon: Users },
];
```

---

### ProfileDropdown

**File**: `src/components/layout/profile-dropdown.tsx`

User profile menu with account actions.

**Props:**

```tsx
type ProfileDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onOpenActivity?: () => void;
  onRefresh?: () => void;
};
```

**Menu Items:**
- User info (name, email)
- Settings
- Activity
- Refresh
- Theme toggle
- Sign out

---

## Branding Components

### LogoWordmark

**File**: `src/components/branding/logo-wordmark.tsx`

App logo with text and icon.

**Props:**

```tsx
type LogoWordmarkProps = {
  href?: string;
  iconSize?: number;
  className?: string;
};
```

**Structure:**

```tsx
<Link href={href}>
  <div className="flex items-center gap-2">
    {/* Icon: Checkered pattern */}
    <div className="grid grid-cols-2 gap-0.5">
      <div className="h-2 w-2 bg-accent-500" />
      <div className="h-2 w-2 bg-ink-900" />
      <div className="h-2 w-2 bg-ink-900" />
      <div className="h-2 w-2 bg-accent-500" />
    </div>

    {/* Text */}
    <span className="font-kanit font-bold text-2xl">
      <span className="text-accent-500">Note</span>
      <span className="text-ink-900">Nex</span>
    </span>
  </div>
</Link>
```

**Customization:**

```tsx
// TaskNex
<span className="text-accent-500">Task</span>
<span className="text-ink-900">Nex</span>

// HabitNex
<span className="text-accent-500">Habit</span>
<span className="text-ink-900">Nex</span>

// Different accent color (blue instead of orange)
<span className="text-blue-500">Code</span>
<span className="text-ink-900">Nex</span>
```

**Icon Variants:**
- Default: Checkered 2x2 grid pattern
- Can be swapped for custom SVG icon
- Maintains square aspect ratio

---

## UI Components

### ConfirmModal

**File**: `src/components/ui/confirm-modal.tsx`

Confirmation dialog for destructive actions.

**Props:**

```tsx
type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isProcessing?: boolean;
};
```

**Structure:**

```tsx
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 backdrop-blur-sm">
    <div className="max-w-md rounded-2xl bg-surface-elevated border border-outline-subtle p-6 shadow-2xl">
      <AlertTriangle className="h-12 w-12 text-warning" />
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="flex gap-2">
        <button onClick={onConfirm}>{confirmLabel}</button>
        <button onClick={onCancel}>{cancelLabel}</button>
      </div>
    </div>
  </div>
)}
```

**Usage:**

```tsx
<ConfirmModal
  isOpen={isDeleteModalOpen}
  title="Delete note?"
  message="This note will be moved to trash and deleted permanently after 30 days."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  onConfirm={handleDelete}
  onCancel={() => setDeleteModalOpen(false)}
  isProcessing={isDeleting}
/>
```

---

### Button Patterns

Buttons don't have a dedicated component but follow consistent patterns:

**Primary Button:**
```tsx
<button className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
  Create Note
</button>
```

**Secondary Button:**
```tsx
<button className="rounded-lg border border-outline-subtle px-4 py-2 text-sm font-semibold text-ink-600 transition hover:bg-surface-muted">
  Cancel
</button>
```

**Icon Button:**
```tsx
<button className="icon-button">
  <Icon className="h-4 w-4" />
</button>

// Utility class from globals.css:
.icon-button {
  @apply grid place-items-center rounded-full p-2
         text-ink-500 transition-all duration-150
         hover:bg-surface-muted hover:text-ink-700
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500;
}
```

**Sizes:**
- Small: `px-3 py-1.5 text-xs`
- Medium: `px-4 py-2 text-sm`
- Large: `px-6 py-3 text-base`

---

### Card Pattern

**Surface Card Utility:**

```css
.surface-card {
  @apply rounded-xl border border-outline-subtle
         bg-surface-elevated shadow-sm;
}
```

**Usage:**

```tsx
<div className="surface-card p-5">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

**Card Variants:**

```tsx
// Muted background
<div className="rounded-2xl bg-surface-muted/40 p-5">

// With shadow
<div className="rounded-xl bg-surface-elevated border border-outline-subtle shadow-floating p-6">

// Interactive card
<button className="surface-card p-5 transition hover:bg-surface-muted">
```

---

### Empty State Pattern

```tsx
<div className="rounded-2xl bg-surface-muted/40 px-5 py-6 text-center">
  <Icon className="mx-auto h-12 w-12 text-ink-400" />
  <p className="mt-3 font-semibold text-ink-700">
    Primary message
  </p>
  <p className="mt-1 text-sm text-muted">
    Supporting description
  </p>
  <button className="mt-4 ...">
    Call to action
  </button>
</div>
```

---

### Loading Skeleton Pattern

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

---

## Provider Components

### AppProviders

**File**: `src/components/providers/app-providers.tsx`

Composite provider wrapping all context providers.

```tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotesProvider>
          <LabelsProvider>
            <RemindersProvider>
              <PreferencesProvider>
                {children}
              </PreferencesProvider>
            </RemindersProvider>
          </LabelsProvider>
        </NotesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

---

### ThemeProvider

**File**: `src/components/providers/theme-provider.tsx`

Dark/light mode management.

**Context:**

```tsx
type ThemeContextType = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
};
```

**Features:**
- LocalStorage persistence (`theme` key)
- System preference detection
- Automatic `<html>` class updates (`dark` class)

**Usage:**

```tsx
const { theme, setTheme, toggleTheme } = useTheme();

<button onClick={toggleTheme}>
  {theme === "dark" ? <Sun /> : <Moon />}
</button>
```

---

### NotesProvider

**File**: `src/components/providers/notes-provider.tsx`

Notes state and search management.

**Context:**

```tsx
type NotesContextType = {
  allNotes: Note[];
  pinned: Note[];
  others: Note[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeLabelIds: string[];
  setActiveLabelIds: (ids: string[]) => void;
  // ... CRUD methods
};
```

---

## Component Checklist

When creating a new app, ensure you have:

**Layout:**
- [ ] AppShell with panel management
- [ ] TopNav with search and actions
- [ ] NavigationPanel with custom nav items
- [ ] Container with responsive variants
- [ ] SettingsPanel for user preferences

**Branding:**
- [ ] LogoWordmark customized with app name
- [ ] Icon/pattern reflecting app purpose
- [ ] Accent color configured

**UI Components:**
- [ ] Button patterns (primary, secondary, icon)
- [ ] Card patterns (surface-card utility)
- [ ] Modal/dialog components
- [ ] Empty state patterns
- [ ] Loading skeletons

**Providers:**
- [ ] AppProviders composite
- [ ] ThemeProvider for dark/light mode
- [ ] Auth provider for authentication
- [ ] Feature-specific providers (Notes, Tasks, Habits, etc.)

---

**Next Steps:**
- [UI Patterns →](./ui-patterns.md) - Detailed UI component patterns
- [Navigation →](./navigation.md) - Navigation architecture deep dive
- [Theming →](./theming.md) - Theme system implementation
