'use client';

import { useEffect, useRef } from 'react';

/**
 * Options for the useSpaceChangeEffect hook
 */
export interface UseSpaceChangeEffectOptions {
  /** Current space ID to track */
  currentSpaceId: string;
  /** Callback when space changes */
  onSpaceChange: (newSpaceId: string, previousSpaceId: string | null) => void;
  /** Whether the effect is enabled (default: true) */
  enabled?: boolean;
  /** Whether to skip the initial call (default: true - only fires on actual changes) */
  skipInitial?: boolean;
}

/**
 * Hook to run side effects when the current space changes.
 *
 * Use this hook to refetch data, clear caches, or perform other
 * cleanup/initialization when the user switches spaces.
 *
 * @example
 * ```tsx
 * const { currentSpaceId } = useSpaces();
 *
 * useSpaceChangeEffect({
 *   currentSpaceId,
 *   onSpaceChange: (newSpaceId, previousSpaceId) => {
 *     // Clear local cache
 *     clearTaskCache();
 *     // Refetch data for new space
 *     refetchTasks(newSpaceId);
 *     // Log analytics
 *     trackSpaceSwitch(previousSpaceId, newSpaceId);
 *   },
 * });
 * ```
 *
 * @example With conditional execution
 * ```tsx
 * useSpaceChangeEffect({
 *   currentSpaceId,
 *   onSpaceChange: (newSpaceId) => {
 *     // Only refetch if switching to a shared space
 *     if (newSpaceId !== 'personal') {
 *       refetchSharedData(newSpaceId);
 *     }
 *   },
 *   enabled: !loading, // Don't run until data is loaded
 * });
 * ```
 */
export function useSpaceChangeEffect({
  currentSpaceId,
  onSpaceChange,
  enabled = true,
  skipInitial = true,
}: UseSpaceChangeEffectOptions): void {
  const previousSpaceIdRef = useRef<string | null>(null);
  const isInitialRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    const previousSpaceId = previousSpaceIdRef.current;

    // Skip if space hasn't actually changed
    if (previousSpaceId === currentSpaceId) return;

    // Skip initial mount if requested
    if (isInitialRef.current && skipInitial) {
      isInitialRef.current = false;
      previousSpaceIdRef.current = currentSpaceId;
      return;
    }

    isInitialRef.current = false;
    previousSpaceIdRef.current = currentSpaceId;

    // Call the effect handler
    onSpaceChange(currentSpaceId, previousSpaceId);
  }, [currentSpaceId, enabled, onSpaceChange, skipInitial]);
}

/**
 * Hook variant that also provides the previous space ID as state.
 * Useful when you need to access the previous space in render logic.
 */
export function usePreviousSpaceId(currentSpaceId: string): string | null {
  const previousRef = useRef<string | null>(null);
  const currentRef = useRef<string>(currentSpaceId);

  // Only update previous when current actually changes
  if (currentRef.current !== currentSpaceId) {
    previousRef.current = currentRef.current;
    currentRef.current = currentSpaceId;
  }

  return previousRef.current;
}
