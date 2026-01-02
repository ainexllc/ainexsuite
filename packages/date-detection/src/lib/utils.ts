/**
 * Utility functions for date detection
 */

import type { ParsedResult } from 'chrono-node';
import type { DetectedDate, CalendarEventDraft } from '../types';

/**
 * Generate a unique ID for detected dates
 */
export function generateId(): string {
  return `dd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate confidence score for a parsed result
 */
export function calculateConfidence(result: ParsedResult): number {
  let score = 0.5; // Base score

  const start = result.start;

  // Increase confidence for certain components
  if (start.isCertain('day')) score += 0.1;
  if (start.isCertain('month')) score += 0.1;
  if (start.isCertain('year')) score += 0.1;
  if (start.isCertain('hour')) score += 0.1;
  if (start.isCertain('minute')) score += 0.05;
  if (start.isCertain('weekday')) score += 0.05;

  // Reduce confidence for very short matches (might be false positives)
  if (result.text.length < 3) score -= 0.2;

  // Reduce confidence for purely numeric matches
  if (/^\d+$/.test(result.text.trim())) score -= 0.3;

  return Math.max(0, Math.min(1, score));
}

/**
 * Extract a title from context text around the detected date
 */
export function extractTitleFromContext(
  fullText: string,
  detected: DetectedDate,
  maxLength: number = 50
): string {
  const { position, originalText } = detected;

  // Try to get text before the date
  let beforeText = fullText.substring(0, position.start).trim();
  let afterText = fullText.substring(position.end).trim();

  // Remove common connecting words from before text
  beforeText = beforeText.replace(/\s+(on|at|by|for|until|from)$/i, '');

  // Remove connecting words from after text
  afterText = afterText.replace(/^(on|at|by|for|until|from)\s+/i, '');

  // Prefer before text as title, fall back to after
  let title = beforeText || afterText;

  // Get just the last sentence/clause
  const sentences = title.split(/[.!?\n]/);
  title = sentences[sentences.length - 1].trim() || title;

  // Limit length
  if (title.length > maxLength) {
    title = title.substring(0, maxLength - 3) + '...';
  }

  return title || originalText;
}

/**
 * Calculate default end time based on start time and event type
 */
export function calculateDefaultEndTime(
  startTime: Date,
  isAllDay: boolean,
  durationMinutes: number = 60
): Date {
  if (isAllDay) {
    // All-day events end at the same time (full day)
    return new Date(startTime);
  }

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  return endTime;
}

/**
 * Create a calendar event draft from a detected date
 */
export function createEventDraft(
  detected: DetectedDate,
  context: {
    app: string;
    entryId?: string;
    entryType?: string;
    title?: string;
    description?: string;
    fullText?: string;
  }
): CalendarEventDraft {
  const title =
    context.title ||
    (context.fullText
      ? extractTitleFromContext(context.fullText, detected)
      : detected.originalText);

  const startTime = detected.parsedDate;
  const endTime =
    detected.endDate || calculateDefaultEndTime(startTime, detected.isAllDay);

  return {
    title,
    startTime,
    endTime,
    allDay: detected.isAllDay,
    type: 'event',
    source: {
      app: context.app,
      entryId: context.entryId,
      entryType: context.entryType,
    },
    detectedText: detected.originalText,
    description: context.description,
  };
}

/**
 * Format a date for display in a chip
 */
export function formatDateForChip(detected: DetectedDate): string {
  const { parsedDate, hasTime } = detected;
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
  } else if (diffDays > 1 && diffDays < 7) {
    dateStr = parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    dateStr = parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  if (hasTime) {
    const timeStr = parsedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${dateStr}, ${timeStr}`;
  }

  return dateStr;
}

/**
 * Check if two detected dates are overlapping or duplicates
 */
export function areDatesOverlapping(a: DetectedDate, b: DetectedDate): boolean {
  // Check if positions overlap
  return (
    (a.position.start <= b.position.end && a.position.end >= b.position.start) ||
    // Or if they resolve to the same date/time
    (a.parsedDate.getTime() === b.parsedDate.getTime() &&
      a.isAllDay === b.isAllDay)
  );
}

/**
 * Deduplicate detected dates, preferring more specific ones
 */
export function deduplicateDates(dates: DetectedDate[]): DetectedDate[] {
  const result: DetectedDate[] = [];

  for (const date of dates) {
    const overlapping = result.findIndex((d) => areDatesOverlapping(d, date));

    if (overlapping === -1) {
      result.push(date);
    } else {
      // Keep the one with higher confidence or more specificity
      const existing = result[overlapping];
      if (
        date.confidence > existing.confidence ||
        (date.hasTime && !existing.hasTime)
      ) {
        result[overlapping] = date;
      }
    }
  }

  return result;
}
