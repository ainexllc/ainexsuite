'use client';

import { FirebaseError } from 'firebase/app';

/**
 * Authentication Error Utilities
 *
 * Provides user-friendly error messages and recovery suggestions
 * for Firebase Authentication errors.
 */

export type AuthErrorCategory =
  | 'credential'
  | 'network'
  | 'permission'
  | 'session'
  | 'validation'
  | 'quota'
  | 'unknown';

export interface AuthErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  category: AuthErrorCategory;
  recoverable: boolean;
  suggestion?: string;
}

/**
 * Firebase Auth error code to user-friendly message mapping
 */
const AUTH_ERROR_MESSAGES: Record<string, Partial<AuthErrorInfo>> = {
  // Credential errors
  'auth/invalid-credential': {
    userMessage: 'The email or password you entered is incorrect.',
    category: 'credential',
    recoverable: true,
    suggestion: 'Please check your credentials and try again.',
  },
  'auth/wrong-password': {
    userMessage: 'Incorrect password. Please try again.',
    category: 'credential',
    recoverable: true,
    suggestion: 'If you forgot your password, use the "Forgot Password" link.',
  },
  'auth/user-not-found': {
    userMessage: 'No account found with this email address.',
    category: 'credential',
    recoverable: true,
    suggestion: 'Please check the email or sign up for a new account.',
  },
  'auth/invalid-email': {
    userMessage: 'The email address is not valid.',
    category: 'validation',
    recoverable: true,
    suggestion: 'Please enter a valid email address.',
  },
  'auth/email-already-in-use': {
    userMessage: 'An account with this email already exists.',
    category: 'credential',
    recoverable: true,
    suggestion: 'Try signing in instead, or use a different email address.',
  },
  'auth/weak-password': {
    userMessage: 'Your password is too weak.',
    category: 'validation',
    recoverable: true,
    suggestion: 'Use at least 6 characters with a mix of letters and numbers.',
  },

  // Session errors
  'auth/session-expired': {
    userMessage: 'Your session has expired.',
    category: 'session',
    recoverable: true,
    suggestion: 'Please sign in again to continue.',
  },
  'auth/user-token-expired': {
    userMessage: 'Your session has expired.',
    category: 'session',
    recoverable: true,
    suggestion: 'Please sign in again to continue.',
  },
  'auth/invalid-user-token': {
    userMessage: 'Your session is no longer valid.',
    category: 'session',
    recoverable: true,
    suggestion: 'Please sign in again.',
  },

  // Network errors
  'auth/network-request-failed': {
    userMessage: 'Network connection failed.',
    category: 'network',
    recoverable: true,
    suggestion: 'Please check your internet connection and try again.',
  },
  'auth/timeout': {
    userMessage: 'The request timed out.',
    category: 'network',
    recoverable: true,
    suggestion: 'Please try again in a moment.',
  },

  // Permission errors
  'auth/operation-not-allowed': {
    userMessage: 'This sign-in method is not enabled.',
    category: 'permission',
    recoverable: false,
    suggestion: 'Please contact support for assistance.',
  },
  'auth/unauthorized-domain': {
    userMessage: 'This domain is not authorized for authentication.',
    category: 'permission',
    recoverable: false,
    suggestion: 'Please contact support.',
  },

  // Quota errors
  'auth/too-many-requests': {
    userMessage: 'Too many failed attempts.',
    category: 'quota',
    recoverable: true,
    suggestion: 'Please wait a few minutes before trying again.',
  },
  'auth/quota-exceeded': {
    userMessage: 'Service temporarily unavailable.',
    category: 'quota',
    recoverable: true,
    suggestion: 'Please try again later.',
  },

  // Account errors
  'auth/user-disabled': {
    userMessage: 'This account has been disabled.',
    category: 'permission',
    recoverable: false,
    suggestion: 'Please contact support for assistance.',
  },
  'auth/account-exists-with-different-credential': {
    userMessage: 'An account already exists with this email using a different sign-in method.',
    category: 'credential',
    recoverable: true,
    suggestion: 'Try signing in with your original method (Google or password).',
  },

  // Popup/Redirect errors
  'auth/popup-blocked': {
    userMessage: 'The sign-in popup was blocked by your browser.',
    category: 'permission',
    recoverable: true,
    suggestion: 'Please allow popups for this site and try again.',
  },
  'auth/popup-closed-by-user': {
    userMessage: 'The sign-in window was closed.',
    category: 'validation',
    recoverable: true,
    suggestion: 'Please complete the sign-in process to continue.',
  },
  'auth/cancelled-popup-request': {
    userMessage: 'Sign-in was cancelled.',
    category: 'validation',
    recoverable: true,
    suggestion: 'Please try signing in again.',
  },

  // MFA errors
  'auth/multi-factor-auth-required': {
    userMessage: 'Additional verification is required.',
    category: 'credential',
    recoverable: true,
    suggestion: 'Please complete the multi-factor authentication.',
  },

  // Missing password errors
  'auth/missing-password': {
    userMessage: 'Please enter your password.',
    category: 'validation',
    recoverable: true,
    suggestion: 'Password is required to sign in.',
  },
};

