/**
 * Shared Session Route Handlers for Next.js API Routes
 *
 * This module provides reusable GET, POST, and OPTIONS handlers that can be
 * directly used in any Next.js app's /api/auth/session/route.ts file.
 *
 * Usage:
 * ```ts
 * export { GET, POST, OPTIONS } from '@ainexsuite/auth/server/session-handlers';
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from './admin';
import {
  getSessionCookieDomain,
  SESSION_COOKIE_MAX_AGE_MS,
  SESSION_COOKIE_MAX_AGE_SECONDS
} from '@ainexsuite/firebase/config';

/**
 * Helper to determine if origin is allowed for CORS
 */
function isAllowedOrigin(origin: string | null): boolean {
  return Boolean(
    origin && (
      origin.includes('ainexsuite.com') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    )
  );
}

/**
 * Helper to get CORS headers
 */
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : '',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * GET /api/auth/session
 * Check if user has a valid session cookie (for SSO status checking)
 */
export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { headers: corsHeaders }
      );
    }

    // For local development, decode the simple base64 session
    if (process.env.NODE_ENV === 'development') {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        return NextResponse.json(
          { user: { uid: decoded.uid }, authenticated: true },
          { headers: corsHeaders }
        );
      } catch {
        return NextResponse.json(
          { user: null, authenticated: false },
          { headers: corsHeaders }
        );
      }
    }

    // Production: Verify session cookie with Firebase Admin
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    return NextResponse.json(
      {
        user: userData ? {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          displayName: userData.displayName || decodedClaims.name,
          photoURL: userData.photoURL || decodedClaims.picture,
        } : {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
        },
        authenticated: true,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    // Session cookie is invalid or expired
    console.error('Session verification failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { user: null, authenticated: false },
      { headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS /api/auth/session
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowed && origin ? origin : '',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * DELETE /api/auth/session
 * Clear session cookie (global sign-out across all apps)
 */
export async function DELETE(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  const cookieDomain = getSessionCookieDomain();

  try {
    // Create response that clears the session cookie
    const res = NextResponse.json(
      { success: true, message: 'Signed out successfully' },
      { headers: corsHeaders }
    );

    // Clear the cookie by setting it with maxAge: 0
    res.cookies.set('__session', '', {
      domain: cookieDomain,
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Sign out error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/auth/session
 * Generate session cookie after Firebase Auth login
 */
type SessionRequestBody = {
  idToken?: string;
};

type DevUserData = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
};

export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as SessionRequestBody;

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Use shared cookie domain for true SSO across all *.ainexsuite.com apps
    const cookieDomain = getSessionCookieDomain(); // .ainexsuite.com in production

    // For local development, skip Cloud Function and create session from token
    if (process.env.NODE_ENV === 'development') {
      try {
        let userData: Partial<DevUserData> = {};

        // Try to parse JWT token
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
          userData = {};
        }

        // Create minimal user object for local dev
        // In dev mode, all apps are pre-activated to avoid repeated activation modals
        const user = {
          uid: userData.uid || 'dev-user',
          email: userData.email || 'dev@example.com',
          displayName: userData.displayName || 'Dev User',
          photoURL: userData.photoURL || '',
          preferences: {
            theme: 'dark' as const,
            language: 'en',
            timezone: 'America/New_York',
            notifications: {
              email: true,
              push: false,
              inApp: true,
            },
          },
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          apps: {
            notes: true,
            journey: true,
            todo: true,
            health: true,
            moments: true,
            grow: true,
            pulse: true,
            fit: true,
            projects: true,
            workflow: true,
            calendar: true,
          },
          appPermissions: {},
          appsUsed: {},
          appsEligible: ['notes', 'journey', 'todo', 'health', 'moments', 'grow', 'pulse', 'fit', 'projects', 'workflow', 'calendar'],
          trialStartDate: Date.now(),
          subscriptionStatus: 'trial' as const,
          suiteAccess: true,
        };

        // Create a simple session token
        const sessionCookie = Buffer.from(JSON.stringify({ uid: user.uid })).toString('base64');

        const res = NextResponse.json({ sessionCookie, user });
        res.cookies.set('__session', sessionCookie, {
          domain: cookieDomain,
          maxAge: SESSION_COOKIE_MAX_AGE_SECONDS, // 14 days in seconds
          httpOnly: true,
          secure: false, // Allow insecure cookies in dev
          sameSite: 'lax',
          path: '/',
        });

        return res;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Local token parsing error';
        return NextResponse.json(
          { error: 'Failed to create session', details: message },
          { status: 500 }
        );
      }
    }

    // Production: Create session cookie server-side
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    // Import FieldValue dynamically to avoid issues in environments without admin SDK
    const { FieldValue } = await import('firebase-admin/firestore');

    // Verify ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie (Firebase Admin SDK expects milliseconds)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE_MS,
    });

    // Get or create user document
    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    let user;
    if (!userDoc.exists) {
      // Create new user with 30-day trial access to ALL apps
      const now = Date.now();
      const trialEndDate = now + (30 * 24 * 60 * 60 * 1000); // 30 days from now

      const allApps = ['notes', 'journey', 'todo', 'health', 'moments', 'grow', 'pulse', 'fit', 'projects', 'workflow', 'calendar'];

      user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || decodedToken.email || 'User',
        photoURL: decodedToken.picture || '',
        createdAt: now,
        lastLoginAt: now,
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'America/New_York',
          notifications: { email: true, push: true, inApp: true },
        },
        // Auto-activate all apps for trial period
        apps: allApps.reduce((acc, app) => ({ ...acc, [app]: true }), {}),
        appPermissions: {},
        appsUsed: {},
        appsEligible: allApps,
        trialStartDate: now,
        trialEndDate: trialEndDate,
        subscriptionStatus: 'trial',
        suiteAccess: true, // Grant suite access during trial
      };

      console.log('✅ New user created with 30-day trial access to all apps:', user.email);
      await userRef.set(user);
    } else {
      user = userDoc.data();

      // Check if user needs trial access upgrade (for existing users)
      if (user && (!user.apps || Object.keys(user.apps).length === 0)) {
        const allApps = ['notes', 'journey', 'todo', 'health', 'moments', 'grow', 'pulse', 'fit', 'projects', 'workflow', 'calendar'];
        const trialEndDate = (user.trialStartDate || Date.now()) + (30 * 24 * 60 * 60 * 1000);

        await userRef.update({
          apps: allApps.reduce((acc, app) => ({ ...acc, [app]: true }), {}),
          appsEligible: allApps,
          trialEndDate: trialEndDate,
          suiteAccess: true,
          lastLoginAt: FieldValue.serverTimestamp(),
        });

        console.log('✅ Existing user upgraded with 30-day trial access:', user.email);

        // Reload user data
        const updatedDoc = await userRef.get();
        user = updatedDoc.data();
      } else {
        // Just update last login
        await userRef.update({ lastLoginAt: FieldValue.serverTimestamp() });
      }
    }

    // Set session cookie on response
    const res = NextResponse.json({ sessionCookie, user });

    res.cookies.set('__session', sessionCookie, {
      domain: cookieDomain,
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS, // 14 days in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: 'Failed to create session',
        message,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined,
      },
      { status: 500 }
    );
  }
}
