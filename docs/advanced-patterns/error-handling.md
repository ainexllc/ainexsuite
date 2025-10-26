# Error Handling Patterns

Comprehensive guide to error handling in AiNex Next.js applications, covering error boundaries, async error handling, user feedback, and recovery strategies.

## Overview

**What You'll Learn:**
- React Error Boundaries for component errors
- Async operation error handling
- User-friendly error messages
- Error recovery and retry patterns
- Firestore and authentication error handling
- Production error monitoring

---

## Error Boundaries

### Basic Error Boundary Component

Create a reusable error boundary for catching React component errors:

**File:** `components/ErrorBoundary.tsx`

```typescript
"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-base p-6">
          <div className="max-w-md rounded-2xl border border-outline-subtle bg-white p-8 text-center shadow-lg dark:bg-surface-elevated">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-ink-base">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage Examples

**Wrap entire app:**
```typescript
// app/layout.tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Wrap specific components:**
```typescript
// app/dashboard/page.tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotesList } from "@/components/notes/NotesList";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ErrorBoundary
        fallback={<div>Failed to load notes. Please refresh.</div>}
        onError={(error) => console.error("Notes error:", error)}
      >
        <NotesList />
      </ErrorBoundary>
    </div>
  );
}
```

---

## Async Error Handling

### Firebase Operations

**Pattern: Try-Catch with User Feedback**

```typescript
// hooks/useNotes.ts
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/contexts/ToastContext";

export function useNotes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const createNote = async (noteData: NoteInput) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(
        collection(db, "users", userId, "notes"),
        noteData
      );

      showToast({
        type: "success",
        message: "Note created successfully",
      });

      return docRef.id;
    } catch (err) {
      const error = err as Error;
      console.error("Failed to create note:", error);

      // Set error state
      setError(error);

      // Show user-friendly message
      showToast({
        type: "error",
        message: "Failed to create note. Please try again.",
      });

      // Re-throw for caller to handle if needed
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createNote, loading, error };
}
```

### Firebase Auth Error Handling

**Pattern: Map Firebase Error Codes to User Messages**

```typescript
// lib/authErrors.ts
export function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-blocked": "Popup blocked. Please enable popups and try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again.";
}
```

**Usage:**
```typescript
// lib/auth.ts
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { getAuthErrorMessage } from "./authErrors";

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    const errorMessage = getAuthErrorMessage(err.code);
    console.error("Sign-in error:", err.code, errorMessage);
    return { user: null, error: errorMessage };
  }
}
```

### Firestore Error Handling

**Pattern: Handle Permissions and Not Found Errors**

```typescript
// hooks/useNote.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function fetchNote(userId: string, noteId: string) {
  try {
    const noteRef = doc(db, "users", userId, "notes", noteId);
    const snapshot = await getDoc(noteRef);

    if (!snapshot.exists()) {
      throw new Error("NOTE_NOT_FOUND");
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (err: any) {
    // Handle specific Firestore errors
    if (err.code === "permission-denied") {
      throw new Error("You don't have permission to access this note.");
    }

    if (err.code === "unavailable") {
      throw new Error("Service temporarily unavailable. Please try again.");
    }

    if (err.message === "NOTE_NOT_FOUND") {
      throw new Error("Note not found.");
    }

    // Generic error
    throw new Error("Failed to load note. Please try again.");
  }
}
```

---

## User Feedback Patterns

### Toast Notification System

**Context:** `contexts/ToastContext.tsx`

```typescript
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { clsx } from "clsx";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    ({ type, message, duration = 4000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7);
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-hide after duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-bottom",
        styles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 flex-shrink-0 rounded-full p-1 hover:bg-black/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
```

**Usage:**
```typescript
// components/MyComponent.tsx
import { useToast } from "@/contexts/ToastContext";

export function MyComponent() {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast({
        type: "success",
        message: "Saved successfully!",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to save. Please try again.",
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Inline Error Messages

```typescript
// components/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink-base">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## Retry and Recovery Patterns

### Automatic Retry with Exponential Backoff

```typescript
// lib/retry.ts
interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      console.error(`Attempt ${attempt} failed:`, lastError);

      if (attempt < maxAttempts) {
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Usage:**
```typescript
import { retryWithBackoff } from "@/lib/retry";

async function fetchData() {
  return retryWithBackoff(
    async () => {
      const response = await fetch("/api/data");
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      return response.json();
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  );
}
```

### Manual Retry Button

```typescript
// components/ErrorRetry.tsx
import { RefreshCw } from "lucide-react";

interface ErrorRetryProps {
  error: Error;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorRetry({ error, onRetry, isRetrying }: ErrorRetryProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <XCircle className="mx-auto h-12 w-12 text-red-500" />
      <h3 className="mt-3 font-semibold text-red-800">
        Failed to Load Data
      </h3>
      <p className="mt-1 text-sm text-red-600">{error.message}</p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        <RefreshCw className={clsx("h-4 w-4", isRetrying && "animate-spin")} />
        {isRetrying ? "Retrying..." : "Try Again"}
      </button>
    </div>
  );
}
```

---

## Validation Errors

### Client-Side Validation

```typescript
// lib/validation.ts
export interface ValidationError {
  field: string;
  message: string;
}

export function validateNote(note: NoteInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!note.title?.trim()) {
    errors.push({
      field: "title",
      message: "Title is required",
    });
  }

  if (note.title && note.title.length > 200) {
    errors.push({
      field: "title",
      message: "Title must be 200 characters or less",
    });
  }

  if (!note.content?.trim()) {
    errors.push({
      field: "content",
      message: "Content is required",
    });
  }

  return errors;
}
```

**Usage in Form:**
```typescript
const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

const handleSubmit = async () => {
  const errors = validateNote(noteData);

  if (errors.length > 0) {
    setValidationErrors(errors);
    return;
  }

  // Proceed with save
  await saveNote(noteData);
};

// Display errors
const titleError = validationErrors.find((e) => e.field === "title")?.message;
```

---

## Error Monitoring

### Production Error Logging

```typescript
// lib/errorLogger.ts
interface ErrorLog {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

export function logError(
  error: Error,
  context?: Record<string, any>
) {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error logged:", errorLog);
    return;
  }

  // Send to error tracking service in production
  // Example: Sentry, LogRocket, etc.
  // Sentry.captureException(error, { extra: context });
}
```

---

## Best Practices

1. **Always Catch Errors**: Never let async operations fail silently
2. **User-Friendly Messages**: Don't show technical errors to users
3. **Log for Debugging**: Console.error in development, service in production
4. **Provide Recovery**: Offer retry or alternative actions
5. **Validate Early**: Client-side validation before server requests
6. **Error Boundaries**: Wrap components to prevent full app crashes
7. **Type Safety**: Use TypeScript to catch errors at compile time
8. **Test Error Cases**: Write tests for error scenarios

---

## Related Documentation

- [Loading States →](./loading-states.md)
- [Form Validation →](./form-validation.md)
- [Hooks Patterns →](./hooks-patterns.md)
