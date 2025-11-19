import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_DOMAIN, SESSION_COOKIE_MAX_AGE } from '@ainexsuite/firebase/config';

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

    // Detect cookie domain from request hostname
    const hostname = request.headers.get('host') || '';
    let cookieDomain = SESSION_COOKIE_DOMAIN; // Default: .ainexsuite.com

    // If accessing via standalone domain (e.g., ainexnotes.com, www.ainexnotes.com)
    if (hostname.includes('ainexnotes.com')) {
      cookieDomain = '.ainexnotes.com';
    } else if (hostname.includes('ainexjourney.com')) {
      cookieDomain = '.ainexjourney.com';
    } else if (hostname.includes('ainextodo.com')) {
      cookieDomain = '.ainextodo.com';
    } else if (hostname.includes('ainextrack.com')) {
      cookieDomain = '.ainextrack.com';
    } else if (hostname.includes('ainexmoments.com')) {
      cookieDomain = '.ainexmoments.com';
    } else if (hostname.includes('ainexgrow.com')) {
      cookieDomain = '.ainexgrow.com';
    } else if (hostname.includes('ainexpulse.com')) {
      cookieDomain = '.ainexpulse.com';
    } else if (hostname.includes('ainexfit.com')) {
      cookieDomain = '.ainexfit.com';
    }

    // console.log(`[Session] Request hostname: ${hostname}, Cookie domain: ${cookieDomain}`);

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
          maxAge: SESSION_COOKIE_MAX_AGE / 1000,
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
    const { getAdminAuth, getAdminFirestore } = await import('@/lib/firebase/admin-app');
    const { FieldValue } = await import('firebase-admin/firestore');

    // console.log('[Session] Initializing Firebase Admin...');
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();
    // console.log('[Session] Firebase Admin initialized successfully');

    // Verify ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE,
    });

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

    res.cookies.set('__session', sessionCookie, {
      domain: cookieDomain,
      maxAge: SESSION_COOKIE_MAX_AGE / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('[Session] Error creating session:', error);
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
