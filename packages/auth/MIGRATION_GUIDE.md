# Migration Guide: Using Shared Session Handlers

This guide shows how to migrate existing apps to use the shared session handlers from `@ainexsuite/auth`.

## Before (Each app has duplicate logic)

```typescript
// apps/journey/src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-app';
// ... 300+ lines of duplicate session logic
```

## After (Use shared handlers)

```typescript
// apps/journey/src/app/api/auth/session/route.ts
export { GET, POST, OPTIONS } from '@ainexsuite/auth/server/session-handlers';
```

That's it! Just 1 line instead of 300+.

## What This Provides

The shared session handlers automatically handle:

### GET Handler
- Session cookie verification
- CORS headers for cross-origin SSO
- Development mode with base64 decoding
- Production mode with Firebase Admin verification
- User data retrieval from Firestore

### POST Handler
- ID token verification
- Session cookie creation
- User document creation (new users)
- 30-day trial activation for all apps
- Trial upgrades for existing users
- Cookie domain configuration (.ainexsuite.com)
- Development mode with JWT parsing

### OPTIONS Handler
- CORS preflight responses
- Allowed origins: ainexsuite.com, localhost, 127.0.0.1

## Migration Steps

### Step 1: Remove local admin-app.ts (if it exists)

```bash
# If your app has its own admin-app.ts:
rm apps/your-app/src/lib/firebase/admin-app.ts
```

The shared `@ainexsuite/auth/server/admin` provides this functionality.

### Step 2: Replace session route

Replace your existing session route file:

```typescript
// apps/your-app/src/app/api/auth/session/route.ts
export { GET, POST, OPTIONS } from '@ainexsuite/auth/server/session-handlers';
```

### Step 3: Update custom API routes (if any)

If you have custom API routes using admin SDK:

Before:
```typescript
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-app';
```

After:
```typescript
import { getAdminAuth, getAdminFirestore } from '@ainexsuite/auth/server/admin';
```

### Step 4: Verify environment variables

Ensure `.env.local` has:
```bash
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 5: Test

```bash
pnpm dev
# Visit http://localhost:3001 (or your app's port)
# Test login flow
```

## Benefits

1. **DRY Principle**: No duplicate session logic across apps
2. **Consistency**: All apps use identical session management
3. **Maintainability**: Update session logic once, applies everywhere
4. **Type Safety**: Full TypeScript support
5. **SSO Ready**: Built-in CORS and cookie domain handling

## Apps Already Migrated

- [x] Main app (reference implementation)
- [ ] Journey
- [ ] Notes
- [ ] Todo
- [ ] Track
- [ ] Moments
- [ ] Grow
- [ ] Pulse
- [ ] Fit
- [ ] Projects
- [ ] Workflow
- [ ] Calendar

## Troubleshooting

### Build errors about Firebase Admin

Make sure `firebase-admin` is installed:
```bash
pnpm add -D firebase-admin
```

### Session verification fails

Check environment variables are set correctly:
```bash
echo $FIREBASE_ADMIN_CLIENT_EMAIL
echo $FIREBASE_ADMIN_PRIVATE_KEY | head -c 50
```

### CORS errors

The handlers automatically allow origins containing:
- `ainexsuite.com`
- `localhost`
- `127.0.0.1`

If you need additional origins, modify `isAllowedOrigin()` in `session-handlers.ts`.

## Need Help?

See `/packages/auth/src/server/README.md` for detailed documentation.
