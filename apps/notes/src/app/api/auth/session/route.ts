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
            notes: false,
            journey: false,
            todo: false,
            track: false,
            moments: false,
            grow: false,
            pulse: false,
            fit: false,
          },
          appPermissions: {},
          appsUsed: {},
          appsEligible: [],
          trialStartDate: Date.now(),
          subscriptionStatus: 'trial' as const,
          suiteAccess: false,
        };

        // Create a simple session token
        const sessionCookie = Buffer.from(JSON.stringify({ uid: user.uid })).toString('base64');

        const res = NextResponse.json({ sessionCookie, user });
        res.cookies.set('__session', sessionCookie, {
          domain: SESSION_COOKIE_DOMAIN,
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

    // Production: Call Firebase Cloud Function
    const response = await fetch(
      `https://us-central1-alnexsuite.cloudfunctions.net/generateSessionCookie`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { idToken } }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate session cookie: ${errorText}`);
    }

    const { result } = await response.json();
    const { sessionCookie, user } = result;

    // Set session cookie on response
    const res = NextResponse.json({ sessionCookie, user });

    res.cookies.set('__session', sessionCookie, {
      domain: SESSION_COOKIE_DOMAIN,
      maxAge: SESSION_COOKIE_MAX_AGE / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
