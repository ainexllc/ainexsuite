/**
 * @ainexsuite/date-detection
 *
 * Date detection and calendar integration for AINexSpace apps.
 * Detects natural language dates, relative dates, and times in text
 * and provides UI components for adding them to the calendar.
 */

// Types
export type {
  DetectedDate,
  CalendarEventDraft,
  DateDetectionOptions,
  DateChipProps,
  CalendarQuickAddProps,
  DateSuggestionsProps,
  UseDateDetectionResult,
  UseCalendarActionResult,
} from './types';

// Core detection functions
export {
  detectDates,
  hasDetectableDates,
  segmentTextWithDates,
  getPrimaryDate,
  detectDatesInBatch,
  filterDates,
} from './lib/detector';
export type { TextSegment } from './lib/detector';

// Parser utilities
export {
  parseDates,
  parseDate,
  containsDate,
  describeParsedDate,
} from './lib/parser';

// Utility functions
export {
  generateId,
  calculateConfidence,
  extractTitleFromContext,
  calculateDefaultEndTime,
  createEventDraft,
  formatDateForChip,
  areDatesOverlapping,
  deduplicateDates,
} from './lib/utils';

// React hooks
export {
  useDateDetection,
  useHasDetectableDates,
  useCalendarAction,
  useIsEventAdded,
} from './hooks';

// React components
export { DateChip, CalendarQuickAdd, DateSuggestions, DateChips } from './components';
