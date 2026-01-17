# Review Criteria Reference

This document provides detailed review criteria for each of the 6 review dimensions used by the `/app-deep-review` skill.

---

## 1. Backend Modernization Criteria

### API Design Patterns

**RESTful Conventions:**

- [ ] GET for read operations, POST for create, PUT/PATCH for update, DELETE for delete
- [ ] Meaningful resource URLs (e.g., `/api/notes` not `/api/getData`)
- [ ] Consistent URL structure across all routes
- [ ] Proper use of query params vs body params

**Request/Response Patterns:**

```typescript
// ✅ Good: Typed request handler with validation
export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreateNoteSchema.parse(body);
  // ...
  return Response.json({ data: note }, { status: 201 });
}

// ❌ Bad: Untyped, no validation
export async function POST(request: Request) {
  const body = await request.json();
  // Direct use of body without validation
}
```

**Error Handling:**

```typescript
// ✅ Good: Consistent error responses
return Response.json(
  { error: "Note not found", code: "NOTE_NOT_FOUND" },
  { status: 404 },
);

// ❌ Bad: Inconsistent or vague errors
return new Response("Error", { status: 500 });
```

### Firebase Usage Patterns

**Firestore Queries:**

- [ ] Using composite indexes for complex queries
- [ ] Avoiding `getDocs` for real-time data (use `onSnapshot`)
- [ ] Proper pagination with cursors
- [ ] Using batched writes for multiple operations

```typescript
// ✅ Good: Optimized query with pagination
const q = query(
  collection(db, "notes"),
  where("userId", "==", userId),
  orderBy("updatedAt", "desc"),
  limit(20),
  startAfter(lastDoc),
);

// ❌ Bad: Fetching all docs without limit
const allNotes = await getDocs(collection(db, "notes"));
```

**Admin SDK vs Client SDK:**

- [ ] Admin SDK used only in API routes/server actions
- [ ] Client SDK used in client components
- [ ] No mixing of admin/client in same file

### Type Safety Checklist

- [ ] No `any` types (except for explicit edge cases with comment)
- [ ] Zod schemas for all external input
- [ ] Explicit return types on API handlers
- [ ] Proper null/undefined handling
- [ ] Discriminated unions for API responses

```typescript
// ✅ Good: Proper type safety
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

// ❌ Bad: Using any
const data: any = await fetchData();
```

---

## 2. Frontend Modernization Criteria

### React 19 Patterns

**Server vs Client Components:**

```typescript
// ✅ Good: Server Component (default)
// No "use client" - runs on server
export default async function NotesPage() {
  const notes = await fetchNotes();
  return <NotesList notes={notes} />;
}

// ✅ Good: Client Component (when needed)
'use client';
export function NoteEditor() {
  const [content, setContent] = useState('');
  // Interactive component with state
}
```

**"use client" Placement:**

- [ ] Only add "use client" when necessary (hooks, event handlers, browser APIs)
- [ ] Place at the lowest level possible (not at page level)
- [ ] Consider extracting client-only parts to separate components

### Component Composition

**Single Responsibility:**

- [ ] Components do one thing well
- [ ] Max ~150-200 lines per component
- [ ] Clear props interface
- [ ] No business logic in presentation components

**Prop Drilling Indicators:**

- [ ] Props passed through 3+ levels → use Context or composition
- [ ] Same prop passed to multiple children → consider children pattern

```typescript
// ❌ Bad: Prop drilling
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>

// ✅ Good: Composition
<UserProvider user={user}>
  <Parent>
    <Child>
      <GrandChild />
    </Child>
  </Parent>
</UserProvider>
```

### Hook Extraction Opportunities

**When to Extract:**

- [ ] Same logic pattern repeated in 2+ components
- [ ] Component has complex state management (>3 useState)
- [ ] Side effects with cleanup logic
- [ ] Data fetching logic

