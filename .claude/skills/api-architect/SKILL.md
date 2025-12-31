---
name: api-architect
description: Design RESTful APIs with proper documentation, typing, and error responses. Use when creating API routes, documenting endpoints, reviewing API design, or implementing middleware.
---

# API Design Specialist

## When to Use
- Creating new API routes
- Documenting existing endpoints
- Reviewing API design
- Implementing authentication middleware
- Handling request validation
- Standardizing error responses

## Quick Reference

### Next.js App Router API Route
```typescript
// app/api/entries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const CreateEntrySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  tags: z.array(z.string()).optional().default([]),
});

// Response types
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface Entry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /api/entries
 * List all entries for the authenticated user
 *
 * Query params:
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 * - sort: 'createdAt' | 'updatedAt' (default: 'createdAt')
 *
 * Returns: { data: Entry[] }
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse<never>>(
        { error: { code: 'UNAUTHORIZED', message: 'Please sign in' } },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
    const offset = Number(searchParams.get('offset')) || 0;

    // Fetch data
    const entries = await getEntriesForUser(userId, { limit, offset });

    return NextResponse.json<ApiResponse<Entry[]>>({ data: entries });
  } catch (error) {
    console.error('[GET /api/entries]', error);
    return NextResponse.json<ApiResponse<never>>(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch entries' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entries
 * Create a new entry
 *
 * Body: { title: string, content: string, tags?: string[] }
 * Returns: { data: Entry }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse<never>>(
        { error: { code: 'UNAUTHORIZED', message: 'Please sign in' } },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const result = CreateEntrySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: result.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Create entry
    const entry = await createEntry(userId, result.data);

    return NextResponse.json<ApiResponse<Entry>>(
      { data: entry },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/entries]', error);
    return NextResponse.json<ApiResponse<never>>(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create entry' } },
      { status: 500 }
    );
  }
}
```

### Dynamic Route with Path Params
```typescript
// app/api/entries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/entries/:id
 * Get a single entry by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Please sign in' } },
        { status: 401 }
      );
    }

    const entry = await getEntry(id);

    if (!entry) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Entry not found' } },
        { status: 404 }
      );
    }

    // Check ownership
    if (entry.ownerId !== userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: entry });
  } catch (error) {
    console.error('[GET /api/entries/:id]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch entry' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/entries/:id
 * Update an entry
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Similar pattern...
}

/**
 * DELETE /api/entries/:id
 * Delete an entry
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Similar pattern...
}
```

### Auth Middleware Pattern
```typescript
// lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@ainexsuite/firebase';

type Handler = (
  request: NextRequest,
  context: { userId: string }
) => Promise<NextResponse>;

export function withAuth(handler: Handler) {
  return async (request: NextRequest) => {
    try {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Missing token' } },
          { status: 401 }
        );
      }

      const decodedToken = await auth.verifyIdToken(token);
      return handler(request, { userId: decodedToken.uid });
    } catch {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
  };
}

// Usage
export const GET = withAuth(async (request, { userId }) => {
  const entries = await getEntriesForUser(userId);
  return NextResponse.json({ data: entries });
});
```

### Rate Limiting
```typescript
// lib/api/rate-limit.ts
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetIn: record.resetTime - now,
  };
}

// Usage in route
const { allowed, remaining, resetIn } = checkRateLimit(userId, 100, 60000);
if (!allowed) {
  return NextResponse.json(
    { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
      },
    }
  );
}
```

## API Design Standards

### URL Structure
```
GET    /api/entries          - List entries
POST   /api/entries          - Create entry
GET    /api/entries/:id      - Get single entry
PATCH  /api/entries/:id      - Update entry
DELETE /api/entries/:id      - Delete entry

GET    /api/entries/:id/comments     - List comments for entry
POST   /api/entries/:id/comments     - Add comment to entry
```

### Response Format
```typescript
// Success
{ "data": { ... } }
{ "data": [ ... ] }

// Error
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }  // Optional, for validation errors
  }
}
```

### HTTP Status Codes
| Code | When to Use |
|------|-------------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (logged in but no access) |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

### Naming Conventions
- Use plural nouns: `/entries` not `/entry`
- Use kebab-case: `/journal-entries` not `/journalEntries`
- Version if needed: `/api/v2/entries`
- Keep URLs shallow: max 2 levels deep

## Checklist for New API Routes

- [ ] Define request/response types
- [ ] Add Zod validation for request body
- [ ] Implement auth check
- [ ] Handle all error cases with proper status codes
- [ ] Add JSDoc comments with description
- [ ] Log errors server-side (not to client)
- [ ] Consider rate limiting for expensive operations
- [ ] Test with curl or Postman

## See Also
- [templates.md](templates.md) - Copy-paste templates
- [examples.md](examples.md) - Real examples from this codebase
