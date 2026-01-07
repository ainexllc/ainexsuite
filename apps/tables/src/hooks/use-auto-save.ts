"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type AutoSaveOptions<T> = {
  /** Data to save */
  data: T;
  /** Function to perform the save */
  onSave: (data: T) => Promise<void>;
  /** Debounce delay in ms (default: 1500) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save succeeds */
  onSuccess?: () => void;
  /** Callback when save fails */
  onError?: (error: unknown) => void;
};

type AutoSaveReturn = {
  /** Current save status */
  status: SaveStatus;
  /** Force an immediate save */
  flush: () => Promise<void>;
  /** Whether there are unsaved changes */
  isDirty: boolean;
};

/**
 * Hook for auto-saving data with debounce
 * - Automatically saves after debounceMs of inactivity
 * - Provides status feedback (idle, saving, saved, error)
 * - flush() can be called to save immediately (e.g., on close)
 */
export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 1500,
  enabled = true,
  onSuccess,
  onError,
}: AutoSaveOptions<T>): AutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [isDirty, setIsDirty] = useState(false);

  // Track the latest data for saving
  const dataRef = useRef(data);
  const lastSavedRef = useRef<string>(JSON.stringify(data));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Update dataRef when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Perform the actual save
  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    const currentData = dataRef.current;
    const currentJson = JSON.stringify(currentData);

    // Skip if nothing changed
    if (currentJson === lastSavedRef.current) {
      setIsDirty(false);
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");

    try {
      await onSave(currentData);
      lastSavedRef.current = currentJson;
      setIsDirty(false);
      setStatus("saved");
      onSuccess?.();

      // Reset to idle after showing "saved" briefly
      setTimeout(() => {
        setStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 1500);
    } catch (error) {
      setStatus("error");
      onError?.(error);
      console.error("Auto-save failed:", error);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onSuccess, onError]);

  // Flush immediately (for close/blur)
  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await performSave();
  }, [performSave]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!enabled) return;

    const currentJson = JSON.stringify(data);
    const hasChanges = currentJson !== lastSavedRef.current;

    setIsDirty(hasChanges);

    if (!hasChanges) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(() => {
      void performSave();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    flush,
    isDirty,
  };
}
