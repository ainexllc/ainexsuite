# Page Templates

Page structure templates for common AiNex application pages including homepage, workspace, and feature pages.

## Homepage (Landing Page)

**Route:** `/` (`src/app/page.tsx`)

### Structure

```
┌─────────────────────────────────────────┐
│           TopNav (if not auth'd)        │
├─────────────────────────────────────────┤
│                                         │
│              Hero Section               │
│          (Logo, Tagline, CTA)          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│           Features Section              │
│      (3-column grid of features)        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│             Auth Card                   │
│    (Sign in / Sign up forms)           │
│                                         │
└─────────────────────────────────────────┘
```

### Implementation

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:py-32">
        <Container variant="default">
          <div className="text-center">
            <LogoWordmark iconSize={64} className="mx-auto" />
            <h1 className="mt-6 text-4xl font-bold text-ink-900 sm:text-5xl">
              Capture, organize, and accomplish
            </h1>
            <p className="mt-4 text-lg text-ink-600">
              Your thoughts, organized beautifully
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button className="rounded-lg bg-accent-500 px-6 py-3 text-white">
                Get Started
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <Container variant="wide">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(feature => (
              <div key={feature.title} className="surface-card p-6">
                <feature.icon className="h-8 w-8 text-accent-500" />
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-ink-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Auth Section */}
      <section className="px-4 py-16">
        <Container variant="default">
          <LandingPage />
        </Container>
      </section>
    </main>
  );
}
```

---

## Workspace Page

**Route:** `/workspace` (`src/app/workspace/page.tsx`)

### Structure

```
┌─────────────────────────────────────────┐
│              TopNav                     │
├─────────────────────────────────────────┤
│   ┌─────────────────────────────────┐   │
│   │ Centered Shell (max 1280px)    │   │
│   │  ┌─────────────────────────┐   │   │
│   │  │ Container (narrow)      │   │   │
│   │  │                         │   │   │
│   │  │   Header + Actions      │   │   │
│   │  │   ───────────────────   │   │   │
│   │  │                         │   │   │
│   │  │   Item Composer         │   │   │
│   │  │   ───────────────────   │   │   │
│   │  │                         │   │   │
│   │  │   Pinned Section        │   │   │
│   │  │   (if any)              │   │   │
│   │  │   ───────────────────   │   │   │
│   │  │                         │   │   │
│   │  │   All Items Grid        │   │   │
│   │  │   (masonry layout)      │   │   │
│   │  │                         │   │   │
│   │  └─────────────────────────┘   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Implementation

```tsx
// src/app/workspace/page.tsx
"use client";

import { Container } from "@/components/layout/container";
import { ItemBoard } from "@/components/items/item-board";

export default function WorkspacePage() {
  return (
    <Container variant="narrow">
      <div className="space-y-6 py-8">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">Workspace</h1>
            <p className="mt-1 text-sm text-ink-600">
              Your notes, organized and accessible
            </p>
          </div>
          <button className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white">
            New Note
          </button>
        </header>

        {/* Main Content */}
        <ItemBoard />
      </div>
    </Container>
  );
}
```

---

## Item Board Pattern

Generic board/grid view for displaying items (notes, tasks, habits, etc.)

### Structure

```tsx
// src/components/items/item-board.tsx
"use client";

import { useItems } from "@/components/providers/items-provider";
import { ItemCard } from "./item-card";
import { ItemComposer } from "./item-composer";
import { ViewToggle } from "./view-toggle";

export function ItemBoard() {
  const { pinned, others, loading } = useItems();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Composer + View Toggle */}
      <div className="flex items-start gap-4">
        <ItemComposer />
        <ViewToggle />
      </div>

      {/* Pinned Section */}
      {pinned.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Pinned
          </h2>
          <div className="cq-board">
            <div className="note-board-columns">
              {pinned.map(item => (
                <div key={item.id} className="mb-4 break-inside-avoid">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Items */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
          All Items
        </h2>
        {others.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="cq-board">
            <div className="note-board-columns">
              {others.map(item => (
                <div key={item.id} className="mb-4 break-inside-avoid">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
```

---

## List Page Pattern

For pages with simple list views (reminders, archived items, etc.)

### Structure

```tsx
// src/app/reminders/page.tsx
"use client";

import { Container } from "@/components/layout/container";
import { useReminders } from "@/components/providers/reminders-provider";
import { ReminderCard } from "@/components/reminders/reminder-card";

export default function RemindersPage() {
  const { reminders, loading } = useReminders();

  return (
    <Container variant="default">
      <div className="space-y-6 py-8">
        <header>
          <h1 className="text-3xl font-semibold text-ink-900">Reminders</h1>
          <p className="mt-1 text-sm text-ink-600">
            Scheduled notifications for your notes
          </p>
        </header>

        {loading ? (
          <LoadingSkeleton count={5} />
        ) : reminders.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title="No reminders yet"
            description="Set reminders on your notes to get notified at the right time."
          />
        ) : (
          <div className="space-y-3">
            {reminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
```

