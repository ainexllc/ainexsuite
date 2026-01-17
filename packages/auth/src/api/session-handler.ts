/**
 * Shared Session Creation Handler
 * Consolidates session creation logic used across all apps
 *
 * @deprecated Prefer using handlers from '@ainexsuite/auth/server' instead:
 * - LoginPOST for session creation
 * - SessionGET for session verification
 * - CustomTokenPOST for custom token generation
 *
 * This file is kept for backwards compatibility but uses the consolidated
 * getSessionCookieDomain() from @ainexsuite/firebase/config.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db as adminDb } from '@ainexsuite/firebase/admin'; // Use Admin SDK Firestore
import { getSessionCookieDomain } from '@ainexsuite/firebase/config';
import { migrateUserData, calculateTrialEndDate } from '../user-utils';
import type { User } from '@ainexsuite/types';

/**
 * Detect cookie domain based on hostname
 * @deprecated Use getSessionCookieDomain() from @ainexsuite/firebase/config instead
 */
function detectCookieDomain(_hostname: string): string | undefined {
  // Delegate to the consolidated implementation
  return getSessionCookieDomain();
}

/**
 * Create or update user document in Firestore
 */
async function createOrUpdateUser(firebaseUser: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null; name?: string | null; picture?: string | null }): Promise<User> {
  const userRef = adminDb.collection('users').doc(firebaseUser.uid);
  const userDoc = await userRef.get();

  const now = Date.now();

  if (userDoc.exists) {
    // Existing user - update last login and migrate if needed
    const userData = userDoc.data() as User;
    const migrationData = migrateUserData(userData);

    const updates: Partial<User> = {
      lastLoginAt: now,
      displayName: firebaseUser.name || userData.displayName,
      photoURL: firebaseUser.picture || userData.photoURL,
      ...migrationData,
    };

    await userRef.update(updates);

    return {
      ...userData,
      ...updates,
    } as User;
  } else {
    // New user - create document
    const isDev = process.env.NODE_ENV === 'development';

    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.name || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
      photoURL: firebaseUser.picture || '',
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          push: false,
          inApp: true,
        },
      },
      createdAt: now,
      lastLoginAt: now,
      // In dev mode, pre-activate all apps
      appsEligible: isDev
        ? ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'hub', 'fit']
        : [],
      accountType: isDev ? 'space' : 'single-app',
      appPermissions: {},
      apps: {
        notes: isDev,
        journal: isDev,
        todo: isDev,
        health: isDev,
        album: isDev,
        habits: isDev,
        hub: isDev,
        fit: isDev,
      },
      appsUsed: {},
      trialStartDate: now,
      trialEndDate: calculateTrialEndDate(now),
      subscriptionStatus: 'trial',
      spaceAccess: isDev, // Dev users get space access
    };

    await userRef.set(newUser);

    return newUser;
  }
}

/**
 * POST /api/auth/session
 * Create session cookie from Firebase ID token
 */
export async function handleSessionCreation(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    const hostname = req.headers.get('host') || '';
    const cookieDomain = detectCookieDomain(hostname);

    // In development, create mock user
    if (process.env.NODE_ENV === 'development') {

      const mockUser: User = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        displayName: 'Dev User',
        photoURL: '',
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'America/New_York',
          notifications: { email: true, push: false, inApp: true },
        },
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        appsEligible: ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'hub', 'fit'],
        accountType: 'space',
        appPermissions: {},
        apps: {
          notes: true,
          journal: true,
          todo: true,
          health: true,
          album: true,
          habits: true,
          hub: true,
          fit: true,
        },
        appsUsed: {},
        trialStartDate: Date.now(),
        trialEndDate: calculateTrialEndDate(Date.now()),
        subscriptionStatus: 'trial',
        spaceAccess: true,
      };

      const mockSessionCookie = `dev-session-${Date.now()}`;

      const response = NextResponse.json({
        user: mockUser,
        sessionCookie: mockSessionCookie,
      });

      response.cookies.set('__session', mockSessionCookie, {
        ...(cookieDomain ? { domain: cookieDomain } : {}), // Only set domain if defined
        maxAge: 60 * 60 * 24 * 14, // 14 days
        httpOnly: true,
        secure: false, // HTTP in development
        sameSite: 'lax',
        path: '/',
      });

      return response;
    }

    // Production: Use Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in ms

    // Create session cookie
    const sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    // Get or create user in Firestore
    const user = await createOrUpdateUser(decodedToken);

    const response = NextResponse.json({ user, sessionCookie });

    response.cookies.set('__session', sessionCookie, {
      ...(cookieDomain ? { domain: cookieDomain } : {}), // Only set domain if defined
      maxAge: 60 * 60 * 24 * 14, // 14 days
      httpOnly: true,
      secure: true, // HTTPS only in production
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Session creation failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/custom-token
 * Generate custom token from session cookie for client-side auth
 */
export async function handleCustomTokenGeneration(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // In development, return mock custom token
    if (process.env.NODE_ENV === 'development') {

      const mockCustomToken = `dev-custom-token-${Date.now()}`;

      return NextResponse.json({ customToken: mockCustomToken });
    }

    // Production: Verify session cookie and create custom token
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    const customToken = await getAuth().createCustomToken(decodedClaims.uid);

    return NextResponse.json({ customToken });
  } catch (error) {

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Custom token generation failed' },
      { status: 500 }
    );
  }
}
