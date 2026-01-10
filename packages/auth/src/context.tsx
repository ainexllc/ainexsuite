'use client';

/**
 * Simplified Auth Context Provider for React apps
 *
 * This is a streamlined version that uses server-side session cookies as the
 * single source of truth. The cookie is scoped to .ainexspace.com for SSO.
 *
 * Key simplifications:
 * - Cookie is source of truth (not onAuthStateChanged)
 * - No SSOBridge (shared cookie handles cross-app SSO)
 * - No AuthBootstrap (middleware handles route protection)
 * - Simple 3-state auth phase: loading → authenticated | unauthenticated
 * - Dev mode uses localStorage fallback for cross-port SSO
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  setProfileImage,
  removeCustomProfileImage,
  syncUserPhotoToSpaces,
  setAnimatedAvatar,
  toggleAnimatedAvatar as firebaseToggleAnimatedAvatar,
  removeAnimatedAvatar as firebaseRemoveAnimatedAvatar,
  useUserProfileListener,
} from '@ainexsuite/firebase';
import { signOut as firebaseSignOut, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import type { User, UserPreferences } from '@ainexsuite/types';
import { setThemeCookie, getThemeCookie, type ThemeValue } from '@ainexsuite/theme';

// ============================================================================
// Constants
// ============================================================================

// Dev mode localStorage key for cross-port SSO (same as in session-core.ts)
const DEV_SESSION_KEY = '__ainex_dev_session';

// ============================================================================
// Types
// ============================================================================

export type AuthPhase = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  authPhase: AuthPhase;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  updateProfile: (updates: { displayName?: string }) => Promise<void>;
  updateProfileImage: (imageData: string) => Promise<{ success: boolean; error?: string }>;
  removeProfileImage: () => Promise<boolean>;
  generateAnimatedAvatar: (action: string) => Promise<{ success: boolean; videoData?: string; error?: string; pending?: boolean; operationId?: string }>;
  saveAnimatedAvatar: (videoData: string, action: string) => Promise<{ success: boolean; error?: string }>;
  toggleAnimatedAvatar: (useAnimated: boolean) => Promise<void>;
  removeAnimatedAvatar: () => Promise<boolean>;
  pollAnimationStatus: (operationId: string) => Promise<{ success: boolean; done: boolean; videoData?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

function getDefaultPreferences(): UserPreferences {
  const cookieTheme = typeof document !== 'undefined' ? getThemeCookie() : null;
  return {
    theme: cookieTheme || 'dark',
    language: 'en',
    timezone: typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'America/New_York',
    notifications: {
      email: true,
      push: false,
      inApp: true,
    },
  };
}

/**
 * Check for dev session in localStorage (dev mode only)
 */
function getDevSession(): User | null {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return null;
  }

  try {
    const sessionData = localStorage.getItem(DEV_SESSION_KEY);
    if (!sessionData) return null;

    const data = JSON.parse(sessionData);

    // Check expiry
    if (data.expiresAt && data.expiresAt < Date.now()) {
      localStorage.removeItem(DEV_SESSION_KEY);
      return null;
    }

    return data as User;
  } catch {
    return null;
  }
}

/**
 * Store dev session in localStorage (dev mode only)
 */
function setDevSession(user: User): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  const DEV_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

  localStorage.setItem(DEV_SESSION_KEY, JSON.stringify({
    ...user,
    timestamp: Date.now(),
    expiresAt: Date.now() + DEV_SESSION_TTL_MS,
  }));
}

/**
 * Clear dev session from localStorage
 */
function clearDevSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEV_SESSION_KEY);
  }
}

