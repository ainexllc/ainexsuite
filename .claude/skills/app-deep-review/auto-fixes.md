# Auto-Fix Patterns Guide

This document defines the patterns for automatic code fixes that can be safely applied by the `/app-deep-review` skill when using the `--auto-fix` flag.

---

## Safety Principles

### Auto-Fix Categories

| Category    | Risk Level | Auto-Apply           | Description                         |
| ----------- | ---------- | -------------------- | ----------------------------------- |
| **Safe**    | Low        | ✅ Yes               | No behavior change, formatting only |
| **Careful** | Medium     | ⚠️ With confirmation | Minor behavior impact possible      |
| **Manual**  | High       | ❌ No                | Requires human review               |

### Safety Criteria

An auto-fix is considered **safe** only if it:

1. Does not change runtime behavior
2. Does not affect type inference in breaking ways
3. Can be easily reverted
4. Has no side effects on other code
5. Is deterministic and consistent

---

## Safe Auto-Fixes (Low Risk)

### 1. Missing "use client" Directive

**Detection Pattern:**

```typescript
// File uses React hooks but lacks "use client"
// Indicators: useState, useEffect, useRef, useCallback, useMemo, etc.
```

**Detection Command:**

```bash
# Find files with hooks but no "use client"
grep -l "useState\|useEffect\|useRef\|useCallback\|useMemo" apps/{app}/src/**/*.tsx | \
  xargs -I {} sh -c 'grep -L "use client" {}'
```

**Fix Pattern:**

```typescript
// Before
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  // ...
}

// After
("use client");

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  // ...
}
```

**Implementation:**

```typescript
// Add "use client"; as first line
const newContent = `'use client';\n\n${originalContent}`;
```

---

### 2. Unused Imports

**Detection Pattern:**

```typescript
// Import statement where identifier is never used in file
import { SomeComponent, UnusedType } from "./components";
// SomeComponent used, UnusedType never referenced
```

**Detection Command:**

```bash
# Use TypeScript compiler to find unused imports
npx tsc --noEmit --noUnusedLocals apps/{app}/src/**/*.ts 2>&1 | grep "is declared but"
```

**Fix Pattern:**

```typescript
// Before
import { useState, useEffect, useCallback } from "react";
import { Note, User, Settings } from "@/types";

// Only useState and Note are used

// After
import { useState } from "react";
import { Note } from "@/types";
```

**Implementation:**

1. Parse imports with regex or AST
2. Scan file for identifier usage
3. Remove unused identifiers from import
4. Remove entire import line if all identifiers unused

---

### 3. Console.log Statements

**Detection Pattern:**

```typescript
// Any console.log, console.warn, console.error in source code
// Exclude: error handlers, intentional logging
```

**Detection Command:**

```bash
grep -rn "console.log" apps/{app}/src --include="*.ts" --include="*.tsx"
```

**Fix Pattern:**

```typescript
// Before
function handleSubmit(data: FormData) {
  console.log("Submitting:", data);
  return submitForm(data);
}

// After
function handleSubmit(data: FormData) {
  return submitForm(data);
}
```

**Exclusion Rules:**

- Keep `console.error` in catch blocks (intentional error logging)
- Keep if preceded by `// eslint-disable` comment
- Keep in development-only files (\*.dev.ts)

**Implementation:**

```typescript
// Remove line containing only console.log
// If console.log is part of larger expression, remove just the call
```

---

### 4. Trailing Whitespace

**Detection Pattern:**

```
Lines ending with spaces or tabs before newline
```

**Fix Pattern:**

```typescript
// Before
const value = "hello";
//                    ^^ trailing spaces

// After
const value = "hello";
```

**Implementation:**

```bash
# Using sed
sed -i '' 's/[[:space:]]*$//' file.tsx
```

---

### 5. Multiple Empty Lines

**Detection Pattern:**

```typescript
// More than one consecutive empty line

// Like this
```

**Fix Pattern:**

```typescript
// Before
function a() {}

function b() {}

// After
function a() {}

function b() {}
```

**Implementation:**

```bash
# Using sed to collapse multiple blank lines
sed -i '' '/^$/N;/^\n$/d' file.tsx
```

---

### 6. Missing Newline at End of File

**Detection Pattern:**

```
File does not end with newline character
```

**Fix:**

```bash
# Add newline if missing
sed -i '' -e '$a\' file.tsx
```

---

## Careful Auto-Fixes (Medium Risk)

### 7. Missing Explicit Return Types

**Detection Pattern:**

```typescript
// Functions without explicit return type annotation
function getData() {
  return fetch("/api/data").then((r) => r.json());
}
```

**Fix Pattern:**

```typescript
// Before
function getData() {
  return { name: "test", id: 1 };
}

// After
function getData(): { name: string; id: number } {
  return { name: "test", id: 1 };
}
```

**Caution:**

