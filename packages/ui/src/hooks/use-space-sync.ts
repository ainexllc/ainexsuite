'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Constants for cross-app space synchronization
 */
export const SPACE_SYNC_CHANNEL = 'ainex-space-sync';
export const UNIFIED_SPACE_KEY = 'ainex-current-space';

/**
 * Message types for space sync
 */
export interface SpaceSyncMessage {
  type: 'SPACE_CHANGED';
  spaceId: string;
  sourceApp: string;
  timestamp: number;
}

/**
 * Options for the useSpaceSync hook
 */
export interface UseSpaceSyncOptions {
  /** Current app identifier */
  appId: string;
  /** Current space ID from local state */
  currentSpaceId: string;
  /** Callback when space changes from another app */
  onSpaceChange: (spaceId: string) => void;
  /** Whether sync is enabled (default: true) */
  enabled?: boolean;
  /** Legacy storage key to migrate from (optional) */
  legacyStorageKey?: string;
}

/**
 * Hook for cross-app space synchronization using BroadcastChannel.
 *
 * This hook:
 * 1. Listens for space changes from other apps via BroadcastChannel
 * 2. Broadcasts space changes to other apps when local space changes
 * 3. Uses unified localStorage key for persistence
 * 4. Optionally migrates from legacy per-app storage keys
 *
 * @example
 * ```tsx
 * const { broadcastSpaceChange } = useSpaceSync({
 *   appId: 'notes',
 *   currentSpaceId,
 *   onSpaceChange: (newSpaceId) => {
 *     setCurrentSpaceId(newSpaceId);
 *     refetchData(newSpaceId);
 *   },
 *   legacyStorageKey: 'notes-current-space', // Optional: migrate from old key
 * });
 *
 * // When user changes space locally
 * const handleSpaceSelect = (spaceId: string) => {
 *   setCurrentSpaceId(spaceId);
 *   broadcastSpaceChange(spaceId);
 * };
 * ```
 */
export function useSpaceSync({
  appId,
  currentSpaceId,
  onSpaceChange,
  enabled = true,
  legacyStorageKey,
}: UseSpaceSyncOptions) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const lastReceivedRef = useRef<number>(0);

  // Debounce threshold to prevent loops (ms)
  const DEBOUNCE_MS = 100;

  // Handle migration from legacy storage key on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !legacyStorageKey) return;

    const legacyValue = localStorage.getItem(legacyStorageKey);
    const unifiedValue = localStorage.getItem(UNIFIED_SPACE_KEY);

    // Only migrate if legacy exists and unified doesn't
    if (legacyValue && !unifiedValue) {
      localStorage.setItem(UNIFIED_SPACE_KEY, legacyValue);
      // Don't remove legacy key yet - other tabs might still use it
    }
  }, [legacyStorageKey]);

  // Initialize BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    // Create channel
    const channel = new BroadcastChannel(SPACE_SYNC_CHANNEL);
    channelRef.current = channel;

    // Listen for space changes from other apps
    channel.onmessage = (event: MessageEvent<SpaceSyncMessage>) => {
      const { type, spaceId, sourceApp, timestamp } = event.data;

      // Ignore messages from self
      if (sourceApp === appId) return;

      // Ignore if message is older than our last broadcast (prevents loops)
      if (timestamp <= lastBroadcastRef.current) return;

      // Ignore duplicate messages (debounce)
      if (timestamp - lastReceivedRef.current < DEBOUNCE_MS) return;

      if (type === 'SPACE_CHANGED' && spaceId !== currentSpaceId) {
        lastReceivedRef.current = timestamp;

        // Update unified storage
        localStorage.setItem(UNIFIED_SPACE_KEY, spaceId);

        // Notify the app
        onSpaceChange(spaceId);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [appId, enabled, currentSpaceId, onSpaceChange]);

  // Broadcast space change to other apps
  const broadcastSpaceChange = useCallback((spaceId: string) => {
    if (!enabled || typeof window === 'undefined') return;

    const timestamp = Date.now();
    lastBroadcastRef.current = timestamp;

    // Update unified storage
    localStorage.setItem(UNIFIED_SPACE_KEY, spaceId);

    // Broadcast to other apps
    if (channelRef.current) {
      const message: SpaceSyncMessage = {
        type: 'SPACE_CHANGED',
        spaceId,
        sourceApp: appId,
        timestamp,
      };
      channelRef.current.postMessage(message);
    }
  }, [appId, enabled]);

  // Get initial space from unified storage (or legacy as fallback)
  const getInitialSpaceId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;

    // Try unified key first
    const unified = localStorage.getItem(UNIFIED_SPACE_KEY);
    if (unified) return unified;

    // Fall back to legacy key if provided
    if (legacyStorageKey) {
      const legacy = localStorage.getItem(legacyStorageKey);
      if (legacy) {
        // Migrate to unified
        localStorage.setItem(UNIFIED_SPACE_KEY, legacy);
        return legacy;
      }
    }

    return null;
  }, [legacyStorageKey]);

  return {
    broadcastSpaceChange,
    getInitialSpaceId,
  };
}

/**
 * Get the current space ID from unified storage (for use outside React)
 */
export function getUnifiedSpaceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(UNIFIED_SPACE_KEY);
}

/**
 * Set the space ID in unified storage (for use outside React)
 */
export function setUnifiedSpaceId(spaceId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(UNIFIED_SPACE_KEY, spaceId);
}
