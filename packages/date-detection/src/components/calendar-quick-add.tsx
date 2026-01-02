'use client';

import { useState } from 'react';
import { Calendar, Clock, X, Check, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import type { CalendarQuickAddProps, CalendarEventDraft } from '../types';
import { createEventDraft } from '../lib/utils';
import { useCalendarAction } from '../hooks/use-calendar-action';

type EventType = 'event' | 'task' | 'reminder';

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'event', label: 'Event' },
  { value: 'task', label: 'Task' },
  { value: 'reminder', label: 'Reminder' },
];

const durations = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
];

/**
 * A popover component for quickly adding a detected date to the calendar.
 * Pre-fills fields based on the detected date and context.
 *
 * @example
 * ```tsx
 * <CalendarQuickAdd
 *   detectedDate={selectedDate}
 *   context={{ app: 'notes', entryId: note.id, title: note.title }}
 *   onEventCreated={handleEventCreated}
 *   onClose={() => setSelectedDate(null)}
 * />
 * ```
 */
export function CalendarQuickAdd({
  detectedDate,
  context,
  onEventCreated,
  onClose,
}: CalendarQuickAddProps) {
  // Create initial draft from detected date
  const initialDraft = createEventDraft(detectedDate, context);

  const [title, setTitle] = useState(initialDraft.title);
  const [eventType, setEventType] = useState<EventType>(initialDraft.type);
  const [startDate, setStartDate] = useState(
    format(initialDraft.startTime, "yyyy-MM-dd'T'HH:mm")
  );
  const [duration, setDuration] = useState(60);
  const [allDay, setAllDay] = useState(detectedDate.isAllDay);

  const { addToCalendar, loading, error } = useCalendarAction();

  // Calculate end time based on duration
  const startDateTime = new Date(startDate);
  const endDateTime = allDay
    ? startDateTime
    : new Date(startDateTime.getTime() + duration * 60 * 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const draft: CalendarEventDraft = {
      title,
      startTime: startDateTime,
      endTime: endDateTime,
      allDay,
      type: eventType,
      source: context,
      detectedText: detectedDate.originalText,
      description: context.description,
    };

    const eventId = await addToCalendar(draft);

    if (eventId) {
      onEventCreated?.(draft);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={clsx(
          'w-full max-w-sm bg-surface-elevated border border-outline-subtle rounded-xl shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-subtle">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold text-ink-900">Add to Calendar</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-500 hover:text-ink-700 hover:bg-surface-subtle rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Detected text badge */}
          <div className="flex items-center gap-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm text-cyan-700 dark:text-cyan-300">
              Detected: &quot;{detectedDate.originalText}&quot;
            </span>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="event-title"
              className="block text-sm font-medium text-ink-700 mb-1"
            >
              Title
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
              className="w-full px-3 py-2 bg-surface-elevated border border-outline-subtle rounded-lg text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Type
            </label>
            <div className="flex gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setEventType(type.value)}
                  className={clsx(
                    'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                    eventType === type.value
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-surface-subtle text-ink-600 border-outline-subtle hover:bg-surface-hover'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date/Time */}
          <div>
            <label
              htmlFor="event-start"
              className="block text-sm font-medium text-ink-700 mb-1"
            >
              {allDay ? 'Date' : 'Date & Time'}
            </label>
            <input
              id="event-start"
              type={allDay ? 'date' : 'datetime-local'}
              value={allDay ? startDate.split('T')[0] : startDate}
              onChange={(e) =>
                setStartDate(allDay ? `${e.target.value}T00:00` : e.target.value)
              }
              className="w-full px-3 py-2 bg-surface-elevated border border-outline-subtle rounded-lg text-ink-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface-subtle rounded-full peer peer-checked:bg-cyan-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
            <span className="text-sm text-ink-600">All day</span>
          </div>

          {/* Duration (only if not all day) */}
          {!allDay && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Duration
              </label>
              <div className="flex gap-2 flex-wrap">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={clsx(
                      'px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                      duration === d.value
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-surface-subtle text-ink-600 border-outline-subtle hover:bg-surface-hover'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-ink-600 bg-surface-subtle border border-outline-subtle rounded-lg hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                loading
                  ? 'bg-cyan-400 cursor-wait'
                  : 'bg-cyan-500 hover:bg-cyan-600'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add to Calendar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
