# Firebase Authentication Multi-Domain Setup Guide

## Overview
Complete configuration guide for Firebase Authentication across 7 Next.js apps with dual-domain support (subdomain + standalone).

**Last Updated**: November 10, 2025
**Status**: Ready for implementation

---

## Part 1: Firebase Console Configuration

### Step 1: Add Authorized Domains

Navigate to: **Firebase Console → Authentication → Settings → Authorized domains**

Click "Add domain" and add ALL of these 22 domains:

```
# Main Dashboard
ainexsuite.com
www.ainexsuite.com

# Journey App
journey.ainexsuite.com
ainexjourney.com
www.ainexjourney.com

# Notes App
notes.ainexsuite.com
ainexnotes.com
www.ainexnotes.com

# Tasks App
tasks.ainexsuite.com
ainextasks.com
www.ainextasks.com

# Moments App
moments.ainexsuite.com
ainexmoments.com
www.ainexmoments.com

# Grow App
grow.ainexsuite.com
ainexgrow.com
www.ainexgrow.com

# Track App
track.ainexsuite.com
ainextrack.com
www.ainextrack.com

# Development
localhost
```

**Total domains**: 22

---

## Part 2: Google Cloud OAuth 2.0 Configuration

Navigate to: **Google Cloud Console → APIs & Services → Credentials**

Find your OAuth 2.0 Client ID or create a new one:

### Authorized JavaScript Origins (28 origins)

```
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://localhost:3003
http://localhost:3004
http://localhost:3005
http://localhost:3006
https://ainexsuite.com
https://www.ainexsuite.com
https://journey.ainexsuite.com
https://ainexjourney.com
https://www.ainexjourney.com
https://notes.ainexsuite.com
https://ainexnotes.com
https://www.ainexnotes.com
https://tasks.ainexsuite.com
https://ainextasks.com
https://www.ainextasks.com
https://moments.ainexsuite.com
https://ainexmoments.com
https://www.ainexmoments.com
https://grow.ainexsuite.com
https://ainexgrow.com
https://www.ainexgrow.com
https://track.ainexsuite.com
https://ainextrack.com
https://www.ainextrack.com
```

### Authorized Redirect URIs (28 URIs)

```
http://localhost:3000/__/auth/handler
http://localhost:3001/__/auth/handler
http://localhost:3002/__/auth/handler
http://localhost:3003/__/auth/handler
http://localhost:3004/__/auth/handler
http://localhost:3005/__/auth/handler
http://localhost:3006/__/auth/handler
https://ainexsuite.com/__/auth/handler
https://www.ainexsuite.com/__/auth/handler
https://journey.ainexsuite.com/__/auth/handler
https://ainexjourney.com/__/auth/handler
https://www.ainexjourney.com/__/auth/handler
https://notes.ainexsuite.com/__/auth/handler
https://ainexnotes.com/__/auth/handler
https://www.ainexnotes.com/__/auth/handler
https://tasks.ainexsuite.com/__/auth/handler
https://ainextasks.com/__/auth/handler
https://www.ainextasks.com/__/auth/handler
https://moments.ainexsuite.com/__/auth/handler
https://ainexmoments.com/__/auth/handler
https://www.ainexmoments.com/__/auth/handler
https://grow.ainexsuite.com/__/auth/handler
https://ainexgrow.com/__/auth/handler
https://www.ainexgrow.com/__/auth/handler
https://track.ainexsuite.com/__/auth/handler
https://ainextrack.com/__/auth/handler
https://www.ainextrack.com/__/auth/handler
```

---

## Part 3: Environment Variables

### Required Variables for Each App

Add these to **Vercel Project Settings → Environment Variables** for each of the 7 apps:

