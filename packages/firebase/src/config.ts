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
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

// Environment-aware cookie domain
export const SESSION_COOKIE_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? '.ainexsuite.com'    // Production: shared across *.ainexsuite.com
    : '.localhost';         // Development: shared across *.localhost
