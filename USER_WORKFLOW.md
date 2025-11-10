# AinexSuite User Workflow & Multi-App Management

## Overview
This document explains how users interact with AinexSuite apps, including domain access, authentication, and the multi-app dashboard system.

---

## Domain Structure

### Main Dashboard
- **Primary Domain**: `ainexsuite.com` or `www.ainexsuite.com`
- **Purpose**: Central hub for users with 2+ apps
- **Access**: Multi-app users are redirected here

### Individual Apps

Each app is accessible via **two domains**:

| App | Subdomain | Standalone Domain |
|-----|-----------|-------------------|
| Notes | `notes.ainexsuite.com` | `ainexnotes.com` |
| Journey | `journey.ainexsuite.com` | `ainexjourney.com` |
| Todo | `todo.ainexsuite.com` | `ainextodo.com` |
| Track | `track.ainexsuite.com` | `ainextrack.com` |
| Moments | `moments.ainexsuite.com` | `ainexmoments.com` |
| Grow | `grow.ainexsuite.com` | `ainexgrow.com` |
| Pulse | `pulse.ainexsuite.com` | `ainexpulse.com` |
| Fit | `fit.ainexsuite.com` | `ainexfit.com` |

---

## User Journey Scenarios

### Scenario 1: Single App User

**User Story**: Sarah discovers AinexNotes and wants to try it.

1. **Registration**:
   - Sarah visits `ainexnotes.com` or `notes.ainexsuite.com`
   - Clicks "Sign Up" and authenticates with Google
   - Firestore creates user profile with `appsUsed: { notes: timestamp }`

2. **Usage**:
   - Sarah uses Notes app at either domain
   - Authentication works on both domains:
     - `notes.ainexsuite.com` → Uses `.ainexsuite.com` cookie (SSO)
     - `ainexnotes.com` → Uses `ainexnotes.com` cookie (independent)
   - No dashboard redirect (only 1 app)

3. **Experience**:
   - ✅ Full access to Notes app
   - ✅ No suite subscription required
   - ✅ Can use either domain interchangeably
   - ❌ Does NOT see dashboard (only has 1 app)

### Scenario 2: Multi-App User (Dashboard Required)

**User Story**: John uses Notes and then discovers Journey.

1. **First App (Notes)**:
   - John visits `ainexnotes.com` and signs up
   - Uses Notes app for a week
   - Firestore: `appsUsed: { notes: timestamp }`

2. **Second App (Journey)**:
   - John discovers Journey and visits `ainexjourney.com`
   - Signs in with same Google account
   - Firestore detects: `appsUsed: { notes: timestamp, journey: timestamp }`
   - **System detects 2+ apps → User needs dashboard**

3. **Redirect Logic**:
   - On next login, John is redirected to `ainexsuite.com/workspace`
   - Dashboard shows all his apps (Notes, Journey)
   - Each app shows activation status, last used, etc.

4. **Accessing Apps**:
   - From dashboard, John clicks "Open Notes" → Opens `notes.ainexsuite.com`
   - From dashboard, John clicks "Open Journey" → Opens `journey.ainexsuite.com`
   - Authentication is seamless via `.ainexsuite.com` cookie

5. **Direct Access**:
   - John can still type `notes.ainexsuite.com` directly in browser
   - He stays authenticated (shared cookie domain)
   - App shows link to "Go to Dashboard" in navigation

6. **Standalone Domain Behavior**:
   - If John tries `ainexnotes.com` (standalone), system detects multi-app user
   - Option A: Redirect to `ainexsuite.com` dashboard
   - Option B: Allow access but show "You have multiple apps. Visit dashboard"

### Scenario 3: Trial & Subscription Logic

**User Story**: Maria wants to try 3 apps before subscribing.

1. **First Two Apps (Free)**:
   - Maria signs up for Notes → Works immediately
   - Maria activates Journey → Works immediately
   - Trial starts: 30 days to use both apps
   - Firestore: `trialStartDate: timestamp, appsUsed: { notes, journey }`

2. **During Trial (Days 1-30)**:
   - Maria uses both apps freely
   - Dashboard shows: "28 days left in your trial"
   - All features available

