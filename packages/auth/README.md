# @ainexsuite/auth

> SSO authentication with session cookies for AINexSuite

Unified authentication system providing Single Sign-On (SSO) across all AINexSuite applications using Firebase Authentication and domain-wide session cookies.

## Features

- **Single Sign-On (SSO)** - One login works across all apps
- **Silent Authentication** - Automatic login via session cookies
- **App Activation** - Explicit user consent before app access
- **Email Detection** - Prevents duplicate accounts
- **Session Management** - Comprehensive session lifecycle handling
- **Error Handling** - User-friendly error messages and recovery
- **TypeScript Support** - Full type safety

## Installation

```bash
pnpm add @ainexsuite/auth
```

## Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import { AuthProvider } from '@ainexsuite/auth';

export default function App({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
```

### 2. Use authentication in components

```tsx
import { useAuth } from '@ainexsuite/auth';

export function UserProfile() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### 3. Protect routes

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### 4. Add app activation

```tsx
import { AppActivationModal, useAppActivation } from '@ainexsuite/auth';

export default function AppPage() {
  const { needsActivation, checking } = useAppActivation('notes');

  if (needsActivation && !checking) {
    return (
      <AppActivationModal
        appName="notes"
        appDisplayName="Notes"
        onActivated={() => window.location.reload()}
      />
    );
  }

  return <AppContent />;
}
```

## API Reference

### Authentication Hook

#### `useAuth()`

Returns the current authentication state.

```tsx
const { user, firebaseUser, loading, signOut, logout } = useAuth();
```

**Returns:**
- `user: User | null` - User data from Firestore
- `firebaseUser: FirebaseUser | null` - Firebase Auth user
- `loading: boolean` - Authentication state loading
- `signOut: () => Promise<void>` - Sign out function
- `logout: () => Promise<void>` - Alias for signOut

**User Type:**
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt: string;
  apps: Record<string, boolean>;
  appPermissions: Record<string, unknown>;
  appsUsed: Record<string, number>;
  appsEligible: string[];
  trialStartDate: string;
  subscriptionStatus: string;
  suiteAccess: boolean;
}
```

### App Activation

#### `useAppActivation(appName | options)`

Check if user has activated the app.

```tsx
const { needsActivation, appName, checking } = useAppActivation('notes');

// With options
const { needsActivation } = useAppActivation({
  appName: 'notes',
  skip: false, // Skip activation check
});
```

**Parameters:**
- `appName: string` - App identifier (notes, journey, todo, etc.)
- `options.skip?: boolean` - Skip activation check (for public pages)

**Returns:**
- `needsActivation: boolean` - True if user needs to activate
- `appName: string` - The app being checked
- `checking: boolean` - Loading state

#### `<AppActivationModal />`

User consent modal for app activation.

```tsx
<AppActivationModal
  appName="notes"
  appDisplayName="Notes"
  onActivated={() => window.location.reload()}
  onDifferentEmail={() => {
    // Custom redirect to login
  }}
/>
```

**Props:**
- `appName: string` - App identifier
- `appDisplayName: string` - Display name for UI
- `onActivated?: () => void` - Callback after successful activation
- `onDifferentEmail?: () => void` - Callback when user wants different account

### Email Detection

#### `checkEmailExists(email)`

Check if email is already registered.

```tsx
import { checkEmailExists } from '@ainexsuite/auth';

const status = await checkEmailExists('user@example.com');

if (status.exists) {
  if (status.hasGoogle) {
    // Show "Sign in with Google"
  }
  if (status.hasPassword) {
    // Show password input
  }
}
```

**Returns:**
```typescript
interface EmailStatus {
  exists: boolean;
  methods: string[];
  hasPassword: boolean;
  hasGoogle: boolean;
}
```

#### `getAccountConflictMessage(emailStatus)`

Get user-friendly message for account conflicts.

```tsx
const message = getAccountConflictMessage(status);
// "This account already exists. Please sign in with Google."
```

#### `determineAuthFlow(email)`

Determine if user should see signup or signin flow.

```tsx
const flow = await determineAuthFlow('user@example.com');
// Returns: 'signup' | 'signin' | 'unknown'
```

### Session Management

#### Session Cookie Operations

```tsx
import {
  setSessionCookie,
  getSessionCookie,
  removeSessionCookie,
  hasSessionCookie,
} from '@ainexsuite/auth';

// Set session cookie
setSessionCookie(sessionCookie);

// Get session cookie
const cookie = getSessionCookie();

// Check if session exists
if (hasSessionCookie()) {
  // User has session
}

// Remove session
removeSessionCookie();
```

#### Session Lifecycle Management

```tsx
import {
  initializeSession,
  validateSession,
  clearSessionData,
  getRemainingSessionTime,
  isSessionExpired,
  isSessionExpiringSoon,
  shouldRefreshSession,
} from '@ainexsuite/auth';

// Initialize session with timeout tracking
initializeSession(sessionCookie);

// Validate session state
const validation = validateSession();
// Returns: { valid, expired, needsRefresh, hasCookie }

if (validation.expired) {
  // Session expired, redirect to login
}

if (validation.needsRefresh) {
  // Refresh session before expiry
}

// Get remaining time
const seconds = getRemainingSessionTime();
// Returns: number | null

// Check expiry status
if (isSessionExpired()) {
  // Session has expired
}

if (isSessionExpiringSoon()) {
  // Less than 5 minutes remaining
  showWarning('Your session will expire soon');
}

// Check if refresh needed (75% elapsed)
if (shouldRefreshSession()) {
  await refreshAuthToken();
}

// Clear all session data
clearSessionData();
```

### Error Handling

#### `parseAuthError(error)`

Parse Firebase Auth error into structured information.

```tsx
import { parseAuthError } from '@ainexsuite/auth';

try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  const errorInfo = parseAuthError(error);
  console.log(errorInfo.userMessage); // User-friendly message
  console.log(errorInfo.suggestion); // Recovery suggestion
}
```

**Returns:**
```typescript
interface AuthErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  category: AuthErrorCategory; // 'credential' | 'network' | 'session' etc.
  recoverable: boolean;
  suggestion?: string;
}
```

#### Error Helper Functions

```tsx
import {
  getAuthErrorMessage,
  getAuthErrorWithSuggestion,
  isRecoverableAuthError,
  isNetworkError,
  isCredentialError,
  isSessionError,
  requiresReauth,
  logAuthError,
  getErrorAction,
} from '@ainexsuite/auth';