- Only apply to exported functions
- Infer type from return statements
- Skip if complex generic types involved

**Implementation:**

- Use TypeScript compiler API to infer return type
- Add explicit annotation

---

### 8. Prefer `const` over `let`

**Detection Pattern:**

```typescript
// Variable declared with let but never reassigned
let value = computeValue();
// value never reassigned
```

**Fix Pattern:**

```typescript
// Before
let config = loadConfig();
console.log(config.apiKey);

// After
const config = loadConfig();
console.log(config.apiKey);
```

**Caution:**

- Must verify no reassignment in entire scope
- Skip if in loop that might reassign

---

### 9. Unnecessary Fragment

**Detection Pattern:**

```tsx
// Fragment with single child
return (
  <>
    <div>Only child</div>
  </>
);
```

**Fix Pattern:**

```tsx
// Before
return (
  <>
    <Component />
  </>
);

// After
return <Component />;
```

**Caution:**

- Ensure single child has no array siblings
- Preserve comments if any

---

## Manual Review Required (High Risk)

These patterns are identified but NOT auto-fixed:

### 10. any Type Usage

**Detection Only:**

```typescript
// Flagged for manual review
const data: any = fetchData();
```

**Why Manual:**

- Replacing `any` requires understanding context
- May need interface definition
- Could break type inference elsewhere

---

### 11. Component Refactoring

**Detection Only:**

```typescript
// Component exceeds 200 lines
// Has more than 5 useState calls
// Mixes multiple concerns
```

**Why Manual:**

- Requires architectural decisions
- May need new file creation
- Context needed for proper extraction

---

### 12. Hook Dependency Array Fixes

**Detection Only:**

```typescript
// Missing dependency in useEffect
useEffect(() => {
  fetchData(userId);
}, []); // userId missing
```

**Why Manual:**

- May cause infinite loops if blindly added
- Might need memoization first
- Could require restructuring

---

### 13. Security Fixes

**Never Auto-Fix:**

- Input sanitization
- Auth checks
- XSS prevention
- CSRF tokens

**Why Manual:**

- Security-critical, needs human review
- Context-dependent solutions
- Could introduce new vulnerabilities

---

## Auto-Fix Workflow

### Step 1: Scan for Auto-Fixable Issues

```bash
# Run detection commands
# Categorize findings by risk level
# Count affected files per category
```

### Step 2: Present Summary to User

```markdown
## Auto-Fixable Issues Found

| Category             | Files | Instances | Risk   |
| -------------------- | ----- | --------- | ------ |
| Missing "use client" | 8     | 8         | Low    |
| Unused imports       | 15    | 47        | Low    |
| Console.log          | 5     | 12        | Low    |
| Missing return types | 10    | 23        | Medium |

**Options:**

- [A] Apply all safe fixes (Low risk only)
- [M] Apply all including medium risk
- [S] Select specific fixes
- [N] Skip auto-fix
```

### Step 3: Apply Selected Fixes

```typescript
// For each file with fixes:
// 1. Read file content
// 2. Apply transformations in order
// 3. Write updated content
// 4. Track changes for summary
```

### Step 4: Generate Summary

```markdown
## Auto-Fix Results

✅ Successfully applied 67 fixes across 23 files:

### Low Risk (Applied)

- Added "use client" to 8 files
- Removed 47 unused imports from 15 files
- Removed 12 console.log statements from 5 files

### Medium Risk (Applied with confirmation)

- Added return types to 23 functions in 10 files

### Skipped (Manual review required)

- 5 instances of `any` type usage
- 3 components exceeding size threshold
- 2 useEffect dependency warnings

**Files modified:**

- apps/notes/src/components/NoteCard.tsx
- apps/notes/src/hooks/useNotes.ts
- ... (full list)
```

---

## Rollback Support

### Before Auto-Fix

```bash
# Create backup branch
git checkout -b backup/pre-auto-fix-{timestamp}
git add -A && git commit -m "Backup before auto-fix"
git checkout -
```

### If Issues Found

```bash
# Revert to backup
git checkout backup/pre-auto-fix-{timestamp}
```

### After Successful Fix

```bash
# Verify build passes
pnpm build --filter=@ainexsuite/{app}

# If successful, can delete backup branch
git branch -d backup/pre-auto-fix-{timestamp}
```

---

## Configuration

### Skip Patterns

Files/directories to skip during auto-fix:

```typescript
const SKIP_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/generated/**",
  "**/migrations/**",
];
```

### Preserve Comments

Auto-fix should preserve:

- `// eslint-disable` comments
- `// @ts-ignore` comments (flag but don't remove)
- JSDoc comments
- TODO/FIXME comments (flag for review)

---

## See Also

- [SKILL.md](SKILL.md) - Main skill orchestration
- [review-criteria.md](review-criteria.md) - Detailed review criteria
- [metrics-collector.md](metrics-collector.md) - Pre-analysis metrics
