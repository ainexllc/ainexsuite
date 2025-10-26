# React Hooks Patterns

Comprehensive guide to custom React hooks used in AiNex applications, including state management, data fetching, and utility hooks.

## Overview

**What You'll Learn:**
- Custom hook patterns
- State management hooks
- Data fetching hooks
- UI interaction hooks
- Lifecycle and effect hooks
- Performance optimization hooks
- Utility hooks

---

## State Management Hooks

### useLocalStorage

Persist state in browser localStorage with React state synchronization.

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

**Usage:**
```typescript
function MyComponent() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}
```

### useToggle

Simple boolean toggle with helpful utilities.

```typescript
// hooks/useToggle.ts
import { useState, useCallback } from "react";

export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}
```

**Usage:**
```typescript
function Sidebar() {
  const [isOpen, toggleOpen, setIsOpen] = useToggle(false);

  return (
    <>
      <button onClick={toggleOpen}>Toggle Sidebar</button>
      <button onClick={() => setIsOpen(true)}>Open Sidebar</button>
      {isOpen && <div>Sidebar content</div>}
    </>
  );
}
```

---

## Data Fetching Hooks

### useFirestoreQuery

Fetch and subscribe to Firestore data with real-time updates.

```typescript
// hooks/useFirestoreQuery.ts
import { useEffect, useState } from "react";
import { Query, onSnapshot } from "firebase/firestore";

interface UseFirestoreQueryResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreQuery<T>(
  query: Query | null
): UseFirestoreQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(documents);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore query error:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
```

**Usage:**
```typescript
function NotesList({ userId }: Props) {
  const notesQuery = query(
    collection(db, "users", userId, "notes"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const { data: notes, loading, error } = useFirestoreQuery<Note>(notesQuery);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
```

### useFirestoreDoc

Subscribe to a single Firestore document.

```typescript
// hooks/useFirestoreDoc.ts
import { useEffect, useState } from "react";
import { DocumentReference, onSnapshot } from "firebase/firestore";

interface UseFirestoreDocResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFirestoreDoc<T>(
  docRef: DocumentReference | null
): UseFirestoreDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...snapshot.data(),
          } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore doc error:", err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}
```

---

## UI Interaction Hooks

### useClickOutside

Detect clicks outside an element.

```typescript
// hooks/useClickOutside.ts
import { useEffect, RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref, handler]);
}
```

**Usage:**
```typescript
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

### useMediaQuery

Respond to media query changes.

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
```

**Usage:**
```typescript
function ResponsiveComponent() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <div>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      {isDarkMode && <p>Dark mode is active</p>}
    </div>
  );
}
```

### useWindowSize

Track window dimensions.

```typescript
// hooks/useWindowSize.ts
import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
```

---

## Debounce and Throttle Hooks

### useDebounce

Debounce a value to limit rapid updates.

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
```

**Usage:**
```typescript
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Only search after user stops typing for 500ms
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search notes..."
    />
  );
}
```

### useThrottle

Throttle a function to limit execution rate.

```typescript
// hooks/useThrottle.ts
import { useRef, useCallback } from "react";

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const lastRan = useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    }) as T,
    [callback, delay]
  );
}
```

---

## Performance Hooks

### useMemoCompare

Memoize a value with custom comparison.

```typescript
// hooks/useMemoCompare.ts
import { useRef, useEffect } from "react";

export function useMemoCompare<T>(
  value: T,
  compare: (prev: T | undefined, next: T) => boolean
): T {
  const previousRef = useRef<T>();

  useEffect(() => {
    if (!compare(previousRef.current, value)) {
      previousRef.current = value;
    }
  });

  return previousRef.current ?? value;
}
```

**Usage:**
```typescript
// Only re-render when specific query params change
const memoizedQuery = useMemoCompare(
  query,
  (prev, next) => prev?.userId === next?.userId && prev?.limit === next?.limit
);
```

### usePrevious

Get the previous value of a prop or state.

```typescript
// hooks/usePrevious.ts
import { useRef, useEffect } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

**Usage:**
```typescript
function Counter({ count }: Props) {
  const previousCount = usePrevious(count);

  return (
    <div>
      Current: {count}
      {previousCount !== undefined && <p>Previous: {previousCount}</p>}
    </div>
  );
}
```

---

## Lifecycle Hooks

