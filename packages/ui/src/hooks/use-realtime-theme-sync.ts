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

  // Track if we just made a local change to prevent feedback loops
  const isLocalChangeRef = useRef(false);

  // Track the last theme we synced (either direction)
  const lastSyncedThemeRef = useRef<string | null>(null);

  // Track if we've done initial sync
  const hasInitialSyncRef = useRef(false);

  // Track if we're currently syncing to Firestore
  const isSyncingToFirestoreRef = useRef(false);

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

    // Skip if this is a local change we just made
    if (isLocalChangeRef.current) {
      isLocalChangeRef.current = false;
      lastSyncedThemeRef.current = firestoreTheme;
      return;
    }

    // IMPORTANT: On initial sync, the ainex-theme cookie is the source of truth
    // This cookie is shared across all apps (ports) and may have been set by another app
    // Only on SUBSEQUENT syncs do we let Firestore updates override
    if (!hasInitialSyncRef.current) {
      const cookieTheme = getThemeCookie();
      console.log('[RealtimeThemeSync] Initial sync - cookie:', cookieTheme, 'firestore:', firestoreTheme);

      if (cookieTheme && cookieTheme !== firestoreTheme) {
        // Cookie exists and differs from Firestore - cookie wins on this device
        // The cookie represents the most recent theme choice on THIS device
        console.log('[RealtimeThemeSync] Using cookie theme (cross-app sync):', cookieTheme);
        lastSyncedThemeRef.current = cookieTheme;
        hasInitialSyncRef.current = true;

        // Update next-themes to match cookie if needed
        if (currentTheme !== cookieTheme) {
          setTheme(cookieTheme);
        }

        // Also sync cookie theme to Firestore so other devices get it
        if (updatePreferences && cookieTheme !== firestoreTheme) {
          isLocalChangeRef.current = true;
          updatePreferences({ theme: cookieTheme }).catch(console.error);
        }
        return;
      }

      // No cookie or cookie matches Firestore - use Firestore value
      hasInitialSyncRef.current = true;
    }

    // Only update if theme actually changed from Firestore
    if (firestoreTheme !== lastSyncedThemeRef.current) {
      console.log('[RealtimeThemeSync] Firestore theme changed:', lastSyncedThemeRef.current, '->', firestoreTheme);
      lastSyncedThemeRef.current = firestoreTheme;

      // Update next-themes (which also updates localStorage)
      if (currentTheme !== firestoreTheme) {
        setTheme(firestoreTheme);
      }

      // Also update the cookie for cross-app sync
      // Cookie is shared across all ports on localhost and subdomains in production
      setThemeCookie(firestoreTheme as ThemeValue);
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

    // Debounce: Skip if we tried to sync less than 2 seconds ago
    const now = Date.now();
    if (now - lastSyncAttemptRef.current < 2000) {
      return;
    }

    // This is a local change - sync to Firestore
    console.log('[RealtimeThemeSync] Local theme changed:', lastSyncedThemeRef.current, '->', currentTheme);
    lastSyncedThemeRef.current = currentTheme;
    lastSyncAttemptRef.current = now;
    isLocalChangeRef.current = true; // Prevent feedback loop
    isSyncingToFirestoreRef.current = true;

    updatePreferences({ theme: currentTheme })
      .catch((err) => {
        // On error, don't revert - just log. Cookie is already set correctly.
        console.error('[RealtimeThemeSync] Failed to sync theme to Firestore:', err);
      })
      .finally(() => {
        isSyncingToFirestoreRef.current = false;
      });
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