```typescript
// ❌ Bad: Logic in component
function NoteEditor() {
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNote(id)
      .then(setNote)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [id]);

  // ... render logic mixed with data logic
}

// ✅ Good: Extracted hook
function useNote(id: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // ... same logic
  }, [id]);

  return { note, isLoading, error };
}

function NoteEditor({ id }: Props) {
  const { note, isLoading, error } = useNote(id);
  // Clean render logic only
}
```

### Performance Patterns

**Memoization Guidelines:**

- [ ] Expensive calculations in useMemo
- [ ] Callback functions passed to children in useCallback
- [ ] Components with expensive renders wrapped in memo
- [ ] Dependencies arrays are correct

```typescript
// ✅ Good: Memoized expensive calculation
const sortedNotes = useMemo(
  () => notes.sort((a, b) => b.updatedAt - a.updatedAt),
  [notes],
);

// ✅ Good: Stable callback reference
const handleDelete = useCallback(
  (id: string) => {
    deleteNote(id);
  },
  [deleteNote],
);
```

---

## 3. UX Review Criteria

### Loading States Checklist

- [ ] Every async operation has a loading indicator
- [ ] Skeleton components for content loading
- [ ] Button disabled state during form submission
- [ ] Progress indicators for long operations
- [ ] Optimistic UI for common actions

```typescript
// ✅ Good: Optimistic update with rollback
async function handleLike() {
  const previousLikes = likes;
  setLikes((prev) => prev + 1); // Optimistic
  try {
    await likeNote(noteId);
  } catch {
    setLikes(previousLikes); // Rollback
    toast.error("Failed to like note");
  }
}
```

### Error Feedback Checklist

- [ ] User-friendly error messages (not technical jargon)
- [ ] Clear recovery actions ("Try again", "Go back")
- [ ] Form validation errors shown inline
- [ ] Network error handling with retry option
- [ ] Error boundaries for component crashes

### Empty States Checklist

- [ ] First-time user guidance
- [ ] "No results" for search/filter
- [ ] "No items yet" with CTA to create
- [ ] Helpful illustrations or icons
- [ ] Clear next action

### Accessibility Checklist

**ARIA & Semantics:**

- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] ARIA labels on icon-only buttons
- [ ] Role attributes where needed
- [ ] Live regions for dynamic content

**Keyboard Navigation:**

- [ ] All interactive elements focusable
- [ ] Tab order is logical
- [ ] Escape closes modals/dialogs
- [ ] Arrow keys for lists/menus
- [ ] Enter/Space activates buttons

**Focus Management:**

- [ ] Focus trap in modals
- [ ] Focus returns after modal close
- [ ] Skip links for main content
- [ ] Visible focus indicators

---

## 4. UI Review Criteria

### Tailwind Usage Checklist

**Design Tokens:**

- [ ] Using spacing scale (p-4, m-2) not arbitrary values (p-[17px])
- [ ] Using color palette (bg-primary, text-muted) not arbitrary colors
- [ ] Using font scale (text-sm, text-lg) consistently
- [ ] Using border-radius scale (rounded-md, rounded-lg)

```typescript
// ❌ Bad: Arbitrary values
<div className="p-[17px] text-[#3b82f6] rounded-[7px]">

// ✅ Good: Design tokens
<div className="p-4 text-primary rounded-lg">
```

**Class Organization:**

- [ ] Layout → Spacing → Typography → Colors → Effects
- [ ] Consistent ordering across codebase
- [ ] No duplicate classes

### Responsive Design Checklist

- [ ] Mobile-first approach (default styles for mobile)
- [ ] Breakpoints used consistently (sm, md, lg, xl)
- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44x44px
- [ ] Text readable without zoom

```typescript
// ✅ Good: Mobile-first responsive
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <aside className="w-full md:w-64">...</aside>
  <main className="flex-1">...</main>
</div>
```

### Dark Mode Checklist

- [ ] All components support dark mode
- [ ] Sufficient contrast in both modes
- [ ] Images/icons adapt or have dark variants
- [ ] No white flash on theme change
- [ ] User preference persisted