### useMount / useUnmount

Execute code on mount or unmount only.

```typescript
// hooks/useMount.ts
import { useEffect } from "react";

export function useMount(callback: () => void) {
  useEffect(() => {
    callback();
  }, []);
}

export function useUnmount(callback: () => void) {
  useEffect(() => {
    return callback;
  }, []);
}
```

**Usage:**
```typescript
function MyComponent() {
  useMount(() => {
    console.log("Component mounted");
    trackPageView();
  });

  useUnmount(() => {
    console.log("Component unmounting");
    cleanupResources();
  });

  return <div>Content</div>;
}
```

### useUpdateEffect

useEffect that skips the first render.

```typescript
// hooks/useUpdateEffect.ts
import { useEffect, useRef } from "react";

export function useUpdateEffect(
  callback: () => void | (() => void),
  dependencies: any[]
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return callback();
  }, dependencies);
}
```

---

## Form Hooks

### useFormField

Manage individual form field state.

```typescript
// hooks/useFormField.ts
import { useState, ChangeEvent } from "react";

interface UseFormFieldReturn {
  value: string;
  error: string | undefined;
  touched: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  setError: (error: string | undefined) => void;
  reset: () => void;
}

export function useFormField(
  initialValue: string = "",
  validate?: (value: string) => string | undefined
): UseFormFieldReturn {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValue(e.target.value);

    // Clear error on change
    if (error) {
      setError(undefined);
    }
  }

  function onBlur() {
    setTouched(true);

    if (validate) {
      const validationError = validate(value);
      setError(validationError);
    }
  }

  function reset() {
    setValue(initialValue);
    setError(undefined);
    setTouched(false);
  }

  return {
    value,
    error,
    touched,
    onChange,
    onBlur,
    setError,
    reset,
  };
}
```

---

## Authentication Hooks

### useAuth

Access authentication state from context.

```typescript
// hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
```

**Usage:**
```typescript
function ProfileButton() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Link href="/login">Sign In</Link>;
  }

  return (
    <div>
      <img src={user.photoURL} alt={user.displayName} />
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### useRequireAuth

Redirect to login if not authenticated.

```typescript
// hooks/useRequireAuth.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

export function useRequireAuth(redirectTo: string = "/login") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}
```

**Usage:**
```typescript
function DashboardPage() {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <Spinner />;
  }

  return <div>Welcome, {user.displayName}!</div>;
}
```

---

## Async Hooks

### useAsync

Handle async operations with loading, error, and data states.

```typescript
// hooks/useAsync.ts
import { useState, useCallback } from "react";

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  function reset() {
    setData(null);
    setLoading(false);
    setError(null);
  }

  return { data, loading, error, execute, reset };
}
```

**Usage:**
```typescript
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

function UserProfile({ userId }: Props) {
  const { data, loading, error, execute } = useAsync(fetchUserData);

  useEffect(() => {
    execute(userId);
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

---

## Utility Hooks

### useId

Generate unique IDs for accessibility (built into React 18+).

```typescript
// For React < 18, implement your own:
import { useState } from "react";

let globalId = 0;

export function useId(): string {
  const [id] = useState(() => `id-${++globalId}`);
  return id;
}
```

### useCopyToClipboard

Copy text to clipboard.

```typescript
// hooks/useCopyToClipboard.ts
import { useState } from "react";

export function useCopyToClipboard(): [
  boolean,
  (text: string) => Promise<void>
] {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopied(false);
    }
  }

  return [copied, copy];
}
```

**Usage:**
```typescript
function ShareButton({ url }: Props) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <button onClick={() => copy(url)}>
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
```

---

## Best Practices

1. **Naming**: Prefix custom hooks with `use`
2. **Dependencies**: Always include all dependencies in useEffect
3. **Cleanup**: Return cleanup functions from useEffect
4. **Memoization**: Use useCallback and useMemo to prevent re-renders
5. **Context**: Create custom hooks to access context (e.g., useAuth)
6. **Error Handling**: Handle errors in async hooks
7. **TypeScript**: Type your hooks for better DX
8. **Composition**: Combine simpler hooks to create complex ones
9. **Testing**: Write tests for custom hooks using @testing-library/react-hooks

---

## Related Documentation

- [Error Handling →](./error-handling.md)
- [Form Validation →](./form-validation.md)
- [Utilities →](./utilities.md)
