# Server-Side Auth Utilities

This directory contains shared server-side authentication utilities for all AINexSuite apps.

## Files

### `admin.ts`
Provides Firebase Admin SDK initialization and helper functions:
- `getAdminApp()` - Get or initialize Firebase Admin app
- `getAdminAuth()` - Get Firebase Admin Auth instance
- `getAdminFirestore()` - Get Firebase Admin Firestore instance
- `getAdminStorage()` - Get Firebase Admin Storage instance

### `session-handlers.ts`
Provides ready-to-use Next.js route handlers for session management:
- `GET` - Check session status (for SSO checking)
- `POST` - Create session from ID token
- `OPTIONS` - Handle CORS preflight

## Usage

### Using Session Handlers

The simplest way to add session management to any Next.js app:

```typescript
// app/api/auth/session/route.ts
export { GET, POST, OPTIONS } from '@ainexsuite/auth/server/session-handlers';
```

That's it! No need to duplicate the session logic across apps.

### Using Admin Functions

For custom API routes that need Firebase Admin SDK:

```typescript
// app/api/custom/route.ts
import { getAdminAuth, getAdminFirestore } from '@ainexsuite/auth/server/admin';

export async function GET() {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminFirestore();

  // Use admin SDK as needed
  const user = await adminAuth.getUser('some-uid');
  const doc = await adminDb.collection('users').doc('some-uid').get();

  return Response.json({ user, data: doc.data() });
}
```

## Environment Variables

Make sure these environment variables are set in your app's `.env.local`:

```bash
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Features

### Development Mode
- Simple base64 session cookies (no Firebase Admin SDK required)
- Mock user data with all apps pre-activated
- JWT parsing for dev tokens

### Production Mode
- Full Firebase Admin SDK integration
- Session cookie verification
- User document creation with 30-day trial
- Auto-activation of all apps for new users
- Existing user trial upgrades

### CORS Support
- Automatic CORS headers for cross-origin SSO
- Allows origins containing 'ainexspace.com', 'localhost', or '127.0.0.1'
- Credentials support for cookie-based auth

### Cookie Domain
- Uses `getSessionCookieDomain()` from `@ainexsuite/firebase/config`
- `.ainexspace.com` in production (shared across all subdomains)
- `.localhost` in development (shared across all localhost ports)

## Trial Access

New users automatically get:
- 30-day trial period
- Access to all apps: notes, journey, todo, track, moments, grow, pulse, fit, projects, workflow, calendar
- `suiteAccess: true` during trial
- Apps auto-activated (no activation modal required)

Existing users without app access are automatically upgraded to the 30-day trial on login.