3. **Third App Activation**:
   - Maria wants to activate Todo app
   - System checks: `getAppsUsedCount(user) >= 2`
   - System checks: `isTrialActive(user)` → TRUE
   - ✅ Allows activation (trial still active)

4. **After Trial Expires (Day 31+)**:
   - Maria tries to activate Moments app
   - System checks: `needsSuiteAccess(user)` → TRUE
   - ❌ Shows paywall: "Upgrade to Suite to access more apps"
   - Maria's existing apps (Notes, Journey, Todo) still work

5. **Subscription**:
   - Maria subscribes to Suite
   - Firestore: `suiteAccess: true, subscriptionStatus: 'active'`
   - ✅ Can now activate all 9 apps

---

## Authentication Flow by Domain Type

### Subdomain Authentication (Shared SSO)

**How It Works**:
```
1. User logs in on www.ainexsuite.com
2. Firebase sets session cookie with domain=`.ainexsuite.com`
3. User navigates to notes.ainexsuite.com
4. Browser automatically sends cookie (same root domain)
5. User is authenticated ✅
```

**Benefits**:
- Seamless navigation between apps
- Single sign-on experience
- No re-authentication needed
- Dashboard integration works smoothly

**Applies To**:
- `www.ainexsuite.com` (main dashboard)
- `notes.ainexsuite.com`
- `journey.ainexsuite.com`
- `todo.ainexsuite.com`
- All other subdomains

### Standalone Domain Authentication (Independent)

**How It Works**:
```
1. User visits ainexnotes.com
2. No session cookie (different root domain from .ainexsuite.com)
3. User redirected to login page
4. User authenticates via Firebase
5. Session cookie set with domain=`ainexnotes.com`
6. User is authenticated on ainexnotes.com only
```

**Behavior**:
- Independent authentication per domain
- No SSO with subdomains
- Good for single-app users
- Requires re-login when switching to subdomains

**Applies To**:
- `ainexnotes.com`, `www.ainexnotes.com`
- `ainexjourney.com`, `www.ainexjourney.com`
- `ainextodo.com`, `www.ainextodo.com`
- All other standalone domains

---

## Multi-App Detection Logic

### Code Reference: `packages/auth/src/suite-utils.ts`

**Key Functions**:

```typescript
// Check if user has used 2+ apps
hasUsedMultipleApps(user: User): boolean

// Check if user needs Suite access
needsSuiteAccess(user: User): boolean

// Check if user can access a specific app
canAccessApp(user: User, appName: AppName): { allowed, reason? }
```

**Logic Flow**:

1. **User registers on any app**:
   - Firestore tracks: `appsUsed: { [appName]: firstAccessTimestamp }`

2. **User tries to access second app**:
   - System checks: `getAppsUsedCount(user)` → 1
   - ✅ Allows access (up to 2 apps free)
   - Starts 30-day trial if not started

3. **User tries to access third+ app**:
   - System checks: `hasUsedMultipleApps(user)` → TRUE
   - System checks: `isTrialActive(user)` → TRUE/FALSE
   - System checks: `user.suiteAccess` → TRUE/FALSE
   - Decision:
     - Trial active → ✅ Allow
     - Suite subscription → ✅ Allow
     - Neither → ❌ Show paywall

---

## Dashboard Redirect Logic

### When to Redirect to Dashboard

**Condition**: User has accessed 2+ apps (`hasUsedMultipleApps(user) === true`)

**Redirect Scenarios**:

1. **Login on any app**:
   - User logs in on `notes.ainexsuite.com`
   - System detects 2+ apps
   - Redirects to `ainexsuite.com/workspace`

2. **Login on standalone domain**:
   - User logs in on `ainexnotes.com`
   - System detects 2+ apps
   - **Option A**: Redirect to `ainexsuite.com/workspace`
   - **Option B**: Show banner "You have multiple apps. Visit dashboard"

3. **Direct navigation**:
   - User bookmarks `notes.ainexsuite.com`
   - User is already authenticated (SSO)
   - App loads normally, shows "Dashboard" link in nav

### Dashboard Features

**Location**: `apps/main/src/app/workspace/page.tsx`

**Shows**:
- List of all activated apps
- Last used timestamp per app
- Quick access buttons ("Open App")
- Trial/subscription status
- Activate new apps button

