/**
 * Firebase configuration
 * Used across all AINexSuite apps
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
export function getSessionCookieDomain(): string {
  // Check for Vercel production environment or explicit production flag
  if (process.env.VERCEL_ENV === 'production' ||
      process.env.NODE_ENV === 'production') {
    return '.ainexsuite.com';
  }
  return '.localhost';
}

// @deprecated Use getSessionCookieDomain() instead - this constant may not work correctly
// in monorepos where the package is built separately from the apps
export const SESSION_COOKIE_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? '.ainexsuite.com'    // Production: shared across *.ainexsuite.com
    : '.localhost';         // Development: shared across *.localhost