```typescript
// ✅ Good: Dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

---

## 5. AI Enhancement Criteria

### Current AI Usage Review

**Prompt Quality:**

- [ ] System prompt clearly defines assistant role
- [ ] Examples provided for complex tasks
- [ ] Output format specified
- [ ] Context limitations handled

```typescript
// ✅ Good: Structured prompt
const systemPrompt = `You are a helpful assistant that summarizes notes.
Rules:
- Keep summaries under 100 words
- Use bullet points for multiple items
- Preserve key dates and names

Output format: JSON { summary: string, keywords: string[] }`;
```

### AI Opportunity Categories

**Content Enhancement:**

- [ ] Auto-summarization for long content
- [ ] Smart title suggestions
- [ ] Tag/category recommendations
- [ ] Writing improvement suggestions

**Search & Discovery:**

- [ ] Semantic search across content
- [ ] Related item recommendations
- [ ] Smart filters and sorting

**Automation:**

- [ ] Auto-scheduling based on patterns
- [ ] Smart reminders
- [ ] Duplicate detection
- [ ] Data extraction from images/files

### Streaming Best Practices

```typescript
// ✅ Good: Streaming with proper UX
const { messages, isLoading, error } = useChat({
  api: '/api/ai/chat',
  onError: (error) => toast.error('AI unavailable'),
});

return (
  <div>
    {messages.map(m => <Message key={m.id} {...m} />)}
    {isLoading && <TypingIndicator />}
  </div>
);
```

---

## 6. Security & Performance Criteria

### Security Checklist

**Authentication:**

- [ ] Auth check on all protected routes
- [ ] Session validation on API routes
- [ ] Proper token storage (httpOnly cookies)
- [ ] CSRF protection on mutations

```typescript
// ✅ Good: Auth check in API route
export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... proceed with auth'd request
}
```

**Input Validation:**

- [ ] All user input validated with Zod/Yup
- [ ] File uploads validated (type, size)
- [ ] SQL/NoSQL injection prevented
- [ ] Path traversal prevented

**XSS Prevention:**

- [ ] User content escaped/sanitized
- [ ] No raw HTML insertion
- [ ] URL params validated
- [ ] CSP headers configured

### Performance Checklist

**Bundle Size:**

- [ ] No unnecessary dependencies
- [ ] Tree-shakeable imports
- [ ] Dynamic imports for heavy components
- [ ] Images optimized (next/image)

```typescript
// ✅ Good: Dynamic import
const HeavyEditor = dynamic(() => import('./HeavyEditor'), {
  loading: () => <EditorSkeleton />,
});
```

**Render Performance:**

- [ ] Large lists virtualized
- [ ] Expensive renders memoized
- [ ] No unnecessary re-renders
- [ ] useEffect cleanup implemented

```typescript
// ✅ Good: Effect cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (doc) => {
    setData(doc.data());
  });
  return () => unsubscribe(); // Cleanup
}, [docRef]);
```

**Data Loading:**

- [ ] Data cached appropriately
- [ ] Parallel fetching when possible
- [ ] Pagination for large datasets
- [ ] Prefetching for likely navigation

---

## Severity Rating Guide

### 🔴 Critical

- Security vulnerabilities (auth bypass, data exposure)
- Data loss risks
- Application crashes
- Blocking accessibility issues

### 🟠 Important

- Performance issues affecting UX
- Technical debt blocking development
- Accessibility gaps (WCAG AA violations)
- Inconsistent error handling

### 🟡 Suggested

- Code style improvements
- Minor optimizations
- Enhanced UX polish
- Documentation gaps

### 🟢 Positive

- Well-implemented patterns worth sharing
- Clean code examples
- Good testing coverage
- Accessible components

---

## See Also

- [SKILL.md](SKILL.md) - Main skill orchestration
- [metrics-collector.md](metrics-collector.md) - Pre-analysis metrics
- [auto-fixes.md](auto-fixes.md) - Auto-fix patterns
