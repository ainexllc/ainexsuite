'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  DetectedDate,
  DateDetectionOptions,
  UseDateDetectionResult,
} from '../types';
import { detectDates, hasDetectableDates } from '../lib/detector';

interface UseDateDetectionOptions extends DateDetectionOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Whether to detect on mount (default: true) */
  detectOnMount?: boolean;
  /** Skip detection if text hasn't changed */
  skipUnchanged?: boolean;
}

/**
 * React hook for detecting dates in text
 *
 * @example
 * ```tsx
 * const { dates, loading } = useDateDetection(noteContent, {
 *   minConfidence: 0.6,
 *   debounceMs: 500,
 * });
 *
 * return dates.map(date => (
 *   <DateChip key={date.id} detectedDate={date} />
 * ));
 * ```
 */
export function useDateDetection(
  text: string,
  options: UseDateDetectionOptions = {}
): UseDateDetectionResult {
  const {
    debounceMs = 300,
    detectOnMount = true,
    skipUnchanged = true,
    ...detectionOptions
  } = options;

  const [dates, setDates] = useState<DetectedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lastTextRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runDetection = useCallback(() => {
    if (skipUnchanged && text === lastTextRef.current) {
      return;
    }

    // Quick check before full parsing
    if (!hasDetectableDates(text)) {
      setDates([]);
      lastTextRef.current = text;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detected = detectDates(text, detectionOptions);
      setDates(detected);
      lastTextRef.current = text;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Detection failed'));
      setDates([]);
    } finally {
      setLoading(false);
    }
  }, [text, detectionOptions, skipUnchanged]);

  const debouncedDetection = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(runDetection, debounceMs);
    } else {
      runDetection();
    }
  }, [runDetection, debounceMs]);

  // Run detection when text changes
  useEffect(() => {
    if (text !== lastTextRef.current || (detectOnMount && dates.length === 0)) {
      debouncedDetection();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, debouncedDetection, detectOnMount, dates.length]);

  const refresh = useCallback(() => {
    lastTextRef.current = ''; // Force re-detection
    runDetection();
  }, [runDetection]);

  return {
    dates,
    loading,
    error,
    refresh,
  };
}

/**
 * Lightweight hook that just checks if text contains dates
 * Use when you only need to show/hide a date detection UI
 */
export function useHasDetectableDates(text: string): boolean {
  const [hasDateInText, setHasDates] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHasDates(hasDetectableDates(text));
    }, 150);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text]);

  return hasDateInText;
}