// ============================================================================
// Auth Provider
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authPhase, setAuthPhase] = useState<AuthPhase>('loading');

  // Cross-app profile sync via Firestore listener
  const { profile: firestoreProfile } = useUserProfileListener(user?.uid);

  // Sync profile data from Firestore to local user state
  useEffect(() => {
    if (!user || !firestoreProfile) return;

    const hasChange =
      firestoreProfile.photoURL !== user.photoURL ||
      firestoreProfile.iconURL !== user.iconURL ||
      firestoreProfile.animatedAvatarURL !== user.animatedAvatarURL ||
      firestoreProfile.displayName !== user.displayName ||
      firestoreProfile.useAnimatedAvatar !== user.useAnimatedAvatar;

    if (hasChange) {
      setUser(prev => prev ? {
        ...prev,
        photoURL: firestoreProfile.photoURL || prev.photoURL,
        iconURL: firestoreProfile.iconURL || prev.iconURL,
        animatedAvatarURL: firestoreProfile.animatedAvatarURL || prev.animatedAvatarURL,
        animatedAvatarAction: firestoreProfile.animatedAvatarAction || prev.animatedAvatarAction,
        useAnimatedAvatar: firestoreProfile.useAnimatedAvatar ?? prev.useAnimatedAvatar,
        displayName: firestoreProfile.displayName || prev.displayName,
      } : null);
    }
    // Only re-run when firestoreProfile changes or user ID changes (not full user object to avoid loops)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreProfile, user?.uid]);

  // Initialize auth state from session cookie
  useEffect(() => {
    const initAuth = async () => {
      // Helper to sync Firebase Auth before setting user state
      // This prevents race conditions where Firestore subscriptions start before Firebase Auth is ready
      const syncFirebaseAuthFirst = async (): Promise<boolean> => {
        try {
          const tokenResponse = await fetch('/api/auth/custom-token', {
            method: 'POST',
            credentials: 'include',
          });

          if (tokenResponse.ok) {
            const { customToken } = await tokenResponse.json();
            await signInWithCustomToken(auth, customToken);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      };

      // First, try dev localStorage session (dev mode fast path)
      const devSession = getDevSession();
      if (devSession) {
        // Sync Firebase Auth BEFORE setting user state to prevent race conditions
        const firebaseAuthSynced = await syncFirebaseAuthFirst();
        if (!firebaseAuthSynced) {
          // Firebase Auth sync failed - clear stale session and require re-login
          console.warn('[Auth] Firebase Auth sync failed for dev session - clearing session');
          clearDevSession();
          setAuthPhase('unauthenticated');
          return;
        }
        setUser(devSession);
        setAuthPhase('authenticated');
        return;
      }

      // Check session cookie via API
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          if (data.authenticated && data.user) {
            const sessionUser: User = {
              uid: data.user.uid,
              email: data.user.email || '',
              displayName: data.user.displayName || data.user.email || 'User',
              photoURL: data.user.photoURL || '',
              iconURL: data.user.iconURL,
              animatedAvatarURL: data.user.animatedAvatarURL,
              animatedAvatarAction: data.user.animatedAvatarAction,
              animatedAvatarStyle: data.user.animatedAvatarStyle,
              useAnimatedAvatar: data.user.useAnimatedAvatar,
              preferences: data.user.preferences || getDefaultPreferences(),
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
              apps: data.user.apps || {},
              appPermissions: data.user.appPermissions || {},
              appsUsed: data.user.appsUsed || {},
              appsEligible: data.user.appsEligible || [],
              trialStartDate: data.user.trialStartDate || Date.now(),
              subscriptionStatus: data.user.subscriptionStatus || 'trial',
              suiteAccess: data.user.suiteAccess ?? true,
            };

            // Sync Firebase Auth BEFORE setting user state to prevent race conditions
            // This ensures Firestore subscriptions don't start until Firebase Auth is ready
            const firebaseAuthSynced = await syncFirebaseAuthFirst();
            if (!firebaseAuthSynced) {
              // Firebase Auth sync failed - session is valid but Firestore won't work
              // Still set user for basic functionality but log warning
              console.warn('[Auth] Firebase Auth sync failed - Firestore features may not work');
            }

            setUser(sessionUser);
            setAuthPhase('authenticated');

            // Cache in dev localStorage for cross-port SSO
            if (process.env.NODE_ENV === 'development') {
              setDevSession(sessionUser);
            }

            return;
          }
        }

        // No valid session
        setAuthPhase('unauthenticated');
      } catch {
        setAuthPhase('unauthenticated');
      }
    };

    initAuth();
  }, []);

  // Sync Firebase Auth state (needed for Firestore rules)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
    });

    return () => unsubscribe();
  }, []);

  // Cross-tab preference sync via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('ainex-preferences');
    channel.onmessage = (event) => {
      if (event.data.type === 'PREFERENCES_UPDATE') {
        setUser(prev => prev ? {
          ...prev,
          preferences: { ...prev.preferences, ...event.data.preferences }
        } : null);
      } else if (event.data.type === 'PROFILE_UPDATE') {
        setUser(prev => prev ? { ...prev, ...event.data.profile } : null);
      } else if (event.data.type === 'PROFILE_IMAGE_UPDATE') {
        setUser(prev => prev ? {
          ...prev,
          photoURL: event.data.photoURL,
          iconURL: event.data.iconURL ?? undefined,
        } : null);
      } else if (event.data.type === 'ANIMATED_AVATAR_UPDATE') {
        setUser(prev => prev ? {
          ...prev,
          animatedAvatarURL: event.data.animatedAvatarURL,
          animatedAvatarAction: event.data.animatedAvatarAction,
          useAnimatedAvatar: event.data.useAnimatedAvatar,
        } : null);
      } else if (event.data.type === 'ANIMATED_AVATAR_TOGGLE') {
        setUser(prev => prev ? { ...prev, useAnimatedAvatar: event.data.useAnimated } : null);
      } else if (event.data.type === 'ANIMATED_AVATAR_REMOVED') {
        setUser(prev => prev ? {
          ...prev,
          animatedAvatarURL: undefined,
          animatedAvatarStyle: undefined,
          useAnimatedAvatar: false,
        } : null);
      }
    };

    return () => channel.close();
  }, []);

  // Sign out
  const signOutUser = useCallback(async () => {
    try {
      // Clear session cookie via API (clears for all .ainexspace.com apps)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[Auth] Failed to clear session cookie:', error);
    }

    // Sign out of Firebase Auth
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore Firebase sign out errors
    }

    // Clear dev localStorage session
    clearDevSession();

    // Reset state
    setUser(null);
    setFirebaseUser(null);
    setAuthPhase('unauthenticated');
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    const previousUser = user;
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...updates },
    };

    // Optimistic update
    setUser(updatedUser);

    // Set theme cookie for cross-app sync
    if (updates.theme) {
      setThemeCookie(updates.theme as ThemeValue);
    }

    // Broadcast to other tabs
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('ainex-preferences');
      channel.postMessage({ type: 'PREFERENCES_UPDATE', preferences: updates });
      channel.close();
    }

    try {
      const response = await fetch('/api/auth/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedUser.preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      // Update dev session
      if (process.env.NODE_ENV === 'development') {
        setDevSession(updatedUser);
      }
    } catch (error) {
      console.error('[Auth] Failed to save preferences:', error);
      setUser(previousUser);
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates: { displayName?: string }) => {
    if (!user) return;

    const previousUser = user;
    const updatedUser = { ...user, ...updates };

    setUser(updatedUser);

    // Broadcast to other tabs
    if (typeof window !== 'undefined') {
      const channel = new BroadcastChannel('ainex-preferences');
      channel.postMessage({ type: 'PROFILE_UPDATE', profile: updates });
      channel.close();
    }

    try {
      const response = await fetch('/api/auth/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      if (process.env.NODE_ENV === 'development') {
        setDevSession(updatedUser);
      }
    } catch (error) {
      console.error('[Auth] Failed to save profile:', error);
      setUser(previousUser);
    }
  }, [user]);

  // Update profile image
  const updateProfileImage = useCallback(async (imageData: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const result = await setProfileImage(user.uid, imageData);

      if (!result.success || !result.downloadURL) {
        return { success: false, error: result.error || 'Failed to get download URL' };
      }

      setUser(prev => prev ? {
        ...prev,
        photoURL: result.downloadURL || prev.photoURL,
        iconURL: result.iconURL,
      } : null);

      // Broadcast to other tabs
      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('ainex-preferences');
        channel.postMessage({
          type: 'PROFILE_IMAGE_UPDATE',
          photoURL: result.downloadURL,
          iconURL: result.iconURL,
        });
        channel.close();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile image',
      };
    }
  }, [user]);

  // Remove profile image
  const removeProfileImage = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await removeCustomProfileImage(user.uid);

      if (success) {
        const originalPhotoURL = firebaseUser?.photoURL || '';
        setUser({ ...user, photoURL: originalPhotoURL, iconURL: undefined });

        syncUserPhotoToSpaces(user.uid, originalPhotoURL || null).catch(() => {});

        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('ainex-preferences');
          channel.postMessage({
            type: 'PROFILE_IMAGE_UPDATE',
            photoURL: originalPhotoURL,
            iconURL: null,
          });
          channel.close();
        }
      }

      return success;
    } catch {
      return false;
    }
  }, [user, firebaseUser]);

  // Generate animated avatar
  const generateAnimatedAvatar = useCallback(async (action: string): Promise<{
    success: boolean;
    videoData?: string;
    error?: string;
    pending?: boolean;
    operationId?: string;
  }> => {
    if (!user?.photoURL) {
      return { success: false, error: 'No avatar to animate' };
    }

    try {
      const response = await fetch('/api/animate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceImage: user.photoURL, action }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to generate animation' };
      }

      if (data.pending && data.operationId) {
        return { success: true, pending: true, operationId: data.operationId };
      }

      if (data.videoUrl) {
        const videoResponse = await fetch(data.videoUrl);
        const videoBlob = await videoResponse.blob();
        const videoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(videoBlob);
        });
        return { success: true, videoData: videoBase64 };
      }

      return { success: true, videoData: data.videoData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate animation',
      };
    }
  }, [user?.photoURL]);

  // Save animated avatar
  const saveAnimatedAvatar = useCallback(async (videoData: string, action: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const result = await setAnimatedAvatar(user.uid, videoData, undefined, action);

      if (!result.success || !result.videoURL) {
        return { success: false, error: result.error || 'Failed to save animation' };
      }

      setUser(prev => prev ? {
        ...prev,
        animatedAvatarURL: result.videoURL,
        animatedAvatarAction: action,
        useAnimatedAvatar: true,
      } : null);

      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('ainex-preferences');
        channel.postMessage({
          type: 'ANIMATED_AVATAR_UPDATE',
          animatedAvatarURL: result.videoURL,
          animatedAvatarAction: action,
          useAnimatedAvatar: true,
        });
        channel.close();
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save animation',
      };
    }
  }, [user]);

  // Toggle animated avatar
  const toggleAnimatedAvatar = useCallback(async (useAnimated: boolean): Promise<void> => {
    if (!user) return;

    try {
      await firebaseToggleAnimatedAvatar(user.uid, useAnimated);

      setUser(prev => prev ? { ...prev, useAnimatedAvatar: useAnimated } : null);

      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('ainex-preferences');
        channel.postMessage({ type: 'ANIMATED_AVATAR_TOGGLE', useAnimated });
        channel.close();
      }
    } catch (error) {
      console.error('[Auth] Failed to toggle animated avatar:', error);
    }
  }, [user]);

  // Remove animated avatar
  const removeAnimatedAvatar = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await firebaseRemoveAnimatedAvatar(user.uid);

      if (success) {
        setUser(prev => prev ? {
          ...prev,
          animatedAvatarURL: undefined,
          animatedAvatarStyle: undefined,
          useAnimatedAvatar: false,
        } : null);

        if (typeof window !== 'undefined') {
          const channel = new BroadcastChannel('ainex-preferences');
          channel.postMessage({ type: 'ANIMATED_AVATAR_REMOVED' });
          channel.close();
        }
      }

      return success;
    } catch {
      return false;
    }
  }, [user]);

  // Poll animation status
  const pollAnimationStatus = useCallback(async (operationId: string): Promise<{
    success: boolean;
    done: boolean;
    videoData?: string;
    error?: string;
  }> => {
    try {
      const response = await fetch(`/api/animate-avatar?operationId=${encodeURIComponent(operationId)}`);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, done: true, error: data.error || 'Failed to check status' };
      }

      if (data.done) {
        return {
          success: data.success,
          done: true,
          videoData: data.videoUrl || data.videoData,
          error: data.error,
        };
      }

      return { success: true, done: false };
    } catch (error) {
      return {
        success: false,
        done: true,
        error: error instanceof Error ? error.message : 'Failed to check status',
      };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading: authPhase === 'loading',
        authPhase,
        signOut: signOutUser,
        logout: signOutUser,
        updatePreferences,
        updateProfile,
        updateProfileImage,
        removeProfileImage,
        generateAnimatedAvatar,
        saveAnimatedAvatar,
        toggleAnimatedAvatar,
        removeAnimatedAvatar,
        pollAnimationStatus,
      }}
    >
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