```bash
# App Identity (CHANGE PER APP)
NEXT_PUBLIC_APP_NAME=journey        # journey, notes, tasks, moments, grow, track
NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com
NEXT_PUBLIC_SUBDOMAIN=journey.ainexsuite.com
NEXT_PUBLIC_STANDALONE_DOMAIN=ainexjourney.com

# Firebase Client Config (SAME FOR ALL APPS)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=alnexsuite.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=alnexsuite.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Server Config (SAME FOR ALL APPS - MARK AS SECRET)
FIREBASE_PROJECT_ID=alnexsuite
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@alnexsuite.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Environment Variable Template

| App | NEXT_PUBLIC_APP_NAME | NEXT_PUBLIC_SUBDOMAIN | NEXT_PUBLIC_STANDALONE_DOMAIN |
|-----|---------------------|----------------------|-------------------------------|
| Main | main | www.ainexsuite.com | - |
| Journey | journey | journey.ainexsuite.com | ainexjourney.com |
| Notes | notes | notes.ainexsuite.com | ainexnotes.com |
| Tasks | tasks | tasks.ainexsuite.com | ainextasks.com |
| Moments | moments | moments.ainexsuite.com | ainexmoments.com |
| Grow | grow | grow.ainexsuite.com | ainexgrow.com |
| Track | track | track.ainexsuite.com | ainextrack.com |

---

## Part 4: Code Implementation

### Files Created/Modified

1. **✅ `packages/auth/src/session-manager.ts`** - NEW
   - Session cookie management
   - Domain detection (subdomain vs standalone)
   - Cookie creation with appropriate domain
   - Session clearing logic

2. **⏳ `apps/*/src/app/api/auth/session/route.ts`** - TO CREATE
   - API endpoint for session cookie creation
   - Firebase Admin SDK integration
   - Needs to be copied to all 7 apps

3. **⏳ `packages/auth/src/auth.ts`** - TO UPDATE
   - Enhanced Google sign-in with redirect result handling
   - Multi-app detection and routing
   - Session creation integration

4. **⏳ `packages/auth/src/AuthContext.tsx`** - TO UPDATE
   - Redirect result handling
   - Session verification
   - Domain type detection

5. **⏳ `apps/*/src/middleware.ts`** - TO CREATE
   - Session cookie verification
   - Protected route handling
   - Needs to be copied to all 7 apps

---

## Part 5: Authentication Flow

### Subdomain SSO Flow

```
1. User visits www.ainexsuite.com
2. Clicks "Sign in with Google"
3. Google OAuth flow completes
4. Session cookie created with domain=".ainexsuite.com"
5. User navigates to journey.ainexsuite.com
6. Browser sends cookie (same root domain)
7. User is authenticated ✅
```

**Benefits:**
- Seamless navigation between apps
- Single sign-on experience
- Best for multi-app users

### Standalone Domain Flow

```
1. User visits ainexjourney.com
2. Clicks "Sign in with Google"
3. Google OAuth flow completes
4. Session cookie created with domain="ainexjourney.com"
5. User navigates to ainexnotes.com
6. No cookie sent (different domain)
7. User must login again ✅
```

**Benefits:**
- Independent authentication
- Better for single-app users
- Great for marketing specific apps

---

## Part 6: Testing Checklist

### Pre-Deployment (Localhost)

- [ ] Start all 7 apps on different ports (3000-3006)
- [ ] Test Google sign-in on each app
- [ ] Verify session cookie is set
- [ ] Test logout clears session
- [ ] Check Firebase Console for new users

### Post-Deployment (Subdomain SSO)

- [ ] Login on www.ainexsuite.com
- [ ] Navigate to journey.ainexsuite.com → Stay logged in
- [ ] Navigate to notes.ainexsuite.com → Stay logged in
- [ ] Navigate to tasks.ainexsuite.com → Stay logged in
- [ ] Logout from any subdomain → Logged out everywhere

### Post-Deployment (Standalone)

- [ ] Login on ainexjourney.com
- [ ] Navigate to ainexnotes.com → NOT logged in (expected)
- [ ] Login on ainexnotes.com → Works independently
- [ ] Verify separate session cookies

### Multi-App User Flow

- [ ] User with 2+ apps logs in on standalone domain
- [ ] Should redirect to www.ainexsuite.com/workspace
- [ ] Dashboard shows all user's apps
- [ ] Click "Open Journey" → Opens journey.ainexsuite.com with SSO
- [ ] Click "Open Notes" → Opens notes.ainexsuite.com with SSO

### Single-App User Flow

- [ ] User with only Journey app logs in
- [ ] Should stay on ainexjourney.com or journey.ainexsuite.com
- [ ] Should NOT redirect to main dashboard
- [ ] Works normally

---

## Part 7: Deployment Steps

### Before Deploying

1. **Add all 22 domains to Firebase Console** ✅ (Manual step)
2. **Configure OAuth redirect URIs** ✅ (Manual step)
3. **Get Firebase credentials** ✅ (API key, service account)
4. **Prepare environment variables** ⏳ (One template for all apps)

### During Deployment

1. **Create Vercel projects** (7 total)
2. **Add environment variables** to each project
3. **Deploy all apps**
4. **Wait for DNS propagation** (24-48 hours)
5. **Add domains to Vercel** projects
6. **Verify SSL certificates** issued

### After Deployment

1. **Test authentication** on all domains
2. **Verify SSO** across subdomains
3. **Test standalone** domain independence
4. **Monitor logs** in Firebase and Vercel
5. **Check analytics** for login events

---

## Part 8: Troubleshooting

### Common Issues

**"redirect_uri_mismatch"**
- **Cause**: Missing redirect URI in Google Cloud Console
- **Fix**: Add all 28 redirect URIs with `/__/auth/handler`

**Session cookie not set**
- **Cause**: Cookie domain mismatch or API route error
- **Fix**: Check browser console, verify `/api/auth/session` works

**SSO not working across subdomains**
- **Cause**: Cookie domain not `.ainexsuite.com`
- **Fix**: Verify `SessionManager.getDomainConfig()` returns correct domain

**User redirected to wrong app**
- **Cause**: App detection logic error
- **Fix**: Check `NEXT_PUBLIC_APP_NAME` environment variable

**Logout doesn't clear session**
- **Cause**: Cookie domain mismatch during clearing
- **Fix**: Ensure `SessionManager.clearSession()` uses same domain logic

---

## Part 9: Security Checklist

- [ ] All cookies have `Secure` flag in production
- [ ] All cookies have `SameSite=lax`
- [ ] Session expires after 14 days
- [ ] HTTPS enforced on all domains
- [ ] Firebase Admin SDK key stored as Vercel secret
- [ ] No API keys committed to git
- [ ] CORS configured correctly
- [ ] Environment variables use `NEXT_PUBLIC_` prefix for client-side only

---

## Part 10: Monitoring

### Firebase Console

Monitor these sections:
- **Authentication → Users**: New signups
- **Authentication → Sign-in methods**: Provider status
- **Firestore → Data**: User profiles
- **Functions → Logs**: Session creation errors

### Vercel Logs

Check each project for:
- Build errors
- Runtime errors
- API route failures
- Redirect issues

### Analytics Events

Track these custom events:
- `login` - Successful Google sign-in
- `session_created` - Session cookie created
- `logout` - User logged out
- `app_switch` - User navigates between apps

---

## Summary

**Configuration Totals:**
- 22 Authorized domains in Firebase
- 28 JavaScript origins in Google OAuth
- 28 Redirect URIs in Google OAuth
- 7 Vercel projects to configure
- 7 sets of environment variables

**Key Features:**
✅ SSO across all `.ainexsuite.com` subdomains
✅ Independent auth for standalone domains
✅ Smart routing based on user's apps
✅ Secure 14-day session cookies
✅ Production-ready error handling

**Next Steps:**
1. Complete Firebase Console setup (22 domains)
2. Complete Google OAuth setup (28 origins + 28 URIs)
3. Implement remaining code files (API routes, middleware)
4. Deploy to Vercel
5. Test all authentication flows

---

**References:**
- Firebase Console: https://console.firebase.google.com/project/alnexsuite
- Google Cloud Console: https://console.cloud.google.com
- Vercel Dashboard: https://vercel.com/dinohorn35-gmailcoms-projects
