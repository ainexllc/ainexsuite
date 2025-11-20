'use client';

import { auth } from '@ainexsuite/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

/**
 * Email Detection Utilities
 *
 * Prevents duplicate accounts by checking if an email is already registered.
 * Helps guide users to the correct sign-in method.
 */

export type EmailStatus = {
  exists: boolean;
  methods: string[];
  hasPassword: boolean;
  hasGoogle: boolean;
};

/**
 * Check if an email is already registered in Firebase Auth
 *
 * @param email - The email address to check
 * @returns EmailStatus with sign-in methods
 *
 * @example
 * const status = await checkEmailExists('user@example.com');
 * if (status.exists) {
 *   if (status.hasGoogle) {
 *     // Show "Sign in with Google" button
 *   }
 *   if (status.hasPassword) {
 *     // Show password input
 *   }
 * }
 */
export async function checkEmailExists(email: string): Promise<EmailStatus> {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);

    return {
      exists: methods.length > 0,
      methods,
      hasPassword: methods.includes('password'),
      hasGoogle: methods.includes('google.com'),
    };
  } catch (error) {
    return {
      exists: false,
      methods: [],
      hasPassword: false,
      hasGoogle: false,
    };
  }
}

/**
 * Get user-friendly message for account conflict
 *
 * @param emailStatus - Result from checkEmailExists
 * @returns User-friendly message to display
 */
export function getAccountConflictMessage(emailStatus: EmailStatus): string {
  if (!emailStatus.exists) {
    return '';
  }

  if (emailStatus.hasGoogle && emailStatus.hasPassword) {
    return 'This account exists. You can sign in with Google or your password.';
  }

  if (emailStatus.hasGoogle) {
    return 'This account already exists. Please sign in with Google.';
  }

  if (emailStatus.hasPassword) {
    return 'This account already exists. Please sign in with your password.';
  }

  return 'This account already exists. Please sign in.';
}

/**
 * Check if user should see signup or signin flow
 *
 * @param email - Email to check
 * @returns 'signup' | 'signin' | 'unknown'
 */
export async function determineAuthFlow(
  email: string
): Promise<'signup' | 'signin' | 'unknown'> {
  if (!email || !email.includes('@')) {
    return 'unknown';
  }

  const status = await checkEmailExists(email);
  return status.exists ? 'signin' : 'signup';
}
