/**
 * Session Core - Simplified session cookie utilities for SSO/SLO
 *
 * This is the single source of truth for session management across all 16 apps.
 * Cookie-based authentication scoped to .ainexspace.com for production SSO.
 */

import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth, getAdminFirestore } from './admin';
import {
  getSessionCookieDomain,
  SESSION_COOKIE_MAX_AGE_MS,
  SESSION_COOKIE_MAX_AGE_SECONDS,
} from '@ainexsuite/firebase/config';

// ============================================================================
// Types
// ============================================================================

export interface SessionUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  iconURL?: string;
  preferences?: UserPreferences;
  animatedAvatarURL?: string;
  animatedAvatarAction?: string;
  animatedAvatarStyle?: string;
  useAnimatedAvatar?: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface CookieOptions {
  domain?: string;
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
}

// ============================================================================
// Constants
// ============================================================================

export const SESSION_COOKIE_NAME = '__session';
export const DEV_SESSION_KEY = '__ainex_dev_session';
const DEV_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// ============================================================================
// Cookie Configuration
// ============================================================================

/**
 * Get cookie options for setting/clearing session cookie.
 * Production: scoped to .ainexspace.com for cross-subdomain SSO
 * Development: host-only (no domain) for localhost
 */
export function getSessionCookieOptions(forClear = false): CookieOptions {
  const domain = getSessionCookieDomain();
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    ...(domain ? { domain } : {}),
    maxAge: forClear ? 0 : SESSION_COOKIE_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
}

/**
 * Get Set-Cookie header string to clear the session cookie
 */
