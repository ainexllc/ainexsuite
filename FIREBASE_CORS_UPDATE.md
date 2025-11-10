# Firebase Cloud Functions CORS Configuration

## Overview
To support authentication across both subdomain (notes.ainexsuite.com) and standalone domain (ainexnotes.com) deployments, Firebase Cloud Functions need to be updated with proper CORS configuration.

## Current Status
The Firebase functions (`functions/src/index.ts`) currently don't have explicit CORS headers. They work for `onCall` functions when called from Firebase SDK clients, but for standalone domains, we need to ensure proper CORS support.

## Required Updates

### 1. Session Cookie Domain Configuration

The session cookie should be set with domain `.ainexsuite.com` to work across all subdomains.

**Location**: Server-side code that sets the session cookie

```typescript
// In your Next.js API routes (e.g., apps/main/src/app/api/auth/session/route.ts)
response.cookies.set('session', sessionCookie, {
  domain: '.ainexsuite.com',  // Works for all *.ainexsuite.com subdomains
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 14, // 14 days
  path: '/',
});
```

### 2. Add CORS Middleware for Standalone Domains

For standalone domains (ainexnotes.com, ainexjourney.com, etc.), authentication will need to be handled independently since they don't share the `.ainexsuite.com` cookie domain.

**Recommended Approach**:
1. **Subdomains** (notes.ainexsuite.com): Share authentication via `.ainexsuite.com` cookie
2. **Standalone domains** (ainexnotes.com): Require separate login, store session in own domain

### 3. Update Firebase Functions (If Needed)

If you add HTTP functions (not `onCall`), add CORS:

```typescript
import * as cors from 'cors';

const corsHandler = cors({
  origin: [
    'https://www.ainexsuite.com',
    'https://ainexsuite.com',
    'https://notes.ainexsuite.com',
    'https://journey.ainexsuite.com',
    'https://todo.ainexsuite.com',
    'https://ainexnotes.com',
    'https://www.ainexnotes.com',
    'https://ainexjourney.com',
    'https://www.ainexjourney.com',
    'https://ainextodo.com',
    'https://www.ainextodo.com',
    // Development
    /^https?://localhost:\d+$/,
  ],
  credentials: true,
});

export const myHttpFunction = functions
  .region('us-central1')
  .https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
      // Your function logic here
    });
  });
```

## Authentication Flow by Domain Type

### Subdomain Flow (notes.ainexsuite.com)
1. User logs in on www.ainexsuite.com
2. Session cookie set with domain=`.ainexsuite.com`
3. User navigates to notes.ainexsuite.com
4. Cookie automatically sent with request
5. User is authenticated ✅

### Standalone Domain Flow (ainexnotes.com)
1. User navigates to ainexnotes.com
2. No session cookie (different root domain)
3. Redirected to login page
4. User logs in via Firebase Auth
5. Session cookie set with domain=`ainexnotes.com`
6. User is authenticated on ainexnotes.com only

### Multi-App User Behavior
- **Single App User (1 app)**:
  - Can use standalone domain (`ainexnotes.com`) OR subdomain (`notes.ainexsuite.com`)
  - No dashboard redirect
  - Simple, focused experience

- **Multi-App User (2+ apps)**:
  - System detects `appsUsed` count >= 2
  - On login, redirected to `ainexsuite.com/workspace` (dashboard)
  - Dashboard shows all activated apps
  - Clicks "Open Notes" → Opens `notes.ainexsuite.com` (SSO)
  - Can still directly access `notes.ainexsuite.com` (shows "Dashboard" link)

### Cross-Domain Considerations
- **Subdomain apps**: Share authentication via `.ainexsuite.com` cookie (SSO)
- **Standalone apps**: Independent authentication per domain
- **Main dashboard** (www.ainexsuite.com): Required for users with 2+ apps
- **Trial & Subscription**: 30-day trial starts when user activates 2nd app
- **Paywall**: Shows when trying to activate 3rd+ app after trial expires

See `USER_WORKFLOW.md` for complete user journey scenarios and implementation details.

## Implementation Steps

### Phase 1: Verify Current Setup
1. Check that session cookies work on `.ainexsuite.com`
2. Test authentication flows on subdomains
3. Verify Firebase `onCall` functions work from all origins

### Phase 2: Add CORS (If HTTP Functions Used)
1. Install CORS package: `npm install cors @types/cors`
2. Update HTTP functions with CORS middleware
3. Add all allowed origins (subdomains + standalone domains)

### Phase 3: Update Client-Side Auth
1. Detect current domain in auth code
2. Set appropriate cookie domain based on URL
3. Handle redirects for cross-domain navigation

### Phase 4: Test All Scenarios
1. Login on www.ainexsuite.com → Navigate to notes.ainexsuite.com
2. Login on ainexnotes.com → Stay on ainexnotes.com
3. Navigate from notes.ainexsuite.com → ainexnotes.com (requires re-login)
4. Navigate from ainexnotes.com → notes.ainexsuite.com (requires re-login)

## Environment Variables

No additional environment variables needed. The current Firebase configuration supports this architecture.

## Security Considerations

1. **Cookie Security**:
   - Always use `httpOnly: true` for session cookies
   - Always use `secure: true` in production
   - Use `sameSite: 'lax'` for cross-subdomain navigation

2. **CORS Restrictions**:
   - Only allow known domains in CORS configuration
   - Never use wildcard (`*`) in production
   - Verify origin header in all HTTP functions

3. **Session Management**:
   - Implement proper session expiration (14 days default)
   - Allow users to revoke sessions from dashboard
   - Clear cookies on logout

## Testing Checklist

- [ ] Login on www.ainexsuite.com works
- [ ] Navigate to notes.ainexsuite.com maintains session
- [ ] Login on ainexnotes.com works independently
- [ ] Session cookies have correct domain attribute
- [ ] CORS headers present in all responses
- [ ] Cross-origin credentials work properly
- [ ] Logout clears cookies correctly
- [ ] Session expiration works as expected

## Current Status: ✅ READY

The current Firebase functions are already configured correctly for `onCall` functions. The Firebase SDK automatically handles CORS for these functions.

**No immediate changes required** unless you:
1. Add new HTTP functions (not `onCall`)
2. Need to modify session cookie domain behavior
3. Encounter CORS issues during testing

## Next Steps

1. Deploy the 4 Vercel projects
2. Test authentication on subdomains
3. Test authentication on standalone domains
4. Monitor for any CORS errors
5. Update this document with actual findings

---

**Last Updated**: November 10, 2025
**Firebase Project**: alnexsuite
**Region**: us-central1
