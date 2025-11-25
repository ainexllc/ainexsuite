'use client';

/**
 * Auth Context Provider for React apps
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, SSOHandler } from '@ainexsuite/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from '@ainexsuite/types';
import {
  removeSessionCookie,
  initializeSession,
  updateLastActivity,
  shouldRefreshSession,
  clearSessionData,
  isSessionExpired,
} from './session';
import { AuthBootstrap } from './auth-bootstrap';

export type BootstrapStatus = 'idle' | 'running' | 'complete' | 'failed';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  bootstrapStatus: BootstrapStatus;
  /** True when SSO auth_token is being processed - pages should wait */
  ssoInProgress: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  setIsBootstrapping: (value: boolean) => void;
  setBootstrapStatus: (status: BootstrapStatus) => void;
  /** Called by SSOHandler to signal SSO completion */
  setSsoComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Check if there's an SSO auth_token in the URL
 * This is checked synchronously on initial render to prevent race conditions
 */
function checkForSSOToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return new URLSearchParams(window.location.search).has('auth_token');
}

// Helper function to create fallback user object
function createFallbackUser(firebaseUser: FirebaseUser): User {
  const now = Date.now();
  const isDev = process.env.NODE_ENV === 'development';
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email || 'User',
    photoURL: firebaseUser.photoURL || '',
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: false,
        inApp: true,
      },
    },
    createdAt: now,
    lastLoginAt: now,
    apps: {
      notes: isDev,
      journey: isDev,
      todo: isDev,
      track: isDev,
      moments: isDev,
      grow: isDev,
      pulse: isDev,
      fit: isDev,
    },
    appPermissions: {},
    appsUsed: {},
    appsEligible: isDev ? ['notes', 'journey', 'todo', 'track', 'moments', 'grow', 'pulse', 'fit'] : [],
    trialStartDate: now,
    subscriptionStatus: 'trial',
    suiteAccess: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');

  // Track SSO status - initialized synchronously to detect auth_token before first render
  const [ssoInProgress, setSsoInProgress] = useState(() => checkForSSOToken());

  // Callback for SSOHandler to signal completion
  const setSsoComplete = useCallback(() => {
    console.log('🔐 AuthProvider: SSO complete signal received');
    setSsoInProgress(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get ID token and create session cookie
          const idToken = await firebaseUser.getIdToken();

          // Skip session creation if we're bootstrapping from an existing session cookie
          // This prevents double authentication when refreshing the page
          if (isBootstrapping) {
            // Session cookie already exists, just hydrate user from Firebase
            // No need to call /api/auth/session again
            setUser(createFallbackUser(firebaseUser));
            setIsBootstrapping(false);
            setLoading(false);
            // SSO is complete when we have a user
            if (ssoInProgress) {
              console.log('🔐 AuthProvider: SSO complete (bootstrap path)');
              setSsoInProgress(false);
            }
            return;
          }

          // Call Cloud Function to generate session cookie (only on fresh login)
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            const { sessionCookie, user: userData } = await response.json();
            initializeSession(sessionCookie);
            setUser(userData);
          } else {
            // Fallback: Create minimal user object from Firebase user
            setUser(createFallbackUser(firebaseUser));
          }
        } catch (error) {
          // Fallback: Create minimal user object from Firebase user
          setUser(createFallbackUser(firebaseUser));
        }

        // SSO is complete when user is set
        if (ssoInProgress) {
          console.log('🔐 AuthProvider: SSO complete (user authenticated)');
          setSsoInProgress(false);
        }
      } else {
        removeSessionCookie();
        setUser(null);
        // If SSO was in progress but no user, it failed - mark complete anyway
        if (ssoInProgress) {
          console.log('🔐 AuthProvider: SSO complete (no user - failed or logged out)');
          setSsoInProgress(false);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [isBootstrapping, ssoInProgress]);

  // Automatic session refresh
  useEffect(() => {
    if (!firebaseUser) return;

    // Check session status every minute
    const refreshInterval = setInterval(async () => {
      try {
        // Check if session has expired
        if (isSessionExpired()) {
          await firebaseSignOut(auth);
          clearSessionData();
          setUser(null);
          setFirebaseUser(null);
          return;
        }

        // Check if session needs refresh (75% of max age elapsed)
        if (shouldRefreshSession()) {

          // Force token refresh
          const newToken = await firebaseUser.getIdToken(true);

          // Create new session cookie
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: newToken }),
          });

          if (response.ok) {
            const { sessionCookie } = await response.json();
            initializeSession(sessionCookie);
          }
        }

        // Update last activity
        updateLastActivity();
      } catch (_error) {
        // Silent fail on refresh - user will be prompted to login when session expires
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [firebaseUser]);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth);
    clearSessionData();
    setUser(null);
    setFirebaseUser(null);
  }, []);

  // Effective loading state: true if auth is loading OR SSO is in progress
  const effectiveLoading = loading || ssoInProgress;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading: effectiveLoading, // Use effective loading to wait for SSO
        bootstrapStatus,
        ssoInProgress,
        signOut: signOutUser,
        logout: signOutUser,
        setIsBootstrapping,
        setBootstrapStatus,
        setSsoComplete,
      }}
    >
      {/* SSOHandler processes auth_token from URL and signals completion */}
      <SSOHandler onComplete={setSsoComplete} />
      <AuthBootstrap />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