---

## Archive/Trash Pattern

Similar to workspace but with restore/delete actions

```tsx
// src/app/archive/page.tsx
"use client";

import { Container } from "@/components/layout/container";
import { useNotes } from "@/components/providers/notes-provider";
import { ArchiveBoard } from "@/components/notes/archive-board";

export default function ArchivePage() {
  const { notes, loading } = useNotes();
  const archivedNotes = notes.filter(n => n.archived);

  return (
    <Container variant="narrow">
      <div className="space-y-6 py-8">
        <header>
          <h1 className="text-3xl font-semibold text-ink-900">Archive</h1>
          <p className="mt-1 text-sm text-ink-600">
            {archivedNotes.length} archived notes
          </p>
        </header>

        {loading ? (
          <LoadingSkeleton />
        ) : archivedNotes.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No archived notes"
            description="Notes you archive will appear here."
          />
        ) : (
          <ArchiveBoard notes={archivedNotes} />
        )}
      </div>
    </Container>
  );
}
```

---

## Settings/Preferences Page

Full-width settings page with sections

```tsx
// src/app/settings/page.tsx
"use client";

import { Container } from "@/components/layout/container";
import { usePreferences } from "@/components/providers/preferences-provider";

export default function SettingsPage() {
  const { preferences, updatePreferences, loading } = usePreferences();

  return (
    <Container variant="default">
      <div className="space-y-8 py-8">
        <header>
          <h1 className="text-3xl font-semibold text-ink-900">Settings</h1>
          <p className="mt-1 text-sm text-ink-600">
            Manage your account and preferences
          </p>
        </header>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Section */}
          <section className="surface-card p-6">
            <h2 className="text-lg font-semibold text-ink-800">Account</h2>
            <div className="mt-4 space-y-4">
              {/* Settings fields */}
            </div>
          </section>

          {/* Notifications Section */}
          <section className="surface-card p-6">
            <h2 className="text-lg font-semibold text-ink-800">Notifications</h2>
            <div className="mt-4 space-y-4">
              {/* Settings fields */}
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
```

---

## Loading States

### Page-Level Loading

```tsx
// src/app/workspace/loading.tsx
import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container variant="narrow">
      <div className="space-y-6 py-8">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-muted" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-muted/80" />
          ))}
        </div>
      </div>
    </Container>
  );
}
```

---

## Error States

### Page-Level Error

```tsx
// src/app/workspace/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-ink-900">Something went wrong</h2>
        <p className="mt-2 text-ink-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-accent-500 px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

---

## Not Found Page

```tsx
// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ink-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-ink-800">Page not found</h2>
        <p className="mt-2 text-ink-600">The page you're looking for doesn't exist.</p>
        <Link
          href="/workspace"
          className="mt-6 inline-block rounded-lg bg-accent-500 px-6 py-3 text-white"
        >
          Go to Workspace
        </Link>
      </div>
    </div>
  );
}
```

---

## Layout Variants

### Full-Width Layout (No AppShell)

```tsx
// src/app/(auth)/login/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {children}
    </div>
  );
}
```

### Centered Auth Page

```tsx
// src/app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LogoWordmark className="mx-auto mb-8" />
        <div className="surface-card p-6">
          <h1 className="text-2xl font-semibold text-ink-900">Sign in</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Page with Tabs

```tsx
export default function Page() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Container>
      <header>
        <h1>Page Title</h1>
        <div className="mt-4 border-b border-outline-subtle">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-4 py-2 text-sm font-medium",
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
      </header>

      <div className="mt-6">
        {activeTab === "all" && <AllItems />}
        {activeTab === "pinned" && <PinnedItems />}
      </div>
    </Container>
  );
}
```

---

## Implementation Checklist

- [ ] Create homepage with hero, features, and auth sections
- [ ] Build workspace page with board/grid layout
- [ ] Implement list pages for simple content
- [ ] Add archive/trash pages with restore functionality
- [ ] Create loading.tsx for each route
- [ ] Add error.tsx for each route
- [ ] Build 404 not-found page
- [ ] Test responsive behavior on all pages
- [ ] Verify empty states show correctly
- [ ] Test loading and error states

---

**Next Steps:**
- [Layouts →](./layouts.md) - Container and layout patterns
- [Components →](./components.md) - Reusable page components
- [Functional Patterns →](./functional-patterns.md) - Data fetching for pages
