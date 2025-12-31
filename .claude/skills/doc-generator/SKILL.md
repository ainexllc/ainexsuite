---
name: doc-generator
description: Generate and maintain consistent documentation for code, APIs, and architecture. Use when documenting functions, creating READMEs, or writing ADRs.
---

# Documentation Standards

## When to Use

- Documenting new functions/components
- Creating README files
- Writing Architecture Decision Records (ADRs)
- API documentation
- Code comments

## Quick Reference

### JSDoc Standards

```typescript
/**
 * Creates a new journal entry for the specified user.
 *
 * @param userId - The Firebase UID of the user
 * @param data - The journal entry form data
 * @param spaceId - Optional space ID (defaults to personal)
 * @returns The ID of the created entry
 * @throws {FirebaseError} If the write operation fails
 *
 * @example
 * const entryId = await createJournalEntry(user.uid, {
 *   title: 'My Day',
 *   content: 'Today was great...',
 *   mood: 'happy',
 *   tags: ['reflection']
 * });
 */
export async function createJournalEntry(
  userId: string,
  data: JournalEntryFormData,
  spaceId?: string,
): Promise<string> {
  // implementation
}
```

### Component Documentation

```typescript
/**
 * A reusable modal dialog component with customizable content and actions.
 *
 * @component
 * @example
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 */
interface ModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Optional title displayed in the modal header */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  // implementation
}
```

### README Template

```markdown
# App Name

Brief description of what this app does.

## Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Firebase project

### Installation

\`\`\`bash
pnpm install
\`\`\`

### Development

\`\`\`bash
pnpm dev
\`\`\`

### Environment Variables

| Variable                       | Description                | Required |
| ------------------------------ | -------------------------- | -------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key           | Yes      |
| `DATABASE_URL`                 | Database connection string | Yes      |

## Architecture

Brief overview of the app architecture.

### Key Files

- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/lib/` - Utility functions and hooks

## API Reference

### `GET /api/entries`

Retrieves journal entries for the authenticated user.

**Query Parameters:**

- `limit` (optional): Number of entries to return (default: 20)
- `offset` (optional): Pagination offset

**Response:**
\`\`\`json
{
"data": [...],
"meta": { "total": 100, "limit": 20, "offset": 0 }
}
\`\`\`

## Contributing

1. Create a feature branch
2. Make changes
3. Run `pnpm build` to verify
4. Submit PR

## License

MIT
```

### Architecture Decision Record (ADR)

```markdown
# ADR-001: Use Firebase Firestore for Data Storage

## Status

Accepted

## Context

We need a database solution for storing user data across our suite of applications.
Requirements:

- Real-time sync capabilities
- Offline support
- Scalable without ops overhead
- Works well with our auth system

## Decision

We will use Firebase Firestore as our primary database.

## Consequences

### Positive

- Real-time listeners out of the box
- Offline persistence built-in
- Scales automatically
- Integrates with Firebase Auth
- No server management needed

### Negative

- Vendor lock-in to Google Cloud
- Complex queries have limitations
- Costs can be unpredictable at scale
- Learning curve for security rules

### Neutral

- Need to design around document-based model
- Security rules are separate from application code

## Alternatives Considered

1. **PostgreSQL + Supabase**: Good real-time, but more ops overhead
2. **MongoDB Atlas**: Flexible schema, but no native offline sync
3. **PlanetScale**: Great for SQL, but no real-time

## Related

- ADR-002: Firestore Schema Design
- ADR-003: Security Rules Strategy
```

### Inline Comment Guidelines

```typescript
// GOOD: Explain WHY, not WHAT
// Using batch writes to ensure atomic updates across related documents
const batch = writeBatch(db);

// GOOD: Warn about non-obvious behavior
// Note: Firestore timestamps are server-generated, so createdAt
// won't be available immediately after addDoc returns
const docRef = await addDoc(collection(db, 'entries'), data);

// GOOD: Document workarounds
// Workaround for Firestore limitation: Can't query by month/day
// across years, so we fetch all entries and filter client-side
const entries = await getUserEntries(userId, { limit: 500 });

// BAD: Stating the obvious
// Loop through the array (adds no value)
for (const item of items) { ... }

// BAD: Outdated comment
// Returns user's email (but function now returns full profile)
function getUserProfile() { ... }
```

### API Documentation

```typescript
/**
 * @api {post} /api/entries Create Entry
 * @apiName CreateEntry
 * @apiGroup Entries
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiBody {String} title Entry title (max 200 chars)
 * @apiBody {String} content Entry content (max 50000 chars)
 * @apiBody {String[]} [tags] Optional tags (max 20)
 * @apiBody {String="happy","neutral","sad"} [mood] Mood indicator
 *
 * @apiSuccess {Object} data Created entry object
 * @apiSuccess {String} data.id Entry ID
 * @apiSuccess {String} data.title Entry title
 *
 * @apiError (400) ValidationError Invalid input data
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (500) ServerError Internal server error
 *
 * @apiExample {curl} Example:
 *     curl -X POST https://api.example.com/api/entries \
 *       -H "Authorization: Bearer xxx" \
 *       -d '{"title":"My Entry","content":"..."}'
 */
```

## Documentation Checklist

### Functions/Methods

- [ ] Purpose clearly stated
- [ ] Parameters documented with types
- [ ] Return value documented
- [ ] Errors/exceptions documented
- [ ] Example usage provided (for public APIs)

### Components

- [ ] Component purpose described
- [ ] Props interface documented
- [ ] Usage example provided
- [ ] Edge cases noted

### Files/Modules

- [ ] File header with purpose
- [ ] Exports documented
- [ ] Dependencies noted if unusual

### READMEs

- [ ] What the project does
- [ ] How to install/setup
- [ ] How to run/use
- [ ] Environment variables listed
- [ ] Contributing guidelines

## When NOT to Document

- Self-explanatory code (e.g., `getUserById(id)`)
- Temporary/experimental code
- Internal implementation details
- Obvious type information

## See Also

- [templates/readme.md](templates/readme.md) - README template
- [templates/adr.md](templates/adr.md) - ADR template
- [templates/component.md](templates/component.md) - Component doc template
