# Session Cookie Domain Fix for Standalone Domains

## Problem Discovered

When users accessed the notes app via `www.ainexnotes.com` (standalone domain), the session cookie authentication was failing with "Unauthorized - No session cookie" error.

## Root Cause

The session cookie was being set with a hardcoded domain `.ainexsuite.com`:

```typescript
res.cookies.set('__session', sessionCookie, {
  domain: '.ainexsuite.com',  // ❌ Only works for *.ainexsuite.com
  // ...
});
```

**The Issue**:
- Cookies set for `.ainexsuite.com` are ONLY readable by pages on `*.ainexsuite.com` domains
- Pages on `www.ainexnotes.com` cannot read cookies from `.ainexsuite.com`
- Result: Session cookie never reaches the client, causing "No session cookie" error

## Solution Implemented

Modified `/apps/notes/src/app/api/auth/session/route.ts` to detect the request hostname and set the appropriate cookie domain:

```typescript
// Detect cookie domain from request hostname
const hostname = request.headers.get('host') || '';
let cookieDomain = SESSION_COOKIE_DOMAIN; // Default: .ainexsuite.com

// If accessing via standalone domain (e.g., ainexnotes.com, www.ainexnotes.com)
if (hostname.includes('ainexnotes.com')) {
  cookieDomain = '.ainexnotes.com';
} else if (hostname.includes('ainexjourney.com')) {
  cookieDomain = '.ainexjourney.com';
} else if (hostname.includes('ainextodo.com')) {
  cookieDomain = '.ainextodo.com';
}
// ... (and so on for all standalone domains)
```

Then use the detected `cookieDomain` when setting the cookie:

```typescript
res.cookies.set('__session', sessionCookie, {
  domain: cookieDomain,  // ✅ Dynamic based on request hostname
  maxAge: SESSION_COOKIE_MAX_AGE / 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});
```

## How It Works

### Subdomain Access (e.g., notes.ainexsuite.com)
- Hostname: `notes.ainexsuite.com`
- Cookie domain: `.ainexsuite.com`
- Cookie is shared across all `*.ainexsuite.com` subdomains
- Enables SSO across: www, notes, journey, todo, etc.

### Standalone Domain Access (e.g., www.ainexnotes.com)
- Hostname: `www.ainexnotes.com`
- Cookie domain: `.ainexnotes.com`
- Cookie is shared across `ainexnotes.com` and `www.ainexnotes.com`
- Isolated from other apps (no SSO)

## Testing

After deploying this fix:

1. **Test on subdomain**:
   - Visit `notes.ainexsuite.com`
   - Sign in with Google
   - Check DevTools → Application → Cookies
   - Verify cookie domain is `.ainexsuite.com`

2. **Test on standalone domain**:
   - Visit `www.ainexnotes.com`
   - Sign in with Google
   - Check DevTools → Application → Cookies
   - Verify cookie domain is `.ainexnotes.com`

3. **Test SSO on subdomain**:
   - Sign in on `notes.ainexsuite.com`
   - Navigate to `www.ainexsuite.com`
   - Should remain authenticated (shared cookie)

4. **Test SSO on standalone**:
   - Sign in on `www.ainexnotes.com`
   - Navigate to `www.ainexjourney.com`
   - Should require new login (separate cookies)

## Impact on Other Apps

This fix needs to be applied to ALL apps that support standalone domains:

- ✅ **notes** - Fixed in this commit
- ⏳ **journey** - Needs same fix
- ⏳ **todo** - Needs same fix
- ⏳ **track** - Needs same fix
- ⏳ **moments** - Needs same fix
- ⏳ **grow** - Needs same fix
- ⏳ **pulse** - Needs same fix
- ⏳ **fit** - Needs same fix

## Deployment Checklist

- [x] Update `apps/notes/src/app/api/auth/session/route.ts`
- [ ] Test on Vercel deployment
- [ ] Verify authentication works on `www.ainexnotes.com`
- [ ] Apply same fix to other apps
- [ ] Update documentation

## Related Files

- `/apps/notes/src/app/api/auth/session/route.ts` - Session cookie creation
- `/packages/firebase/src/config.ts` - Default cookie domain configuration
- `/DNS_CONFIGURATION.md` - Domain architecture documentation

---
*Fix implemented: November 11, 2025*
*Issue discovered during notes app production deployment*