// Get user-friendly message
const message = getAuthErrorMessage(error);

// Get message with suggestion
const fullMessage = getAuthErrorWithSuggestion(error);

// Check error type
if (isNetworkError(error)) {
  // Show network error UI
}

if (isSessionError(error) || requiresReauth(error)) {
  // Redirect to login
}

if (isRecoverableAuthError(error)) {
  // Allow retry
}

// Log error with context
logAuthError(error, 'Sign In Flow', { email, timestamp: Date.now() });

// Get recommended action
const action = getErrorAction(error);
// Returns: 'retry' | 'reauth' | 'contact' | 'none'
```

## Architecture

### SSO Flow

```
1. User signs in on Main app (www.ainexspace.com)
   ↓
2. Firebase Authentication creates user
   ↓
3. Server creates session cookie on .ainexspace.com domain
   ↓
4. User navigates to Notes app (notes.ainexspace.com)
   ↓
5. AuthBootstrap detects session cookie
   ↓
6. Silent authentication via custom token
   ↓
7. User automatically logged in
```

### App Activation Flow

```
1. User has valid session
   ↓
2. Visits app for first time
   ↓
3. useAppActivation checks appsEligible array
   ↓
4. If not eligible, show AppActivationModal
   ↓
5. User clicks "Use my account"
   ↓
6. API adds app to appsEligible
   ↓
7. User granted access
```

### Session Lifecycle

```
1. initializeSession() - Set cookie + timeout tracking
   ↓
