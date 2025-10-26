# Loading States Patterns

Comprehensive guide to loading states and skeleton screens in AiNex Next.js applications, ensuring smooth user experience during data fetching and async operations.

## Overview

**What You'll Learn:**
- Loading state management
- Skeleton screens and placeholders
- Progressive loading patterns
- Suspense boundaries
- Optimistic UI updates
- Loading indicators and spinners

---

## Basic Loading States

### Component-Level Loading

**Pattern: Boolean Loading State**

```typescript
// components/NotesList.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    try {
      const data = await fetchNotes();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-3 text-sm text-ink-muted">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
```

---

## Skeleton Screens

### Basic Skeleton Component

```typescript
// components/Skeleton.tsx
import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-surface-muted/60",
        className
      )}
    />
  );
}
```

### Note Card Skeleton

```typescript
// components/notes/NoteCardSkeleton.tsx
import { Skeleton } from "@/components/Skeleton";

export function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-subtle bg-white p-6 dark:bg-surface-elevated">
      {/* Title skeleton */}
      <Skeleton className="mb-3 h-6 w-3/4" />

      {/* Content skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Footer skeleton */}
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
```

### Multiple Skeleton Items

```typescript
// components/notes/NotesListSkeleton.tsx
import { NoteCardSkeleton } from "./NoteCardSkeleton";

export function NotesListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

**Usage:**
```typescript
export function NotesList() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <NotesListSkeleton count={6} />;
  }

  return <div>{/* Actual notes */}</div>;
}
```

---

## Suspense Boundaries

### React Suspense for Async Components

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";
import { NotesList } from "@/components/notes/NotesList";
import { NotesListSkeleton } from "@/components/notes/NotesListSkeleton";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<NotesListSkeleton />}>
        <NotesList />
      </Suspense>
    </div>
  );
}
```

