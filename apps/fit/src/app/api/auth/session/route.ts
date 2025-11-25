import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookieDomain, SESSION_COOKIE_MAX_AGE_MS, SESSION_COOKIE_MAX_AGE_SECONDS } from '@ainexsuite/firebase/config';

/**
 * GET /api/auth/session
 * Check if user has a valid session cookie (for SSO status checking)
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && (
    origin.includes('ainexsuite.com') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  );

  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { headers: corsHeaders }
      );
    }

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

    const { getAdminAuth, getAdminFirestore } = await import('@/lib/firebase/admin-app');
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
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
    console.error('Session verification failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { user: null, authenticated: false },
      { headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS /api/auth/session - Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && (
    origin.includes('ainexsuite.com') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  );

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
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
    console.log('[session] Cookie domain resolved to:', cookieDomain, '(VERCEL_ENV:', process.env.VERCEL_ENV, ', NODE_ENV:', process.env.NODE_ENV, ')');

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
            track: true,
            moments: true,
            grow: true,
            pulse: true,
            fit: true,
          },
          appPermissions: {},
          appsUsed: {},
          appsEligible: ['notes', 'journey', 'todo', 'track', 'moments', 'grow', 'pulse', 'fit'],
          trialStartDate: Date.now(),
          subscriptionStatus: 'trial' as const,
          suiteAccess: false,
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
    console.log('[session] Production mode - initializing Firebase Admin...');

    let getAdminAuth, getAdminFirestore;
    try {
      const adminModule = await import('@/lib/firebase/admin-app');
      getAdminAuth = adminModule.getAdminAuth;
      getAdminFirestore = adminModule.getAdminFirestore;
      console.log('[session] Firebase Admin module imported successfully');
    } catch (importError) {
      console.error('[session] Failed to import Firebase Admin:', importError);
      return NextResponse.json(
        { error: 'Failed to initialize Firebase Admin', details: importError instanceof Error ? importError.message : 'Import failed' },
        { status: 500 }
      );
    }

    const { FieldValue } = await import('firebase-admin/firestore');

    let adminAuth, adminDb;
    try {
      adminAuth = getAdminAuth();
      adminDb = getAdminFirestore();
      console.log('[session] Firebase Admin Auth and Firestore initialized');
    } catch (initError) {
      console.error('[session] Failed to initialize Firebase Admin services:', initError);
      return NextResponse.json(
        { error: 'Failed to initialize Firebase services', details: initError instanceof Error ? initError.message : 'Init failed' },
        { status: 500 }
      );
    }

    // Verify ID token
    console.log('[session] Verifying ID token...');
    console.log('[session] ID token length:', idToken?.length);
    console.log('[session] ID token prefix:', idToken?.substring(0, 50) + '...');
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('[session] ID token verified for user:', decodedToken.uid);
    } catch (verifyError: unknown) {
      const errorObj = verifyError as { code?: string; message?: string };
      console.error('[session] Failed to verify ID token:', {
        code: errorObj?.code,
        message: errorObj?.message,
        fullError: verifyError
      });
      return NextResponse.json(
        {
          error: 'Invalid ID token',
          code: errorObj?.code || 'UNKNOWN',
          details: errorObj?.message || 'Verification failed',
          hint: 'Check if Firebase Admin credentials match the Firebase project'
        },
        { status: 401 }
      );
    }

    // Create session cookie (Firebase Admin SDK expects milliseconds)
    console.log('[session] Creating session cookie...');
    let sessionCookie;
    try {
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_COOKIE_MAX_AGE_MS,
      });
      console.log('[session] Session cookie created successfully');
    } catch (cookieError) {
      console.error('[session] Failed to create session cookie:', cookieError);
      return NextResponse.json(
        { error: 'Failed to create session cookie', details: cookieError instanceof Error ? cookieError.message : 'Cookie creation failed' },
        { status: 500 }
      );
    }

    // Get or create user document
    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    let user;
    if (!userDoc.exists) {
      // Create new user
      const now = Date.now();
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
        apps: {},
        appPermissions: {},
        appsUsed: {},
        appsEligible: [],
        trialStartDate: now,
        subscriptionStatus: 'trial',
        suiteAccess: false,
      };
      await userRef.set(user);
    } else {
      user = userDoc.data();
      // Update last login
      await userRef.update({ lastLoginAt: FieldValue.serverTimestamp() });
    }

    // Set session cookie on response
    const res = NextResponse.json({ sessionCookie, user });

    console.log('[session] Setting __session cookie with domain:', cookieDomain);
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
    // Log error server-side for debugging
    console.error('[session] Unhandled error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        message,
        // Include error details in production too for debugging
        details: message,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined,
      },
      { status: 500 }
    );
  }
}
