/**
 * Shared Session Creation Handler
 * Consolidates session creation logic used across all apps
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db as adminDb } from '@ainexsuite/firebase/admin'; // Use Admin SDK Firestore
import { migrateUserData, calculateTrialEndDate } from '../user-utils';
import type { User } from '@ainexsuite/types';

/**
 * Detect cookie domain based on hostname
 */
function detectCookieDomain(hostname: string): string {
  // Check for Vercel production environment or explicit production flag
  if (process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production') {
    // Production logic remains same
    if (hostname.includes('ainexsuite.com')) {
      return '.ainexsuite.com';
    }
  }

  // Development: Return undefined to create a "HostOnly" cookie
  // This allows the cookie to be shared across all ports on localhost (3000, 3001, etc.)
  return undefined as unknown as string;

  // Production: check for subdomain vs standalone domain
  if (hostname.includes('ainexsuite.com')) {
    return '.ainexsuite.com'; // Subdomain SSO
  }

  if (hostname.includes('ainexnotes.com')) {
    return '.ainexnotes.com';
  }

  if (hostname.includes('ainexjournal.com')) {
    return '.ainexjournal.com';
  }

  if (hostname.includes('ainextodo.com')) {
    return '.ainextodo.com';
  }

  if (hostname.includes('ainextrack.com')) {
    return '.ainextrack.com';
  }

  if (hostname.includes('ainexalbum.com')) {
    return '.ainexalbum.com';
  }

  if (hostname.includes('ainexhabits.com')) {
    return '.ainexhabits.com';
  }

  if (hostname.includes('ainexdisplay.com')) {
    return '.ainexdisplay.com';
  }

  if (hostname.includes('ainexfit.com')) {
    return '.ainexfit.com';
  }

  // Default to current hostname for unknown domains
  return hostname;
}

/**
 * Create or update user document in Firestore
 */
async function createOrUpdateUser(firebaseUser: any): Promise<User> {
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
      email: firebaseUser.email,
      displayName: firebaseUser.name || firebaseUser.email.split('@')[0],
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
        ? ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit']
        : [],
      accountType: isDev ? 'suite' : 'single-app',
      appPermissions: {},
      apps: {
        notes: isDev,
        journal: isDev,
        todo: isDev,
        health: isDev,
        album: isDev,
        habits: isDev,
        display: isDev,
        fit: isDev,
      },
      appsUsed: {},
      trialStartDate: now,
      trialEndDate: calculateTrialEndDate(now),
      subscriptionStatus: 'trial',
      suiteAccess: isDev, // Dev users get suite access
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
        appsEligible: ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit'],
        accountType: 'suite',
        appPermissions: {},
        apps: {
          notes: true,
          journal: true,
          todo: true,
          health: true,
          album: true,
          habits: true,
          display: true,
          fit: true,
        },
        appsUsed: {},
        trialStartDate: Date.now(),
        trialEndDate: calculateTrialEndDate(Date.now()),
        subscriptionStatus: 'trial',
        suiteAccess: true,
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
