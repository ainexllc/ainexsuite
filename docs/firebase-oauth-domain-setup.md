# Firebase OAuth Authorized Domains Setup

## Issue

When trying to log in to the Workflow app (or any app) with Google OAuth, you may see this error in the browser console:

```
Info: The current domain is not authorized for OAuth operations.
This will prevent signInWithPopup, signInWithRedirect, linkWithPopup
and linkWithRedirect from working. Add your domain (workflow.ainexsuite.com)
to the OAuth redirect domains list in the Firebase console -> Authentication
-> Settings -> Authorized domains tab.
```

## Root Cause

Firebase requires all domains that use Google OAuth to be explicitly whitelisted in the Firebase Console. This is a security feature to prevent unauthorized domains from using your Firebase project for authentication.

## Solution: Add Domain to Firebase Authorized Domains

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (AinexSuite or the relevant project)

### Step 2: Navigate to Authentication Settings

1. Click on **Authentication** in the left sidebar
2. Click on the **Settings** tab at the top
3. Scroll down to **Authorized domains** section

### Step 3: Add Missing Domains

Click **Add domain** and add the following domains (as needed):

#### Production Domains
```
workflow.ainexsuite.com
main.ainexsuite.com
journey.ainexsuite.com
notes.ainexsuite.com
tasks.ainexsuite.com
track.ainexsuite.com
moments.ainexsuite.com
grow.ainexsuite.com
pulse.ainexsuite.com
fit.ainexsuite.com
projects.ainexsuite.com
admin.ainexsuite.com
```

#### Development/Testing Domains (if applicable)
```
localhost
127.0.0.1
```

**Note**: `localhost` should already be authorized by default for development.

### Step 4: Verify Changes

1. After adding the domains, wait a few minutes for changes to propagate
2. Clear your browser cache or open an incognito window
3. Try logging in again with Google OAuth

## Expected Behavior After Fix

- Google Sign-In popup should open without errors
- Authentication should complete successfully
- No OAuth domain errors in the console

## Related Issues

### Passive Event Listener Warnings

You may also see warnings like:
```
[Violation] Added non-passive event listener to a scroll-blocking event
```

These are harmless performance warnings from Firebase's OAuth library and have been fixed in the codebase with the passive event listener fix (`apps/workflow/src/lib/passive-event-fix.ts`).

## Checklist

- [ ] Access Firebase Console
- [ ] Navigate to Authentication > Settings > Authorized domains
- [ ] Add `workflow.ainexsuite.com` (and any other missing domains)
- [ ] Wait for changes to propagate (2-5 minutes)
- [ ] Clear browser cache
- [ ] Test Google OAuth login
- [ ] Verify no domain errors in console

## Verification Command

After setup, you can verify the authorized domains by checking your Firebase project settings or by attempting to sign in and checking the browser console for the absence of domain authorization errors.

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Authorized Domains](https://firebase.google.com/docs/auth/web/redirect-best-practices#authorized-domains)
- [OAuth Best Practices](https://firebase.google.com/docs/auth/web/google-signin)

---

**Last Updated**: 2025-11-20
**Issue**: Workflow app Google OAuth domain not authorized
**Status**: Requires Firebase Console access to fix
