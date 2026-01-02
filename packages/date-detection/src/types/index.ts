/**
 * Types for date detection and calendar integration
 */

export interface DetectedDate {
  /** Unique identifier for this detection */
  id: string;
  /** The original text that was parsed */
  originalText: string;
  /** The parsed start date/time */
  parsedDate: Date;
  /** Optional end date for ranges */
  endDate?: Date;
  /** Confidence score 0-1 */
  confidence: number;
  /** Position in the source text */
  position: {
    start: number;
    end: number;
  };
  /** Whether this is an all-day event (no specific time) */
  isAllDay: boolean;
  /** Whether a specific time was detected */
  hasTime: boolean;
  /** The reference date used for parsing (for relative dates) */
  referenceDate?: Date;
}

export interface CalendarEventDraft {
  /** Event title (derived from context) */
  title: string;
  /** Start date/time */
  startTime: Date;
  /** End date/time */
  endTime: Date;
  /** Whether this is an all-day event */
  allDay: boolean;
  /** Type of calendar entry */
  type: 'event' | 'task' | 'reminder';
  /** Source app and entry information */
  source: {
    app: string;
    entryId?: string;
    entryType?: string;
  };
  /** The original detected text */
  detectedText: string;
  /** Optional description */
  description?: string;
}

export interface DateDetectionOptions {
  /** Reference date for relative parsing (defaults to now) */
  referenceDate?: Date;
  /** Minimum confidence threshold (0-1, defaults to 0.5) */
  minConfidence?: number;
  /** Whether to detect time-only expressions like "at 3pm" */
  detectTimeOnly?: boolean;
  /** Timezone for parsing (defaults to local) */
  timezone?: string;
  /** Maximum number of dates to detect */
  maxResults?: number;
}

export interface DateChipProps {
  /** The detected date to display */
  detectedDate: DetectedDate;
  /** Callback when chip is clicked */
  onClick?: (detectedDate: DetectedDate) => void;
  /** Whether the chip is in a loading state */
  loading?: boolean;
  /** Whether the date has been added to calendar */
  added?: boolean;
  /** Custom class name */
  className?: string;
}

export interface CalendarQuickAddProps {
  /** The detected date to create event from */
  detectedDate: DetectedDate;
  /** Context for deriving event title */
  context: {
    app: string;
    entryId?: string;
    entryType?: string;
    title?: string;
    description?: string;
  };
  /** Callback when event is created */
  onEventCreated?: (event: CalendarEventDraft) => void;
  /** Callback to close the popover */
  onClose: () => void;
  /** Anchor element for positioning */
  anchorEl?: HTMLElement | null;
}

export interface DateSuggestionsProps {
  /** Text to scan for dates */
  text: string;
  /** Context for event creation */
  context: {
    app: string;
    entryId?: string;
    entryType?: string;
    title?: string;
  };
  /** Detection options */
  options?: DateDetectionOptions;
  /** Callback when an event is added to calendar */
  onEventAdded?: (event: CalendarEventDraft) => void;
  /** Custom class name */
  className?: string;
}

export interface UseDateDetectionResult {
  /** Detected dates from the text */
  dates: DetectedDate[];
  /** Whether detection is in progress */
  loading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Re-run detection */
  refresh: () => void;
}

export interface UseCalendarActionResult {
  /** Add event to calendar */
  addToCalendar: (draft: CalendarEventDraft) => Promise<string | null>;
  /** Whether an action is in progress */
  loading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** IDs of events that were successfully added */
  addedEventIds: string[];
}
