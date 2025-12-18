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
    // Also try to fetch latest preferences from Firestore
    if (process.env.NODE_ENV === 'development') {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());

        // Try to get latest preferences from Firestore
        let preferences = decoded.preferences;
        try {
          const adminDb = getAdminFirestore();
          const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData?.preferences) {
              preferences = userData.preferences;
            }
          }
        } catch {
          // Could not load from Firestore, using cookie preferences
        }

        // Return full user data with Firestore preferences (or cookie fallback)
        return NextResponse.json(
          {
            user: {
              uid: decoded.uid,
              email: decoded.email,
              displayName: decoded.displayName,
              photoURL: decoded.photoURL,
              preferences: preferences,
            },
            authenticated: true
          },
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
          preferences: userData.preferences,
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
 * PUT /api/auth/session
 * Update user profile/preferences
 */
export async function PUT(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const updates = await request.json();

    // Validate updates (allow only specific fields)
    const allowedUpdates = ['preferences', 'displayName', 'photoURL'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as Record<string, any>);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400, headers: corsHeaders });
    }

    // Development: Update session cookie AND Firestore
    if (process.env.NODE_ENV === 'development') {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        const updatedUser = { ...decoded, ...filteredUpdates };

        // Also persist to Firestore in dev mode (if Admin SDK available)
        try {
          const adminDb = getAdminFirestore();
          const { FieldValue } = await import('firebase-admin/firestore');
          const userRef = adminDb.collection('users').doc(decoded.uid);
          await userRef.update({
            ...filteredUpdates,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } catch {
          // Firestore update failed - continue with cookie update only
        }

        // Create new cookie with updated data
        const newSessionCookie = Buffer.from(JSON.stringify(updatedUser)).toString('base64');
        const cookieDomain = getSessionCookieDomain();

        const res = NextResponse.json(
          { success: true, user: updatedUser },
          { headers: corsHeaders }
        );

        res.cookies.set('__session', newSessionCookie, {
          ...(cookieDomain ? { domain: cookieDomain } : {}),
          maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
        });

        return res;
      } catch (e) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });
      }
    }

    // Production: Update Firestore
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();
    const { FieldValue } = await import('firebase-admin/firestore');

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userRef = adminDb.collection('users').doc(decodedClaims.uid);

    await userRef.update({
      ...filteredUpdates,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });

  } catch (error) {
    console.error('Update failed:', error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500, headers: corsHeaders }
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      ...(cookieDomain ? { domain: cookieDomain } : {}), // Only set domain if defined
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

        // Default preferences (used if no existing user in Firestore)
        let existingPreferences = {
          theme: 'dark' as const,
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            push: false,
            inApp: true,
          },
        };

        // Try to load existing user preferences from Firestore
        try {
          const adminDb = getAdminFirestore();
          const userDoc = await adminDb.collection('users').doc(userData.uid || 'dev-user').get();
          if (userDoc.exists) {
            const existingUser = userDoc.data();
            if (existingUser?.preferences) {
              existingPreferences = existingUser.preferences;
            }
          }
        } catch {
          // Could not load preferences from Firestore (Admin SDK not available)
        }

        // Create minimal user object for local dev
        // In dev mode, all apps are pre-activated to avoid repeated activation modals
        const user = {
          uid: userData.uid || 'dev-user',
          email: userData.email || 'dev@example.com',
          displayName: userData.displayName || 'Dev User',
          photoURL: userData.photoURL || '',
          preferences: existingPreferences,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          apps: {
            notes: true,
            journal: true,
            todo: true,
            health: true,
            album: true,
            habits: true,
            display: true,
            fit: true,
            projects: true,
            workflow: true,
            calendar: true,
          },
          appPermissions: {},
          appsUsed: {},
          appsEligible: ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit', 'projects', 'workflow', 'calendar'],
          trialStartDate: Date.now(),
          subscriptionStatus: 'trial' as const,
          suiteAccess: true,
        };

        // Create a richer session token including preferences for persistence in dev
        // Allow user object to be stored in cookie for stateless dev experience
        const cookiePayload = {
          ...user, // Store full user object
        };
        const sessionCookie = Buffer.from(JSON.stringify(cookiePayload)).toString('base64');

        const res = NextResponse.json({ sessionCookie, user });
        res.cookies.set('__session', sessionCookie, {
          ...(cookieDomain ? { domain: cookieDomain } : {}), // Only set domain if defined
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
    let adminAuth, adminDb, FieldValue;
    try {
      adminAuth = getAdminAuth();
      adminDb = getAdminFirestore();
      // Import FieldValue dynamically to avoid issues in environments without admin SDK
      ({ FieldValue } = await import('firebase-admin/firestore'));
    } catch (e) {
      console.error('Firebase Admin SDK initialization failed:', e);
      return NextResponse.json(
        {
          error: 'Firebase Admin SDK initialization failed',
          details: e instanceof Error ? e.message : String(e),
          hint: 'Check FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY environment variables'
        },
        { status: 500 }
      );
    }

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

      const allApps = ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit', 'projects', 'workflow', 'calendar'];

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

      await userRef.set(user);
    } else {
      user = userDoc.data();

      // Check if user needs trial access upgrade (for existing users)
      if (user && (!user.apps || Object.keys(user.apps).length === 0)) {
        const allApps = ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit', 'projects', 'workflow', 'calendar'];
        const trialEndDate = (user.trialStartDate || Date.now()) + (30 * 24 * 60 * 60 * 1000);

        await userRef.update({
          apps: allApps.reduce((acc, app) => ({ ...acc, [app]: true }), {}),
          appsEligible: allApps,
          trialEndDate: trialEndDate,
          suiteAccess: true,
          lastLoginAt: FieldValue.serverTimestamp(),
        });

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
      ...(cookieDomain ? { domain: cookieDomain } : {}), // Only set domain if defined
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

/**
 * POST /api/auth/custom-token
 *
 * Generates a Firebase custom token from a verified session cookie.
 * Used for SSO bootstrap - converts server-side session to client-side auth.
 *
 * In development: accepts base64-encoded JSON session from request body
 * In production: verifies Firebase session cookie and creates custom token
 */
export async function CustomTokenPOST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';

  try {
    // Try to get session cookie from httpOnly cookie first
    let sessionCookie = request.cookies.get('__session')?.value;

    // Also check request body (for cross-port SSO in dev)
    if (!sessionCookie) {
      try {
        const body = await request.json();
        sessionCookie = body.sessionCookie;
      } catch {
        // No body or invalid JSON - that's fine
      }
    }

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // In development, session cookies are base64-encoded JSON
    // Try to use Admin SDK for real custom tokens (if credentials are configured)
    // Fall back to devMode hydration if Admin SDK is not available
    if (isDev) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        const uid = decoded.uid;

        if (!uid) {
          return NextResponse.json(
            { error: 'Invalid session cookie: no uid' },
            { status: 401 }
          );
        }

        // Try to create real custom token with Admin SDK
        try {
          const adminAuth = getAdminAuth();
          const customToken = await adminAuth.createCustomToken(uid);
          return NextResponse.json({ customToken });
        } catch {
          // Admin SDK not configured or failed - fall back to devMode hydration

          // Try to get latest preferences from Firestore and update the session cookie
          let updatedSessionCookie = sessionCookie;
          try {
            const adminDb = getAdminFirestore();
            const userDoc = await adminDb.collection('users').doc(uid).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              if (userData?.preferences) {
                // Update the decoded session with Firestore preferences
                decoded.preferences = userData.preferences;
                updatedSessionCookie = Buffer.from(JSON.stringify(decoded)).toString('base64');
              }
            }
          } catch {
            // Could not fetch Firestore preferences, using cookie preferences
          }

          return NextResponse.json({
            customToken: null,
            sessionCookie: updatedSessionCookie,
            devMode: true,
          });
        }
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid session cookie format' },
          { status: 401 }
        );
      }
    }

    // Production: Verify session cookie with Firebase Admin
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Create custom token for this user
    const customToken = await adminAuth.createCustomToken(decodedClaims.uid);

    return NextResponse.json({ customToken });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[CustomToken] Error:', errorMessage);

    // Provide more specific error messages
    let userMessage = 'Failed to generate authentication token';
    if (errorMessage.includes('expired')) {
      userMessage = 'Session expired';
    } else if (errorMessage.includes('revoked')) {
      userMessage = 'Session revoked';
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 401 }
    );
  }
}
