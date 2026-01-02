'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import type { DateSuggestionsProps, DetectedDate, CalendarEventDraft } from '../types';
import { useDateDetection } from '../hooks/use-date-detection';
import { useCalendarAction } from '../hooks/use-calendar-action';
import { DateChip } from './date-chip';
import { CalendarQuickAdd } from './calendar-quick-add';

/**
 * Container component that scans text for dates and displays
 * inline suggestion chips for adding them to the calendar.
 *
 * @example
 * ```tsx
 * <DateSuggestions
 *   text={noteContent}
 *   context={{ app: 'notes', entryId: note.id, title: note.title }}
 *   onEventAdded={handleEventAdded}
 * />
 * ```
 */
export function DateSuggestions({
  text,
  context,
  options,
  onEventAdded,
  className,
}: DateSuggestionsProps) {
  const { dates } = useDateDetection(text, {
    debounceMs: 300,
    ...options,
  });
  const { addToCalendar, addedEventIds } = useCalendarAction();

  const [selectedDate, setSelectedDate] = useState<DetectedDate | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  // handleQuickAdd - used for quick adding dates without popover
  // Currently using explicit add through popover, but keeping for future use
  void async function handleQuickAdd(detectedDate: DetectedDate) {
    setAddingId(detectedDate.id);

    const draft: CalendarEventDraft = {
      title: context.title || detectedDate.originalText,
      startTime: detectedDate.parsedDate,
      endTime: detectedDate.endDate || new Date(detectedDate.parsedDate.getTime() + 60 * 60 * 1000),
      allDay: detectedDate.isAllDay,
      type: 'event',
      source: context,
      detectedText: detectedDate.originalText,
    };

    const eventId = await addToCalendar(draft);

    if (eventId) {
      onEventAdded?.(draft);
    }

    setAddingId(null);
  };

  // Open popover for customization
  const handleChipClick = (detectedDate: DetectedDate) => {
    setSelectedDate(detectedDate);
  };

  const handleEventCreated = (draft: CalendarEventDraft) => {
    onEventAdded?.(draft);
    setSelectedDate(null);
  };

  // Don't render if no dates detected
  if (dates.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={clsx(
          'flex items-center gap-2 flex-wrap',
          className
        )}
      >
        <span className="text-xs text-ink-500 mr-1">Add to calendar:</span>
        {dates.map((date) => (
          <DateChip
            key={date.id}
            detectedDate={date}
            onClick={handleChipClick}
            loading={addingId === date.id}
            added={addedEventIds.some((id) => id.includes(date.id))}
          />
        ))}
      </div>

      {/* Calendar Quick Add Popover */}
      {selectedDate && (
        <CalendarQuickAdd
          detectedDate={selectedDate}
          context={context}
          onEventCreated={handleEventCreated}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}

/**
 * Simpler version that just shows chips without the popover.
 * For cases where you want minimal UI.
 */
export function DateChips({
  text,
  onDateClick,
  options,
  className,
}: {
  text: string;
  onDateClick?: (date: DetectedDate) => void;
  options?: DateSuggestionsProps['options'];
  className?: string;
}) {
  const { dates } = useDateDetection(text, {
    debounceMs: 300,
    ...options,
  });

  if (dates.length === 0) {
    return null;
  }

  return (
    <div className={clsx('flex items-center gap-2 flex-wrap', className)}>
      {dates.map((date) => (
        <DateChip
          key={date.id}
          detectedDate={date}
          onClick={onDateClick}
        />
      ))}
    </div>
  );
}
