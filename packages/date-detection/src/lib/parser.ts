/**
 * Date parsing wrapper using chrono-node
 */

import * as chrono from 'chrono-node';
import type { DetectedDate, DateDetectionOptions } from '../types';
import { generateId, calculateConfidence } from './utils';

/**
 * Parse a text string and extract all date/time references
 */
export function parseDates(
  text: string,
  options: DateDetectionOptions = {}
): DetectedDate[] {
  const {
    referenceDate = new Date(),
    minConfidence = 0.5,
    detectTimeOnly = true,
    maxResults = 10,
  } = options;

  // Use chrono's parse function to get all date references
  const results = chrono.parse(text, referenceDate, {
    forwardDate: true, // Prefer future dates for ambiguous cases
  });

  const detectedDates: DetectedDate[] = [];

  for (const result of results) {
    // Calculate confidence based on parsing certainty
    const confidence = calculateConfidence(result);

    if (confidence < minConfidence) {
      continue;
    }

    // Check if this is a time-only expression (like "at 3pm")
    const hasDate = result.start.isCertain('day') ||
                    result.start.isCertain('month') ||
                    result.start.isCertain('year') ||
                    result.start.isCertain('weekday');

    const hasTime = result.start.isCertain('hour');

    // Skip time-only if not enabled
    if (!hasDate && hasTime && !detectTimeOnly) {
      continue;
    }

    // Determine if this is an all-day event
    const isAllDay = !hasTime;

    // Get the parsed dates
    const parsedDate = result.start.date();
    const endDate = result.end?.date();

    detectedDates.push({
      id: generateId(),
      originalText: result.text,
      parsedDate,
      endDate,
      confidence,
      position: {
        start: result.index,
        end: result.index + result.text.length,
      },
      isAllDay,
      hasTime,
      referenceDate,
    });

    if (detectedDates.length >= maxResults) {
      break;
    }
  }

  return detectedDates;
}

/**
 * Parse a single date string and return the most likely date
 */
export function parseDate(
  text: string,
  referenceDate: Date = new Date()
): Date | null {
  const result = chrono.parseDate(text, referenceDate, {
    forwardDate: true,
  });
  return result;
}

/**
 * Check if a text string contains any date references
 */
export function containsDate(text: string): boolean {
  const results = chrono.parse(text);
  return results.length > 0;
}

/**
 * Get a human-readable description of the parsed date
 */
export function describeParsedDate(detected: DetectedDate): string {
  const { parsedDate, endDate, hasTime } = detected;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const parsedDay = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate()
  );

  const diffDays = Math.round(
    (parsedDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let dateStr: string;

  if (diffDays === 0) {
    dateStr = 'Today';
  } else if (diffDays === 1) {
    dateStr = 'Tomorrow';
  } else if (diffDays === -1) {
    dateStr = 'Yesterday';
  } else if (diffDays > 0 && diffDays < 7) {
    dateStr = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    dateStr = parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: parsedDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  if (hasTime) {
    const timeStr = parsedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    dateStr += ` at ${timeStr}`;
  }

  if (endDate) {
    const endTimeStr = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    dateStr += ` - ${endTimeStr}`;
  }

  return dateStr;
}
