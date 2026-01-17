/**
 * Firebase configuration
 * Used across all AINexSpace apps
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAvYZXrWGomqINh20NNiMlWxddm5eetkKc",
  authDomain: "alnexsuite.firebaseapp.com",
  projectId: "alnexsuite",
  storageBucket: "alnexsuite.firebasestorage.app",
  messagingSenderId: "1062785888767",
  appId: "1:1062785888767:web:9e29360b8b12e9723a77ca",
  measurementId: "G-82PE4RD3VM"
};

export const FIREBASE_REGION = 'us-central1';

// Session cookie duration: 14 days
// Firebase Admin SDK createSessionCookie expects MILLISECONDS
// res.cookies.set maxAge expects SECONDS
export const SESSION_COOKIE_MAX_AGE_MS = 60 * 60 * 24 * 14 * 1000; // 14 days in milliseconds
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days in seconds

// @deprecated Use SESSION_COOKIE_MAX_AGE_MS or SESSION_COOKIE_MAX_AGE_SECONDS
export const SESSION_COOKIE_MAX_AGE = SESSION_COOKIE_MAX_AGE_MS; // Keep for backward compat

// Environment-aware cookie domain
// Use a function for runtime evaluation since this package is built separately
// and process.env.NODE_ENV would be evaluated at package build time otherwise
export function getSessionCookieDomain(): string | undefined {
  // Server-side: check environment variables
  if (typeof window === 'undefined') {
    // Vercel sets VERCEL_ENV automatically for all deployments
    // Production and preview deployments on *.ainexspace.com need the shared domain
    if (process.env.VERCEL_ENV === 'production' ||
        process.env.VERCEL_ENV === 'preview' ||
        process.env.NODE_ENV === 'production') {
      return '.ainexspace.com';
    }
    // Development: Return undefined - cookies without a domain are "HostOnly"
    // and will be sent to all ports on the same host (localhost)
    return undefined;
  }

  // Client-side: check hostname directly (more reliable than env vars in browser)
  const hostname = window.location.hostname;

  // Production: all *.ainexspace.com subdomains share cookies
  if (hostname.includes('ainexspace.com')) {
    return '.ainexspace.com';
  }

  // Vercel preview deployments (*.vercel.app) - use host-only cookies
  if (hostname.includes('vercel.app')) {
    return undefined;
  }

  // Development (localhost) - use host-only cookies for cross-port SSO
  return undefined;
}

// @deprecated Use getSessionCookieDomain() instead - this constant may not work correctly
// in monorepos where the package is built separately from the apps
export const SESSION_COOKIE_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? '.ainexspace.com'    // Production: shared across *.ainexspace.com
    : '.localhost';         // Development: shared across *.localhost
