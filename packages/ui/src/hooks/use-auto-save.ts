"use client";

import { useState, useEffect, useRef } from 'react';

export interface UseAutoSaveOptions {
  delay?: number;
  onError?: (error: Error) => void;
}

export interface UseAutoSaveReturn {
  saving: boolean;
  saved: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Auto-save hook with debouncing
 * Automatically saves value after a delay when it changes
 *
 * @param value - The value to auto-save
 * @param onSave - Async function to save the value
 * @param options - Configuration options
 * @returns Status indicators for saving state
 *
 * @example
 * ```tsx
 * const { saving, saved, error } = useAutoSave(
 *   displayName,
 *   async (value) => {
 *     await updateProfile({ displayName: value });
 *   },
 *   { delay: 500 }
 * );
 * ```
 */
export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const { delay = 500, onError } = options;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track initial value to avoid saving on first render
  const initialValueRef = useRef<T>(value);
  const isFirstRender = useRef(true);

  // Auto-hide saved indicator after 2 seconds
  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  // Debounced auto-save
  useEffect(() => {
    // Skip on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Skip if value hasn't changed from initial
    if (value === initialValueRef.current) {
      return;
    }

    // Clear any existing error
    setError(null);
    setSaved(false);

    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await onSave(value);
        initialValueRef.current = value; // Update initial value after successful save
        setSaved(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save';
        setError(errorMessage);
        if (onError && err instanceof Error) {
          onError(err);
        }
      } finally {
        setSaving(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, onSave, onError]);

  const clearError = () => setError(null);

  return { saving, saved, error, clearError };
}
