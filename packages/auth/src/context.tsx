'use client';

/**
 * Auth Context Provider for React apps
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, SSOHandler, setProfileImage, removeCustomProfileImage, syncUserPhotoToSpaces } from '@ainexsuite/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User, UserPreferences } from '@ainexsuite/types';
import { setThemeCookie, getThemeCookie, type ThemeValue } from '@ainexsuite/theme';
import {
  removeSessionCookie,
  initializeSession,
  updateLastActivity,
  shouldRefreshSession,
  clearSessionData,
  isSessionExpired,
} from './session';
import { AuthBootstrap } from './auth-bootstrap';
import { SSOBridge } from './components/sso-bridge';
import { syncSessionWithAuthHub } from './utils/sso-protocol';

export type BootstrapStatus = 'pending' | 'running' | 'complete' | 'failed';

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
  /** Hydrate user directly from dev session (dev only) */
  hydrateFromDevSession: (sessionCookie: string) => void;
  /** Update user preferences (theme, etc) with backend sync */
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  /** Update user profile (displayName, etc) with backend sync */
  updateProfile: (updates: { displayName?: string }) => Promise<void>;
  /** Update user profile image with AI-generated or uploaded image */
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; error?: string }>;
  /** Remove custom profile image and revert to default */
  removeProfileImage: () => Promise<boolean>;
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

/**
 * Check for dev session in localStorage synchronously (for initial render)
 */
function getInitialDevSession(): { user: User; session: string } | null {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return null;
  }

  try {
    const session = localStorage.getItem('__cross_app_session');
    const timestamp = localStorage.getItem('__cross_app_timestamp');

    if (!session || !timestamp) {
      return null;
    }

    // Check if session is less than 30 minutes old
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 30 * 60 * 1000) {
      return null;
    }

    // Parse session to create user
    const decoded = JSON.parse(Buffer.from(session, 'base64').toString());
    const uid = decoded.uid;
    if (!uid) return null;

    const cookieTheme = typeof document !== 'undefined' ? getThemeCookie() : null;
    const now = Date.now();
    const basePreferences = decoded.preferences || {
      theme: 'dark',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: { email: true, push: false, inApp: true },
    };

    const user: User = {
      uid,
      email: decoded.email || '',
      displayName: decoded.displayName || decoded.email || 'Dev User',
      photoURL: decoded.photoURL || '',
      preferences: {
        ...basePreferences,
        theme: cookieTheme || basePreferences.theme || 'dark',
      },
      createdAt: now,
      lastLoginAt: now,
      apps: {
        notes: true, journal: true, todo: true, health: true,
        album: true, habits: true, display: true, fit: true,
        project: true, workflow: true, calendar: true,
      },
      appPermissions: {},
      appsUsed: {},
      appsEligible: ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit', 'projects', 'workflow', 'calendar'],
      trialStartDate: now,
      subscriptionStatus: 'trial',
      suiteAccess: true,
    };

    return { user, session };
  } catch {
    return null;
  }
}

