'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useUserPreferencesListener } from '@ainexsuite/firebase';
import { setThemeCookie, getThemeCookie, type ThemeValue } from '@ainexsuite/theme';

interface ThemeSyncOptions {
  /** User's Firebase UID (undefined if not logged in) */
  uid: string | undefined;
  /** Function to update user preferences in Firestore */
  updatePreferences?: (updates: { theme: string }) => Promise<void>;
}

/**
 * Syncs theme preference bidirectionally between local state and Firestore.
 *
 * - When user changes theme locally → syncs to Firestore (cross-device)
 * - When Firestore changes (from another device) → syncs to local
 * - Cookie is source of truth for same-device cross-app sync
 *
 * @param options - { uid, updatePreferences }
 *
 * @example
 * ```tsx
 * // In your workspace layout:
 * const { user, updatePreferences } = useAuth();
 * useRealtimeThemeSync({ uid: user?.uid, updatePreferences });
 * ```
 */
export function useRealtimeThemeSync({ uid, updatePreferences }: ThemeSyncOptions) {
  const { theme: currentTheme, setTheme } = useTheme();
  const { preferences, loading } = useUserPreferencesListener(uid);

  // Track last local change time to ignore Firestore echoes
  const lastLocalChangeTimeRef = useRef<number>(0);

  // Track sync state
  const hasInitialSyncRef = useRef(false);
  const lastSyncedThemeRef = useRef<string | null>(null);
  const isSyncingToFirestoreRef = useRef(false);
  const isLocalChangeRef = useRef(false);

  // Sync FROM Firestore (cross-device sync)
  useEffect(() => {
    // Skip if no user (localStorage-only mode for guests)
    if (!uid) {
      hasInitialSyncRef.current = false;
      lastSyncedThemeRef.current = null;
      return;
    }

    // Skip if still loading preferences
    if (loading) return;

    // Skip if no theme preference set
    if (!preferences?.theme) return;

    const firestoreTheme = preferences.theme;

    // IGNORE echoes: If we made a local change recently, ignore Firestore updates
    // This allows the local state to settle and the Firestore write to complete/propagate
    if (Date.now() - lastLocalChangeTimeRef.current < 2000) {
      // Update our reference to what's in Firestore so we don't re-sync it back later
      lastSyncedThemeRef.current = firestoreTheme;
      return;
    }

    // IMPORTANT: On initial sync, cookie wins if different
    if (!hasInitialSyncRef.current) {
      const cookieTheme = getThemeCookie();
      if (cookieTheme && cookieTheme !== firestoreTheme) {
        lastSyncedThemeRef.current = cookieTheme;
        hasInitialSyncRef.current = true;
        if (currentTheme !== cookieTheme) setTheme(cookieTheme);
        if (updatePreferences) {
          lastLocalChangeTimeRef.current = Date.now();
          updatePreferences({ theme: cookieTheme }).catch(console.error);
        }
        return;
      }
      hasInitialSyncRef.current = true;
    }

    // Only update if theme actually changed from Firestore and valid
    if (firestoreTheme !== lastSyncedThemeRef.current) {
      lastSyncedThemeRef.current = firestoreTheme;
      if (currentTheme !== firestoreTheme) {
        setTheme(firestoreTheme);
        setThemeCookie(firestoreTheme as ThemeValue);
      }
    }
  }, [uid, preferences?.theme, loading, currentTheme, setTheme, updatePreferences]);

  // Track last sync attempt time to prevent rapid retries
  const lastSyncAttemptRef = useRef<number>(0);

  // Sync TO Firestore when local theme changes (debounced)
  useEffect(() => {
    // Skip if no user or no updatePreferences function
    if (!uid || !updatePreferences) return;

    // Skip if not yet initialized
    if (!hasInitialSyncRef.current) return;

    // Skip if no current theme
    if (!currentTheme) return;

    // Skip if this matches what we already synced
    if (currentTheme === lastSyncedThemeRef.current) return;

    // Skip if we're currently syncing from Firestore
    if (isSyncingToFirestoreRef.current) return;

    // This is a local change - mark timestamp immediately
    lastLocalChangeTimeRef.current = Date.now();

    // Debounce sync to Firestore
    const startSync = async () => {
      lastSyncedThemeRef.current = currentTheme;
      isSyncingToFirestoreRef.current = true;
      try {
        await updatePreferences({ theme: currentTheme });
      } catch (err) {
        console.error('[RealtimeThemeSync] Failed to sync theme to Firestore:', err);
      } finally {
        isSyncingToFirestoreRef.current = false;
        lastSyncAttemptRef.current = Date.now();
      }
    };

    const timer = setTimeout(startSync, 1000);
    return () => clearTimeout(timer);
  }, [uid, currentTheme, updatePreferences]);

  /**
   * Call this before making a local theme change to prevent
   * the Firestore listener from creating a feedback loop.
   * @deprecated No longer needed - hook handles this automatically
   */
  const markLocalChange = useCallback(() => {
    isLocalChangeRef.current = true;
  }, []);

  return { markLocalChange };
}