**Navigation**:
- "Open Notes" → `notes.ainexsuite.com`
- "Open Journey" → `journey.ainexsuite.com`
- All navigation stays within subdomains for SSO

---

## Implementation Requirements

### 1. Multi-App Detection on Login

**Location**: Each app's auth provider or middleware

```typescript
// Pseudo-code
if (user.authenticated) {
  const appsCount = getAppsUsedCount(user);

  if (appsCount >= 2) {
    // User has multiple apps
    router.push('https://www.ainexsuite.com/workspace');
  } else {
    // Single app user, proceed normally
    router.push('/workspace');
  }
}
```

### 2. App Activation Tracking

**Location**: Each app's initial load

```typescript
// Pseudo-code
useEffect(() => {
  if (user && !user.appsUsed?.[currentApp]) {
    // First time using this app
    await markAppAsUsed(currentApp);
  }
}, [user]);
```

### 3. Dashboard App List

**Location**: `apps/main/src/app/workspace/page.tsx`

```typescript
// Pseudo-code
const userApps = Object.keys(user.appsUsed);
// Show cards for each app with "Open" button
```

### 4. Paywall for 3+ Apps

**Location**: Each app's SuiteGuard component

```typescript
// Already implemented in packages/auth/src/suite-guard.tsx
<SuiteGuard appName={currentApp}>
  <YourAppContent />
</SuiteGuard>
```

---

## User Experience Guidelines

### Single App Users
- ✅ Can use standalone domain (`ainexnotes.com`) or subdomain
- ✅ Simple, focused experience
- ✅ No dashboard clutter
- ✅ Free forever (one app)

### Multi-App Users
- ✅ Forced to use dashboard as home
- ✅ Centralized view of all apps
- ✅ Seamless SSO across subdomains
- ✅ 30-day trial, then subscription required
- ✅ All apps accessible via subdomains

### Domain Preference
- **Subdomains** (`*.ainexsuite.com`): Best for multi-app users (SSO)
- **Standalone** (`ainexnotes.com`): Best for single-app users (simple branding)

---

## Technical Implementation Status

### ✅ Completed
- Multi-app detection logic (`suite-utils.ts`)
- App activation tracking
- SuiteGuard paywall component
- Trial and subscription logic
- Firestore user schema with `appsUsed`

### ⏳ Required Implementation
1. **Dashboard redirect on login** (2+ apps)
   - Update each app's auth flow
   - Redirect multi-app users to `ainexsuite.com/workspace`

2. **Standalone domain detection**
   - Detect if user logged in on standalone domain
   - Prompt to use dashboard if 2+ apps

3. **Dashboard app list UI**
   - Show all activated apps
   - "Open App" buttons linking to subdomains
   - Last used timestamps

4. **Navigation updates**
   - Add "Dashboard" link for multi-app users
   - Hide for single-app users

---

## Deployment Configuration

### Vercel Projects (One per app)

| Project | Root Directory | Domains |
|---------|---------------|---------|
| ainexsuite-main | `apps/main` | `ainexsuite.com`, `www.ainexsuite.com` |
| ainexsuite-notes | `apps/notes` | `notes.ainexsuite.com`, `ainexnotes.com`, `www.ainexnotes.com` |
| ainexsuite-journey | `apps/journey` | `journey.ainexsuite.com`, `ainexjourney.com`, `www.ainexjourney.com` |
| ainexsuite-todo | `apps/todo` | `todo.ainexsuite.com`, `ainextodo.com`, `www.ainextodo.com` |

### Environment Variables (All Apps)

```bash
NEXT_PUBLIC_APP_NAME=notes  # Change per app
NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com  # Same for all
# + All Firebase config variables
```

---

## Success Metrics

### User Acquisition
- Single app users → Easy onboarding, simple domain
- Multi-app users → Centralized dashboard, professional experience

### Conversion
- 2 free apps → Encourages exploration
- 30-day trial → Time to evaluate value
- Suite subscription → Unlock all 9 apps

### Retention
- SSO across subdomains → Seamless experience
- Dashboard → Easy access to all apps
- Individual domains → Shareable, memorable URLs

---

**Last Updated**: November 10, 2025
**Status**: Documentation complete, implementation partially complete
**Next Steps**: Implement dashboard redirect logic for multi-app users