/**
 * Parse Firebase Auth error into structured error info
 */
export function parseAuthError(error: unknown): AuthErrorInfo {
  // Default error info
  const defaultError: AuthErrorInfo = {
    code: 'unknown',
    message: 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    category: 'unknown',
    recoverable: true,
    suggestion: 'If the problem persists, please contact support.',
  };

  if (!error) {
    return defaultError;
  }

  // Handle FirebaseError
  if (error instanceof FirebaseError) {
    const errorInfo = AUTH_ERROR_MESSAGES[error.code];

    if (errorInfo) {
      return {
        code: error.code,
        message: error.message,
        userMessage: errorInfo.userMessage || defaultError.userMessage,
        category: errorInfo.category || 'unknown',
        recoverable: errorInfo.recoverable ?? true,
        suggestion: errorInfo.suggestion,
      };
    }

    return {
      ...defaultError,
      code: error.code,
      message: error.message,
    };
  }

  // Handle generic Error
  if (error instanceof Error) {
    return {
      ...defaultError,
      message: error.message,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      ...defaultError,
      message: error,
    };
  }

  return defaultError;
}

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(error: unknown): string {
  const errorInfo = parseAuthError(error);
  return errorInfo.userMessage;
}

/**
 * Get error with suggestion
 */
export function getAuthErrorWithSuggestion(error: unknown): string {
  const errorInfo = parseAuthError(error);
  if (errorInfo.suggestion) {
    return `${errorInfo.userMessage} ${errorInfo.suggestion}`;
  }
  return errorInfo.userMessage;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableAuthError(error: unknown): boolean {
  const errorInfo = parseAuthError(error);
  return errorInfo.recoverable;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const errorInfo = parseAuthError(error);
  return errorInfo.category === 'network';
}

/**
 * Check if error is a credential error
 */
export function isCredentialError(error: unknown): boolean {
  const errorInfo = parseAuthError(error);
  return errorInfo.category === 'credential';
}

/**
 * Check if error is a session error
 */
export function isSessionError(error: unknown): boolean {
  const errorInfo = parseAuthError(error);
  return errorInfo.category === 'session';
}

/**
 * Check if error requires user to sign in again
 */
export function requiresReauth(error: unknown): boolean {
  const errorInfo = parseAuthError(error);
  return (
    errorInfo.category === 'session' ||
    errorInfo.code === 'auth/user-token-expired' ||
    errorInfo.code === 'auth/invalid-user-token'
  );
}

/**
 * Log auth error with context
 */
export function logAuthError(
  error: unknown,
  context: string,
  additionalInfo?: Record<string, unknown>
): void {
  const errorInfo = parseAuthError(error);

  console.error('[Auth Error]', {
    context,
    code: errorInfo.code,
    category: errorInfo.category,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    recoverable: errorInfo.recoverable,
    ...additionalInfo,
  });
}

/**
 * Get error action suggestion based on error type
 */
export function getErrorAction(error: unknown): 'retry' | 'reauth' | 'contact' | 'none' {
  const errorInfo = parseAuthError(error);

  if (!errorInfo.recoverable) {
    return 'contact';
  }

  if (errorInfo.category === 'session') {
    return 'reauth';
  }

  if (
    errorInfo.category === 'network' ||
    errorInfo.category === 'quota' ||
    errorInfo.category === 'validation'
  ) {
    return 'retry';
  }

  return 'none';
}