export function getClearSessionCookieHeader(): string {
  const domain = getSessionCookieDomain();
  const domainPart = domain ? `Domain=${domain}; ` : '';

  return `${SESSION_COOKIE_NAME}=; ${domainPart}Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

// ============================================================================
// Session Cookie Creation
// ============================================================================

/**
 * Create a session cookie from a Firebase ID token.
 *
 * Production: Uses Firebase Admin SDK createSessionCookie
 * Development: Creates base64-encoded JSON with user data
 *
 * @returns Session cookie string and user data
 */
export async function createSessionCookie(
  idToken: string
): Promise<{ sessionCookie: string; user: SessionUser }> {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return createDevSessionCookie(idToken);
  }

  return createProdSessionCookie(idToken);
}

/**
 * Development: Create base64-encoded session from ID token
 */
async function createDevSessionCookie(
  idToken: string
): Promise<{ sessionCookie: string; user: SessionUser }> {
  // Parse JWT to extract user data
  let userData: Partial<SessionUser> = {};

  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      userData = {
        uid: payload.user_id || payload.sub || payload.uid || 'dev-user',
        email: payload.email || 'dev@example.com',
        displayName: payload.name || payload.display_name || payload.email || 'Dev User',
        photoURL: payload.picture || payload.photo_url || '',
      };
    }
  } catch {
    userData = {
      uid: 'dev-user',
      email: 'dev@example.com',
      displayName: 'Dev User',
    };
  }

  // Try to load existing user data from Firestore
  let firestoreData: Record<string, unknown> = {};
  try {
    const adminDb = getAdminFirestore();
    const userDoc = await adminDb.collection('users').doc(userData.uid!).get();
    if (userDoc.exists) {
      firestoreData = userDoc.data() || {};
    }
  } catch {
    // Firestore not available, continue with JWT data
  }

  // Merge data: Firestore takes precedence
  const user: SessionUser = {
    uid: userData.uid!,
    email: userData.email || (firestoreData.email as string) || 'dev@example.com',
    displayName: (firestoreData.displayName as string) || userData.displayName,
    photoURL: (firestoreData.customPhotoURL as string) || (firestoreData.photoURL as string) || userData.photoURL,
    iconURL: firestoreData.customIconURL as string | undefined,
    preferences: (firestoreData.preferences as UserPreferences) || getDefaultPreferences(),
    animatedAvatarURL: firestoreData.animatedAvatarURL as string | undefined,
    animatedAvatarAction: firestoreData.animatedAvatarAction as string | undefined,
    animatedAvatarStyle: firestoreData.animatedAvatarStyle as string | undefined,
    useAnimatedAvatar: firestoreData.useAnimatedAvatar as boolean | undefined,
  };

  // Create or update user in Firestore if needed
  if (!firestoreData.uid && userData.uid && userData.uid !== 'dev-user') {
    await createUserInFirestore(user);
  }

  const sessionCookie = Buffer.from(JSON.stringify(user)).toString('base64');

  return { sessionCookie, user };
}

/**
 * Production: Create session cookie using Firebase Admin SDK
 */
async function createProdSessionCookie(
  idToken: string
): Promise<{ sessionCookie: string; user: SessionUser }> {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminFirestore();

  // Verify ID token
  const decodedToken = await adminAuth.verifyIdToken(idToken);

  // Create session cookie
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_MAX_AGE_MS,
  });

  // Get or create user document
  const userRef = adminDb.collection('users').doc(decodedToken.uid);
  const userDoc = await userRef.get();

  let userData = userDoc.exists ? userDoc.data() : null;

  if (!userData) {
    userData = await createNewUserDocument(userRef, decodedToken);
  } else {
    // Update last login
    const { FieldValue } = await import('firebase-admin/firestore');
    await userRef.update({ lastLoginAt: FieldValue.serverTimestamp() });
  }

  const user: SessionUser = {
    uid: decodedToken.uid,
    email: decodedToken.email || '',
    displayName: userData?.displayName || decodedToken.name || decodedToken.email || 'User',
    photoURL: userData?.customPhotoURL || userData?.photoURL || decodedToken.picture || '',
    iconURL: userData?.customIconURL,
    preferences: userData?.preferences || getDefaultPreferences(),
    animatedAvatarURL: userData?.animatedAvatarURL,
    animatedAvatarAction: userData?.animatedAvatarAction,
    animatedAvatarStyle: userData?.animatedAvatarStyle,
    useAnimatedAvatar: userData?.useAnimatedAvatar,
  };

  return { sessionCookie, user };
}

// ============================================================================
// Session Cookie Verification
// ============================================================================

/**
 * Verify a session cookie and return the user data.
 *
 * Production: Uses Firebase Admin SDK verifySessionCookie
 * Development: Decodes base64 JSON
 *
 * @returns User data if valid, null if invalid/expired
 */
export async function verifySessionCookie(
  sessionCookie: string
): Promise<SessionUser | null> {
  if (!sessionCookie) {
    return null;
  }

  const isDev = process.env.NODE_ENV === 'development';

  try {
    if (isDev) {
      return verifyDevSessionCookie(sessionCookie);
    }

    return verifyProdSessionCookie(sessionCookie);
  } catch (error) {
    console.error('[session-core] Session verification failed:', error);
    return null;
  }
}

/**
 * Development: Decode base64 session and validate
 */
async function verifyDevSessionCookie(sessionCookie: string): Promise<SessionUser | null> {
  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());

    if (!decoded.uid) {
      return null;
    }

    // Optionally refresh data from Firestore
    let freshData: SessionUser = decoded;
    try {
      const adminDb = getAdminFirestore();
      const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data()!;
        freshData = {
          uid: decoded.uid,
          email: decoded.email || userData.email,
          displayName: userData.displayName || decoded.displayName,
          photoURL: userData.customPhotoURL || userData.photoURL || decoded.photoURL,
          iconURL: userData.customIconURL,
          preferences: userData.preferences || decoded.preferences,
          animatedAvatarURL: userData.animatedAvatarURL,
          animatedAvatarAction: userData.animatedAvatarAction,
          animatedAvatarStyle: userData.animatedAvatarStyle,
          useAnimatedAvatar: userData.useAnimatedAvatar,
        };
      }
    } catch {
      // Firestore not available, use decoded data
    }

    return freshData;
  } catch {
    return null;
  }
}

/**
 * Production: Verify session with Firebase Admin SDK
 */
async function verifyProdSessionCookie(sessionCookie: string): Promise<SessionUser | null> {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminFirestore();

  // Verify session cookie (checkRevoked = true for security)
  const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

  // Fetch latest user data from Firestore
  const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
  const userData = userDoc.exists ? userDoc.data() : null;

  return {
    uid: decodedClaims.uid,
    email: decodedClaims.email || '',
    displayName: userData?.displayName || decodedClaims.name,
    photoURL: userData?.customPhotoURL || userData?.photoURL || decodedClaims.picture,
    iconURL: userData?.customIconURL,
    preferences: userData?.preferences,
    animatedAvatarURL: userData?.animatedAvatarURL,
    animatedAvatarAction: userData?.animatedAvatarAction,
    animatedAvatarStyle: userData?.animatedAvatarStyle,
    useAnimatedAvatar: userData?.useAnimatedAvatar,
  };
}

// ============================================================================
// Dev Mode localStorage Helpers (for cross-port SSO)
// ============================================================================

/**
 * Get dev session data for client-side localStorage sync.
 * Called after login to store session for cross-port SSO in dev mode.
 */
export function getDevSessionData(user: SessionUser): string {
  return JSON.stringify({
    ...user,
    timestamp: Date.now(),
    expiresAt: Date.now() + DEV_SESSION_TTL_MS,
  });
}

/**
 * Check if dev session data is still valid (not expired)
 */
export function isDevSessionValid(sessionData: string): boolean {
  try {
    const data = JSON.parse(sessionData);
    return data.expiresAt > Date.now();
  } catch {
    return false;
  }
}

// ============================================================================
// Helpers
// ============================================================================

function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: false,
      inApp: true,
    },
  };
}

async function createUserInFirestore(user: SessionUser): Promise<void> {
  try {
    const adminDb = getAdminFirestore();
    const { FieldValue } = await import('firebase-admin/firestore');
    const now = Date.now();
    const trialEndDate = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    const allApps = [
      'notes', 'journal', 'todo', 'health', 'album',
      'habits', 'hub', 'fit', 'projects', 'workflow', 'calendar',
    ];

    await adminDb.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      preferences: user.preferences || getDefaultPreferences(),
      createdAt: now,
      lastLoginAt: FieldValue.serverTimestamp(),
      apps: allApps.reduce((acc, app) => ({ ...acc, [app]: true }), {}),
      appsEligible: allApps,
      trialStartDate: now,
      trialEndDate: trialEndDate,
      subscriptionStatus: 'trial',
      suiteAccess: true,
    });
  } catch (error) {
    console.error('[session-core] Failed to create user in Firestore:', error);
  }
}

async function createNewUserDocument(
  userRef: FirebaseFirestore.DocumentReference,
  decodedToken: DecodedIdToken
): Promise<Record<string, unknown>> {
  const { FieldValue } = await import('firebase-admin/firestore');
  const now = Date.now();
  const trialEndDate = now + 30 * 24 * 60 * 60 * 1000; // 30 days

  const allApps = [
    'notes', 'journal', 'todo', 'health', 'album',
    'habits', 'hub', 'fit', 'projects', 'workflow', 'calendar',
  ];

  const userData = {
    uid: decodedToken.uid,
    email: decodedToken.email || '',
    displayName: decodedToken.name || decodedToken.email || 'User',
    photoURL: decodedToken.picture || '',
    preferences: getDefaultPreferences(),
    createdAt: now,
    lastLoginAt: FieldValue.serverTimestamp(),
    apps: allApps.reduce((acc, app) => ({ ...acc, [app]: true }), {}),
    appsEligible: allApps,
    trialStartDate: now,
    trialEndDate: trialEndDate,
    subscriptionStatus: 'trial',
    suiteAccess: true,
  };

  await userRef.set(userData);
  return userData;
}
