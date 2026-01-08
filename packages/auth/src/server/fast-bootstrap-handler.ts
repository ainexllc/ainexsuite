/**
 * Fast Bootstrap Handler
 *
 * Single endpoint that combines auth validation + session + user data in one request.
 * Eliminates the need for multiple round trips during app startup.
 *
 * Before: 3 separate calls (~500ms each = ~1500ms total)
 *   1. GET /api/auth/sso-status - check if authenticated
 *   2. POST /api/auth/custom-token - get auth token
 *   3. Firestore read for user data
 *
 * After: 1 call (~300ms total)
 *   POST /api/auth/fast-bootstrap - returns everything needed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from './admin';
import { getLatestSession } from './sso-session-store';

/**
 * Helper to determine if origin is allowed for CORS
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // Production domains
  if (origin.includes('ainexspace.com')) return true;

  // Local development
  if (origin.includes('localhost')) return true;
  if (origin.includes('127.0.0.1')) return true;

  // Local network IPs for development testing
  const localNetworkPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
  if (localNetworkPattern.test(origin)) return true;

  return false;
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
 * User data type returned by fast-bootstrap
 */
interface FastBootstrapUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  iconURL?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    fontFamily?: string;
    fontSize?: 'small' | 'medium' | 'large';
  };
  animatedAvatarURL?: string;
  animatedAvatarAction?: string;
  animatedAvatarStyle?: string;
  useAnimatedAvatar?: boolean;
  apps?: Record<string, boolean>;
  subscriptionStatus?: string;
  suiteAccess?: boolean;
}

/**
 * Response type for fast-bootstrap
 */
interface FastBootstrapResponse {
  authenticated: boolean;
  sessionCookie?: string;
  customToken?: string;
  user?: FastBootstrapUser;
  devMode?: boolean;
  source?: string;
}

/**
 * POST /api/auth/fast-bootstrap
 *
 * Single endpoint for fast authentication bootstrap.
 * Returns all data needed to hydrate the auth state in one request.
 *
 * Request body (optional):
 * - sessionCookie: string - for cross-port SSO in dev
 *
 * Response:
 * - authenticated: boolean
 * - sessionCookie?: string - for client-side hydration
 * - customToken?: string - for Firebase signInWithCustomToken
 * - user?: object - full user data (avoids Firestore read)
 * - devMode?: boolean - true if using dev mode hydration
 */
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  const isDev = process.env.NODE_ENV === 'development';

  try {
    // Try to get session cookie from multiple sources
    let sessionCookie = request.cookies.get('__session')?.value;
    let source = sessionCookie ? 'cookie' : null;

    // Check request body for cross-port SSO
    if (!sessionCookie) {
      try {
        const body = await request.json();
        if (body.sessionCookie) {
          sessionCookie = body.sessionCookie;
          source = 'body';
        }
      } catch {
        // No body or invalid JSON
      }
    }

    // In development, check in-memory session store
    if (!sessionCookie && isDev) {
      sessionCookie = getLatestSession() ?? undefined;
      if (sessionCookie) source = 'in-memory';
    }

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false, source: 'none' } as FastBootstrapResponse,
        { headers: corsHeaders }
      );
    }

    // Development mode
    if (isDev) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        const uid = decoded.uid;

        if (!uid) {
          return NextResponse.json(
            { authenticated: false, source } as FastBootstrapResponse,
            { headers: corsHeaders }
          );
        }

        // Try to get fresh user data from Firestore
        let user: FastBootstrapUser = {
          uid: decoded.uid,
          email: decoded.email || '',
          displayName: decoded.displayName || '',
          photoURL: decoded.photoURL || '',
          iconURL: decoded.iconURL,
          preferences: decoded.preferences,
          animatedAvatarURL: decoded.animatedAvatarURL,
          animatedAvatarAction: decoded.animatedAvatarAction,
          animatedAvatarStyle: decoded.animatedAvatarStyle,
          useAnimatedAvatar: decoded.useAnimatedAvatar,
          apps: decoded.apps,
          subscriptionStatus: decoded.subscriptionStatus,
          suiteAccess: decoded.suiteAccess,
        };

        try {
          const adminDb = getAdminFirestore();
          const userDoc = await adminDb.collection('users').doc(uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            // Merge Firestore data (source of truth) with cookie data
            user = {
              uid,
              email: userData?.email || decoded.email || '',
              displayName: userData?.displayName || decoded.displayName || '',
              photoURL: userData?.customPhotoURL || userData?.photoURL || decoded.photoURL || '',
              iconURL: userData?.customIconURL || decoded.iconURL,
              preferences: userData?.preferences || decoded.preferences,
              animatedAvatarURL: userData?.animatedAvatarURL || decoded.animatedAvatarURL,
              animatedAvatarAction: userData?.animatedAvatarAction || decoded.animatedAvatarAction,
              animatedAvatarStyle: userData?.animatedAvatarStyle || decoded.animatedAvatarStyle,
              useAnimatedAvatar: userData?.useAnimatedAvatar ?? decoded.useAnimatedAvatar,
              apps: userData?.apps || decoded.apps,
              subscriptionStatus: userData?.subscriptionStatus || decoded.subscriptionStatus,
              suiteAccess: userData?.suiteAccess ?? decoded.suiteAccess,
            };
          }
        } catch {
          // Firestore not available, use cookie data
        }

        // Try to create custom token (if Admin SDK is properly configured)
        let customToken: string | undefined;
        try {
          const adminAuth = getAdminAuth();
          customToken = await adminAuth.createCustomToken(uid);
        } catch {
          // Admin SDK not configured for custom tokens
        }

        const response: FastBootstrapResponse = {
          authenticated: true,
          sessionCookie,
          customToken,
          user,
          devMode: true, // Always true in dev mode
          source: source ?? undefined,
        };

        return NextResponse.json(response, { headers: corsHeaders });
      } catch {
        return NextResponse.json(
          { authenticated: false, source } as FastBootstrapResponse,
          { headers: corsHeaders }
        );
      }
    }

    // Production mode
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    // Verify session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Create custom token for Firebase client auth
    const customToken = await adminAuth.createCustomToken(decodedClaims.uid);

    const user: FastBootstrapUser = userData ? {
      uid: decodedClaims.uid,
      email: decodedClaims.email || '',
      displayName: userData.displayName || decodedClaims.name || '',
      photoURL: userData.customPhotoURL || userData.photoURL || decodedClaims.picture || '',
      iconURL: userData.customIconURL,
      preferences: userData.preferences,
      animatedAvatarURL: userData.animatedAvatarURL,
      animatedAvatarAction: userData.animatedAvatarAction,
      animatedAvatarStyle: userData.animatedAvatarStyle,
      useAnimatedAvatar: userData.useAnimatedAvatar,
      apps: userData.apps,
      subscriptionStatus: userData.subscriptionStatus,
      suiteAccess: userData.suiteAccess,
    } : {
      uid: decodedClaims.uid,
      email: decodedClaims.email || '',
      displayName: decodedClaims.name || '',
      photoURL: decodedClaims.picture || '',
    };

    return NextResponse.json(
      {
        authenticated: true,
        sessionCookie,
        customToken,
        user,
        source,
      } as FastBootstrapResponse,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[FastBootstrap] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { authenticated: false } as FastBootstrapResponse,
      { headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS /api/auth/fast-bootstrap
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