### Multiple Suspense Boundaries

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="grid gap-8">
      {/* Load sections independently */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <Suspense fallback={<NotesListSkeleton />}>
        <NotesList />
      </Suspense>

      <Suspense fallback={<ActivityFeedSkeleton />}>
        <ActivityFeed />
      </Suspense>
    </div>
  );
}
```

---

## Progressive Loading

### Infinite Scroll Loading

```typescript
// components/InfiniteNotesList.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function InfiniteNotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes(page);
  }, [page]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore]);

  async function loadNotes(pageNum: number) {
    setLoading(true);
    try {
      const newNotes = await fetchNotes({ page: pageNum, limit: 20 });

      if (newNotes.length === 0) {
        setHasMore(false);
      } else {
        setNotes((prev) => [...prev, ...newNotes]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid gap-4">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && <div ref={observerRef} className="h-4" />}

      {/* End of list message */}
      {!hasMore && notes.length > 0 && (
        <p className="py-8 text-center text-sm text-ink-muted">
          You've reached the end
        </p>
      )}
    </div>
  );
}
```

### Pagination Loading

```typescript
// components/PaginatedNotesList.tsx
export function PaginatedNotesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const pageSize = 20;

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage]);

  async function loadPage(page: number) {
    setLoading(true);
    try {
      const data = await fetchNotes({ page, limit: pageSize });
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loading ? (
        <NotesListSkeleton count={pageSize} />
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || loading}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="flex items-center px-4 text-sm text-ink-muted">
          Page {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={loading}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Optimistic UI Updates

### Optimistic Create

```typescript
// hooks/useOptimisticNotes.ts
import { useState } from "react";
import { nanoid } from "nanoid";

export function useOptimisticNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pendingNotes, setPendingNotes] = useState<Set<string>>(new Set());

  async function createNote(noteData: NoteInput) {
    // Generate temporary ID
    const tempId = nanoid();
    const optimisticNote: Note = {
      id: tempId,
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add optimistically
    setNotes((prev) => [optimisticNote, ...prev]);
    setPendingNotes((prev) => new Set(prev).add(tempId));

    try {
      // Actual API call
      const realNote = await saveNote(noteData);

      // Replace optimistic note with real one
      setNotes((prev) =>
        prev.map((note) => (note.id === tempId ? realNote : note))
      );
    } catch (error) {
      // Remove optimistic note on error
      setNotes((prev) => prev.filter((note) => note.id !== tempId));
      throw error;
    } finally {
      setPendingNotes((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  }

  return { notes, createNote, pendingNotes };
}
```

**Visual Indicator for Pending:**
```typescript
// components/NoteCard.tsx
export function NoteCard({ note, isPending }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white p-6",
        isPending && "opacity-60 animate-pulse"
      )}
    >
      {/* Note content */}
      {isPending && (
        <div className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
```

---

## Loading Indicators

### Spinner Component

```typescript
// components/Spinner.tsx
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={clsx(
        "animate-spin text-primary-500",
        sizes[size],
        className
      )}
    />
  );
}
```

### Button Loading State

```typescript
// components/LoadingButton.tsx
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface LoadingButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function LoadingButton({
  loading,
  disabled,
  onClick,
  children,
  className,
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 font-semibold transition",
        "bg-primary-500 text-white hover:bg-primary-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
```

**Usage:**
```typescript
const [saving, setSaving] = useState(false);

<LoadingButton loading={saving} onClick={handleSave}>
  {saving ? "Saving..." : "Save Note"}
</LoadingButton>
```

---

## Shimmer Effect

### Advanced Skeleton with Shimmer

```typescript
// components/Shimmer.tsx
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-lg bg-surface-muted/60",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
```

**Tailwind Config:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
};
```

---

## Global Loading State

### Top Loading Bar

```typescript
// components/TopLoadingBar.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopLoadingBar() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full overflow-hidden bg-surface-muted">
      <div className="h-full w-1/3 animate-loading-bar bg-primary-500" />
    </div>
  );
}
```

**Tailwind Config:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      animation: {
        "loading-bar": "loading-bar 1s ease-in-out infinite",
      },
      keyframes: {
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },
    },
  },
};
```

---

## Deferred Loading

### Delay Loading Indicator

Prevent loading flicker for fast responses:

```typescript
// hooks/useDeferredLoading.ts
import { useState, useEffect } from "react";

export function useDeferredLoading(
  loading: boolean,
  delay: number = 300
): boolean {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      setShowLoading(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [loading, delay]);

  return showLoading;
}
```

**Usage:**
```typescript
const [loading, setLoading] = useState(false);
const showLoadingIndicator = useDeferredLoading(loading, 300);

// Only show spinner if loading takes > 300ms
{showLoadingIndicator && <Spinner />}
```

---

## Loading States Checklist

- ✅ Show loading state for async operations
- ✅ Use skeleton screens for better perceived performance
- ✅ Implement progressive loading for large lists
- ✅ Add optimistic updates for instant feedback
- ✅ Defer loading indicators to prevent flicker
- ✅ Disable interactive elements during loading
- ✅ Provide visual feedback on buttons
- ✅ Handle loading errors gracefully
- ✅ Use Suspense boundaries for server components
- ✅ Test loading states in slow network conditions

---

## Best Practices

1. **Always Show Feedback**: Never leave users wondering if something is happening
2. **Match Layout**: Skeleton screens should match the actual content layout
3. **Prevent Flicker**: Use deferred loading for fast operations
4. **Progressive Enhancement**: Load critical content first
5. **Optimistic Updates**: Make UI feel instant when possible
6. **Disable During Loading**: Prevent duplicate actions
7. **Meaningful Messages**: "Loading notes..." vs generic "Loading..."
8. **Accessibility**: Use `aria-busy` and `aria-live` for screen readers

---

## Related Documentation

- [Error Handling →](./error-handling.md)
- [Hooks Patterns →](./hooks-patterns.md)
- [Utilities →](./utilities.md)