// Helper function to create fallback user object
function createFallbackUser(firebaseUser: FirebaseUser): User {
  const now = Date.now();
  const isDev = process.env.NODE_ENV === 'development';
  // Use cookie theme as source of truth (shared across all apps)
  const cookieTheme = typeof document !== 'undefined' ? getThemeCookie() : null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email || 'User',
    photoURL: firebaseUser.photoURL || '',
    preferences: {
      theme: cookieTheme || 'dark',
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
      journal: isDev,
      todo: isDev,
      health: isDev,
      album: isDev,
      habits: isDev,
      display: isDev,
      fit: isDev,
    },
    appPermissions: {},
    appsUsed: {},
    appsEligible: isDev ? ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit'] : [],
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
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('pending');

  // Track SSO status - initialized synchronously to detect auth_token before first render
  const [ssoInProgress, setSsoInProgress] = useState(() => {
    const hasToken = checkForSSOToken();
    return hasToken;
  });

  // Track if we used dev hydration (no Firebase auth, just UI-level user)
  const [devHydrated, setDevHydrated] = useState(false);

  // Use useLayoutEffect to hydrate from dev session BEFORE paint
  // This runs synchronously after DOM mutations but before browser paint
  // Prevents visible loading flash while maintaining SSR compatibility
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    const devSession = getInitialDevSession();
    if (devSession) {
      setUser(devSession.user);
      setLoading(false);
      setBootstrapStatus('complete');
      setDevHydrated(true);
      // Refresh timestamp
      localStorage.setItem('__cross_app_timestamp', Date.now().toString());
    }
  }, []);

  // Callback for SSOHandler to signal completion
  const setSsoComplete = useCallback(() => {
    setSsoInProgress(false);
  }, []);

  // Cross-tab/cross-app preference sync via BroadcastChannel
  // When theme or profile image changes in one tab, all other tabs update immediately
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('ainex-preferences');
    channel.onmessage = (event) => {
      if (event.data.type === 'PREFERENCES_UPDATE') {
        setUser(prev => prev ? {
          ...prev,
          preferences: { ...prev.preferences, ...event.data.preferences }
        } : null);
      } else if (event.data.type === 'PROFILE_IMAGE_UPDATE') {
        setUser(prev => prev ? {
          ...prev,
          photoURL: event.data.photoURL,
        } : null);
      }
    };

    return () => channel.close();
  }, []);

  // Update user preferences (Global Theme Sync)
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    // 1. Optimistic update
    const previousUser = user;
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...updates,
      },
    };

    // Immediate state update for UI responsiveness
    setUser(updatedUser);

    // 2. If theme is being updated, also set the cookie for cross-app sync
    // Cookie is shared across all ports on localhost and subdomains in production
    if (updates.theme) {
      setThemeCookie(updates.theme as ThemeValue);
    }

    // 3. Broadcast to other tabs/apps for real-time sync
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('ainex-preferences');
      channel.postMessage({ type: 'PREFERENCES_UPDATE', preferences: updates });
      channel.close();
    }

    try {
      // 3. API Call to persist
      const response = await fetch('/api/auth/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: updatedUser.preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      // In dev mode, the PUT returns a new cookie which browser handles automatically via Set-Cookie header
      // The updated cookie contains the new preferences which will be picked up on next hydrate
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Revert optimistic update on failure
      setUser(previousUser);
    }
  }, [user]);

  // Update user profile (displayName, etc)
  const updateProfile = useCallback(async (updates: { displayName?: string }) => {
    if (!user) return;

    // 1. Optimistic update
    const previousUser = user;
    const updatedUser = {
      ...user,
      ...updates,
    };

    // Immediate state update for UI responsiveness
    setUser(updatedUser);

    // 2. Broadcast to other tabs/apps for real-time sync
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('ainex-preferences');
      channel.postMessage({ type: 'PROFILE_UPDATE', profile: updates });
      channel.close();
    }

    try {
      // 3. API Call to persist
      const response = await fetch('/api/auth/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Revert optimistic update on failure
      setUser(previousUser);
    }
  }, [user]);

  // Update user profile image
  const updateProfileImage = useCallback(async (imageData: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const result = await setProfileImage(user.uid, imageData);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Update local user state with new photo URL
      const updatedUser = {
        ...user,
        photoURL: result.downloadURL || user.photoURL,
      };
      setUser(updatedUser);

      // Broadcast to other tabs for sync
      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('ainex-preferences');
        channel.postMessage({
          type: 'PROFILE_IMAGE_UPDATE',
          photoURL: result.downloadURL,
        });
        channel.close();
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update profile image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile image',
      };
    }
  }, [user]);

  // Remove custom profile image
  const removeProfileImage = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const success = await removeCustomProfileImage(user.uid);

      if (success) {
        // Revert to Firebase Auth photoURL or empty
        const originalPhotoURL = firebaseUser?.photoURL || '';
        setUser({
          ...user,
          photoURL: originalPhotoURL,
        });

        // Sync the reverted photoURL to all spaces (fire and forget)
        syncUserPhotoToSpaces(user.uid, originalPhotoURL || null).catch(() => {
          // Ignore sync errors - non-critical
        });

        // Broadcast to other tabs
        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('ainex-preferences');
          channel.postMessage({
            type: 'PROFILE_IMAGE_UPDATE',
            photoURL: originalPhotoURL,
          });
          channel.close();
        }
      }

      return success;
    } catch (error) {
      console.error('Failed to remove profile image:', error);
      return false;
    }
  }, [user, firebaseUser]);

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
            // Sync session with Auth Hub for cross-app SSO
            syncSessionWithAuthHub(sessionCookie)
              .catch(() => {
                // Silent fail - SSO sync is non-critical
              });
          } else {
            // Log the full error response to help debug
            try {
              const errorData = await response.json();
              console.error('Session creation failed:', {
                status: response.status,
                code: errorData.code,
                error: errorData.error,
                message: errorData.message, // Server error message
                details: errorData.details,
                hint: errorData.hint
              });
            } catch {
              console.error('Session creation failed:', response.status, '(no response body)');
            }
            // Fallback: Create minimal user object from Firebase user
            setUser(createFallbackUser(firebaseUser));
          }
        } catch (error) {
          // Fallback: Create minimal user object from Firebase user
          setUser(createFallbackUser(firebaseUser));
        }

        // SSO is complete when user is set
        if (ssoInProgress) {
          setSsoInProgress(false);
        }
      } else {
        removeSessionCookie();
        setUser(null);
        // If SSO was in progress but no user, it failed - mark complete anyway
        if (ssoInProgress) {
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
    try {
      // Clear the shared session cookie via API (clears for all apps)
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to clear session cookie:', error);
    }

    // Sign out of Firebase Auth
    await firebaseSignOut(auth);

    // Clear local session data
    clearSessionData();
    setUser(null);
    setFirebaseUser(null);
  }, []);

  // Effective loading state: true if auth is loading OR SSO is in progress OR bootstrap hasn't checked yet
  // Bootstrap must complete before showing public pages (to detect existing session cookies)
  const bootstrapPending = bootstrapStatus === 'pending' || bootstrapStatus === 'running';
  const effectiveLoading = loading || ssoInProgress || (!user && bootstrapPending);

  // Dev-only: Hydrate user directly from session cookie
  // Used when Firebase Admin SDK isn't available to create custom tokens
  const hydrateFromDevSession = useCallback((sessionCookie: string) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[Auth] hydrateFromDevSession called in production, ignoring');
      return;
    }

    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
      const uid = decoded.uid;

      if (!uid) {
        console.error('[Auth] Invalid session cookie - no uid');
        return;
      }

      // IMPORTANT: Use ainex-theme cookie as source of truth for theme
      // This cookie is shared across all apps (ports) and is the authoritative source
      const cookieTheme = getThemeCookie();
      const sessionTheme = decoded.preferences?.theme;
      const authorativeTheme = cookieTheme || sessionTheme || 'dark';

      // Create a minimal user object with cookie theme taking precedence
      const now = Date.now();
      const basePreferences = decoded.preferences || {
        theme: 'dark',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: { email: true, push: false, inApp: true },
      };
      const devUser: User = {
        uid,
        email: decoded.email || '',
        displayName: decoded.displayName || decoded.email || 'Dev User',
        photoURL: decoded.photoURL || '',
        preferences: {
          ...basePreferences,
          theme: authorativeTheme, // Cookie theme takes precedence
        },
        createdAt: now,
        lastLoginAt: now,
        apps: {
          notes: true,
          journal: true,
          todo: true,
          health: true,
          album: true,
          habits: true,
          display: true,
          fit: true,
          project: true,
          workflow: true,
          calendar: true,
        },
        appPermissions: {},
        appsUsed: {},
        appsEligible: ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit', 'projects', 'workflow', 'calendar'],
        trialStartDate: now,
        subscriptionStatus: 'trial',
        suiteAccess: true,
      };

      setUser(devUser);
      setDevHydrated(true);
      setLoading(false);
    } catch (error) {
      console.error('[Auth] Failed to hydrate from dev session:', error);
    }
  }, []);

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
        hydrateFromDevSession,
        updatePreferences,
        updateProfile,
        updateProfileImage,
        removeProfileImage,
      }}
    >
      {/* SSOHandler processes auth_token from URL and signals completion */}
      <SSOHandler onComplete={setSsoComplete} />
      <AuthBootstrap />
      {/* SSOBridge checks Auth Hub for cross-app SSO when not authenticated */}
      {/* Disabled when devHydrated - dev hydration already succeeded without Firebase */}
      <SSOBridge
        enabled={!user && !devHydrated && bootstrapStatus === 'complete' && !ssoInProgress}
        hydrateFromDevSession={hydrateFromDevSession}
        onComplete={() => {
          // SSOBridge completed its check - if it found a session,
          // signInWithCustomToken will trigger onAuthStateChanged
        }}
      />
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
