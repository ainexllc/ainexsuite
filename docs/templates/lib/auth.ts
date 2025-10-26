/**
 * Firebase Authentication Utilities Template
 *
 * Helper functions for authentication operations.
 *
 * File: lib/auth.ts
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: getAuthErrorMessage(err.code) };
  }
}

/**
 * Create new account with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: getAuthErrorMessage(err.code) };
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    // Use popup on localhost, redirect on production
    const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

    if (isLocalhost) {
      const userCredential = await signInWithPopup(auth, googleProvider);
      return { user: userCredential.user, error: null };
    } else {
      await signInWithRedirect(auth, googleProvider);
      return { user: null, error: null }; // Redirect will happen
    }
  } catch (err: any) {
    return { user: null, error: getAuthErrorMessage(err.code) };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (err: any) {
    return { error: "Failed to sign out. Please try again." };
  }
}

/**
 * Map Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-blocked": "Popup blocked. Please enable popups and try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again.";
}
