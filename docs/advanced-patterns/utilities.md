# Utility Functions Reference

Comprehensive guide to utility functions used in AiNex applications for common operations, data transformation, formatting, and helpers.

## Overview

**What You'll Learn:**
- String utilities
- Date/time formatting
- Array and object helpers
- Validation utilities
- Color and style helpers
- Firebase utilities
- Type utilities

---

## String Utilities

### Truncate Text

```typescript
// lib/utils/string.ts

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
}
```

**Usage:**
```typescript
truncate("This is a very long text", 10);
// → "This is..."

truncate("Short", 10);
// → "Short"
```

### Slugify

```typescript
/**
 * Convert string to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}
```

**Usage:**
```typescript
slugify("Hello World! This is a Test");
// → "hello-world-this-is-a-test"
```

### Capitalize

```typescript
/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}
```

---

## Date/Time Utilities

### Format Dates

```typescript
// lib/utils/date.ts

/**
 * Format timestamp to readable date
 */
export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(d);
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | number | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "just now";
  }
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  }
  if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  }
  if (diffDay < 30) {
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  }

  return formatDate(d);
}

/**
 * Format for datetime-local input
 */
export function formatDateTimeLocalInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse datetime-local input value to Date
 */
export function parseDateTimeLocalInput(value: string): Date {
  return new Date(value);
}
```

**Usage:**
```typescript
formatDate(new Date());
// → "Jan 15, 2025"

formatRelativeTime(new Date(Date.now() - 3600000));
// → "1 hour ago"

formatDateTimeLocalInput(new Date());
// → "2025-01-15T14:30"
```

---

## Array Utilities

### Group By

```typescript
// lib/utils/array.ts

/**
 * Group array items by key
 */
export function groupBy<T>(
  array: T[],
  getKey: (item: T) => string
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = getKey(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}
```

**Usage:**
```typescript
const notes = [
  { id: "1", category: "work", title: "Meeting" },
  { id: "2", category: "personal", title: "Groceries" },
  { id: "3", category: "work", title: "Report" },
];

const grouped = groupBy(notes, (note) => note.category);
// {
//   work: [{ id: "1", ... }, { id: "3", ... }],
//   personal: [{ id: "2", ... }]
// }
```

### Unique By

```typescript
/**
 * Get unique items by key
 */
export function uniqueBy<T>(
  array: T[],
  getKey: (item: T) => string | number
): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
```

### Sort By

```typescript
/**
 * Sort array by key
 */
export function sortBy<T>(
  array: T[],
  getKey: (item: T) => string | number | Date,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aKey = getKey(a);
    const bKey = getKey(b);

    if (aKey < bKey) return order === "asc" ? -1 : 1;
    if (aKey > bKey) return order === "asc" ? 1 : -1;
    return 0;
  });
}
```

---

## Object Utilities

### Pick

```typescript
// lib/utils/object.ts

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
}
```

**Usage:**
```typescript
const user = {
  id: "123",
  name: "John",
  email: "john@example.com",
  password: "secret",
};

const publicUser = pick(user, ["id", "name", "email"]);
// { id: "123", name: "John", email: "john@example.com" }
```

### Omit

```typescript
/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };

  keys.forEach((key) => {
    delete result[key];
  });

  return result;
}
```

### Deep Clone

```typescript
/**
 * Deep clone object (simple version for JSON-serializable objects)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
```

---

## Validation Utilities

### Email Validation

```typescript
// lib/utils/validation.ts

/**
 * Check if string is valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### URL Validation

```typescript
/**
 * Check if string is valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### Empty Check

```typescript
/**
 * Check if value is empty (null, undefined, "", [], {})
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
```

---

## Color Utilities

### Hex to RGB

```typescript
// lib/utils/color.ts

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
```

### RGB to Hex

```typescript
/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}
```

### Get Contrast Color

```typescript
/**
 * Get contrasting text color (black or white) for background
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance =
    (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
```

---

## Firebase Utilities

### Firestore Converter

```typescript
// lib/utils/firestore.ts
import { FirestoreDataConverter } from "firebase/firestore";

/**
 * Create typed Firestore converter
 */
export function createConverter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: T) => {
      return data;
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ...data,
      } as T;
    },
  };
}
```

**Usage:**
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
}

const notesRef = collection(db, "notes").withConverter(
  createConverter<Note>()
);
```

### Batch Write Helper

```typescript
import { writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Batch write documents with automatic chunking
 */
export async function batchWrite<T>(
  collectionPath: string,
  items: Array<{ id: string; data: T }>,
  chunkSize: number = 500
) {
  const chunks = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    chunk.forEach(({ id, data }) => {
      const docRef = doc(db, collectionPath, id);
      batch.set(docRef, data);
    });

    await batch.commit();
  }
}
```

---

## Class Name Utilities

### clsx Alternative

```typescript
// lib/utils/cn.ts

/**
 * Simple className utility (if not using clsx)
 */
export function cn(...classes: Array<string | undefined | null | boolean>): string {
  return classes.filter(Boolean).join(" ");
}
```

**Usage:**
```typescript
const isActive = true;
const isDisabled = false;

cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class",
  undefined
);
// → "base-class active-class"
```

---

## Number Utilities

### Format Number

```typescript
// lib/utils/number.ts

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format as percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
```

### Clamp

```typescript
/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

---

## File Utilities

### Format File Size

```typescript
// lib/utils/file.ts

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

### Get File Extension

```typescript
/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
```

---

## Local Storage Utilities

### Typed Storage

```typescript
// lib/utils/storage.ts

/**
 * Type-safe localStorage wrapper
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};
```

---

## Type Utilities

### Type Guards

```typescript
// lib/utils/typeGuards.ts

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is string
 */
export function isString(value: any): value is string {
  return typeof value === "string";
}

/**
 * Check if value is number
 */
export function isNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Filter out null/undefined from array
 */
export function compact<T>(array: Array<T | null | undefined>): T[] {
  return array.filter(isDefined);
}
```

---

## Async Utilities

### Sleep

```typescript
// lib/utils/async.ts

/**
 * Async sleep/delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### Retry

```typescript
/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
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

      if (attempt < maxAttempts) {
        await sleep(delay);
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError!;
}
```

---

## Random Utilities

### Generate ID

```typescript
// lib/utils/random.ts

/**
 * Generate random ID
 */
export function generateId(length: number = 10): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

---

## Best Practices

1. **Pure Functions**: Keep utilities pure and side-effect free
2. **Type Safety**: Use TypeScript for all utilities
3. **Error Handling**: Handle edge cases gracefully
4. **Documentation**: Add JSDoc comments for public utilities
5. **Testing**: Write unit tests for utility functions
6. **Tree Shaking**: Export functions individually for better tree shaking
7. **Naming**: Use descriptive, clear names
8. **Single Responsibility**: Each function does one thing well

---

## File Organization

```
lib/
  utils/
    string.ts          # String utilities
    date.ts            # Date/time utilities
    array.ts           # Array utilities
    object.ts          # Object utilities
    validation.ts      # Validation utilities
    color.ts           # Color utilities
    firestore.ts       # Firebase utilities
    number.ts          # Number utilities
    file.ts            # File utilities
    storage.ts         # localStorage utilities
    typeGuards.ts      # Type guards
    async.ts           # Async utilities
    random.ts          # Random/ID utilities
    index.ts           # Re-export all utilities
```

---

## Related Documentation

- [Hooks Patterns →](./hooks-patterns.md)
- [Error Handling →](./error-handling.md)
- [Form Validation →](./form-validation.md)
