/**
 * Text scanning and date detection
 */

import type { DetectedDate, DateDetectionOptions } from '../types';
import { parseDates, containsDate } from './parser';
import { deduplicateDates } from './utils';

/**
 * Scan text for all date/time references
 */
export function detectDates(
  text: string,
  options: DateDetectionOptions = {}
): DetectedDate[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Parse all dates from the text
  const dates = parseDates(text, options);

  // Deduplicate overlapping or duplicate detections
  const deduped = deduplicateDates(dates);

  // Sort by position in text
  return deduped.sort((a, b) => a.position.start - b.position.start);
}

/**
 * Quick check if text contains any dates worth detecting
 */
export function hasDetectableDates(text: string): boolean {
  if (!text || text.trim().length < 3) {
    return false;
  }
  return containsDate(text);
}

/**
 * Detect dates in text and highlight their positions
 * Useful for rendering text with inline date chips
 */
export interface TextSegment {
  type: 'text' | 'date';
  content: string;
  start: number;
  end: number;
  detectedDate?: DetectedDate;
}

export function segmentTextWithDates(
  text: string,
  options: DateDetectionOptions = {}
): TextSegment[] {
  const dates = detectDates(text, options);
  const segments: TextSegment[] = [];

  let lastEnd = 0;

  for (const date of dates) {
    // Add text segment before this date
    if (date.position.start > lastEnd) {
      segments.push({
        type: 'text',
        content: text.substring(lastEnd, date.position.start),
        start: lastEnd,
        end: date.position.start,
      });
    }

    // Add date segment
    segments.push({
      type: 'date',
      content: date.originalText,
      start: date.position.start,
      end: date.position.end,
      detectedDate: date,
    });

    lastEnd = date.position.end;
  }

  // Add remaining text
  if (lastEnd < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastEnd),
      start: lastEnd,
      end: text.length,
    });
  }

  return segments;
}

/**
 * Get the most relevant/prominent date from text
 * Useful when you only want to show one suggestion
 */
export function getPrimaryDate(
  text: string,
  options: DateDetectionOptions = {}
): DetectedDate | null {
  const dates = detectDates(text, options);

  if (dates.length === 0) {
    return null;
  }

  // Prefer dates with times over all-day
  // Then prefer higher confidence
  // Then prefer earlier in text
  const sorted = [...dates].sort((a, b) => {
    // Time specificity
    if (a.hasTime && !b.hasTime) return -1;
    if (!a.hasTime && b.hasTime) return 1;

    // Confidence
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }

    // Position (earlier is better)
    return a.position.start - b.position.start;
  });

  return sorted[0];
}

/**
 * Batch detection for multiple text entries
 * More efficient for processing many entries at once
 */
export function detectDatesInBatch(
  entries: Array<{ id: string; text: string }>,
  options: DateDetectionOptions = {}
): Map<string, DetectedDate[]> {
  const results = new Map<string, DetectedDate[]>();

  for (const entry of entries) {
    results.set(entry.id, detectDates(entry.text, options));
  }

  return results;
}

/**
 * Filter dates based on custom criteria
 */
export function filterDates(
  dates: DetectedDate[],
  filter: {
    future?: boolean; // Only future dates
    past?: boolean; // Only past dates
    hasTime?: boolean; // Must have specific time
    isAllDay?: boolean; // Must be all-day
    minConfidence?: number;
  }
): DetectedDate[] {
  const now = new Date();

  return dates.filter((date) => {
    if (filter.future && date.parsedDate <= now) return false;
    if (filter.past && date.parsedDate >= now) return false;
    if (filter.hasTime !== undefined && date.hasTime !== filter.hasTime)
      return false;
    if (filter.isAllDay !== undefined && date.isAllDay !== filter.isAllDay)
      return false;
    if (filter.minConfidence && date.confidence < filter.minConfidence)
      return false;
    return true;
  });
}