2. updateLastActivity() - Track user activity
   ↓
3. shouldRefreshSession() - Check if 75% elapsed
   ↓
4. Refresh token if needed
   ↓
5. isSessionExpiringSoon() - Warn user at 5 min
   ↓
6. isSessionExpired() - Force re-auth if expired
   ↓
7. clearSessionData() - Clean up on logout
```

## Common Patterns

### Protected Route Component

```tsx
import { useAuth } from '@ainexsuite/auth';
import { useRouter } from 'next/navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    router.push('/login');
    return null;
  }

  return <>{children}</>;
}
```

### Email-First Login Flow

```tsx
import { checkEmailExists, getAccountConflictMessage } from '@ainexsuite/auth';

async function handleEmailSubmit(email: string) {
  const status = await checkEmailExists(email);

  if (status.exists) {
    // Show signin UI
    if (status.hasGoogle && !status.hasPassword) {
      // Force Google sign-in
      showGoogleButton();
    } else {
      // Show available methods
      showSignInMethods(status);
    }
  } else {
    // Show signup UI
    showSignUpForm();
  }
}
```

### Session Refresh Hook

```tsx
import { useEffect } from 'react';
import { shouldRefreshSession, updateLastActivity } from '@ainexsuite/auth';
import { auth } from '@ainexsuite/firebase';

export function useSessionRefresh() {
  useEffect(() => {
    const interval = setInterval(async () => {
      if (shouldRefreshSession()) {
        const user = auth.currentUser;
        if (user) {
          await user.getIdToken(true); // Force refresh
          updateLastActivity();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
}
```

### Error Handling in Forms

```tsx
import { parseAuthError, getErrorAction } from '@ainexsuite/auth';

async function handleSignIn(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const errorInfo = parseAuthError(error);

    setError(errorInfo.userMessage);

    const action = getErrorAction(error);
    switch (action) {
      case 'retry':
        setShowRetryButton(true);
        break;
      case 'reauth':
        router.push('/login');
        break;
      case 'contact':
        setShowContactSupport(true);
        break;
    }
  }
}
```

## Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Session Configuration
NEXT_PUBLIC_SESSION_COOKIE_DOMAIN=.ainexspace.com
NEXT_PUBLIC_SESSION_COOKIE_MAX_AGE=1209600
```

## API Routes Required

Each app needs these API routes for full SSO functionality:

### `/api/auth/custom-token`

Converts session cookie to Firebase custom token for silent auth.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin-app';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const adminAuth = getAdminAuth();
  const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
  const customToken = await adminAuth.createCustomToken(decodedClaims.uid);

  return NextResponse.json({ customToken });
}
```

### `/api/apps/activate`

Activates app for the user.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin-app';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  const { app } = await request.json();
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminAuth = getAdminAuth();
  const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

  const adminDb = getAdminFirestore();
  await adminDb.collection('users').doc(decodedClaims.uid).update({
    appsEligible: FieldValue.arrayUnion(app),
    [`apps.${app}`]: true,
    [`appsUsed.${app}`]: Date.now(),
  });

  return NextResponse.json({ success: true });
}
```

## Troubleshooting

### Session Cookie Not Working Across Domains

- Verify `SESSION_COOKIE_DOMAIN` is set to `.ainexspace.com`
- Ensure `secure: true` in production (requires HTTPS)
- Check browser allows third-party cookies

### Silent Auth Not Working

- Check `/api/auth/custom-token` endpoint exists
- Verify Firebase Admin SDK is initialized correctly
- Check session cookie is HttpOnly and domain-wide

### App Activation Not Working

- Verify `/api/apps/activate` endpoint exists
- Check user document has `appsEligible` array field
- Ensure app name matches valid app list

### TypeScript Errors

- Ensure `@ainexsuite/auth` is in dependencies
- Check TypeScript version is 5.0+
- Verify `tsconfig.json` includes proper paths

## License

MIT

## Support

For issues and questions, please contact the AINexSuite team.
