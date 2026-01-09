'use client';

import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Calendar, Clock, MapPin, Palette, Trash2, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { format, addHours, setHours, setMinutes } from 'date-fns';
import { DatePicker } from '@ainexsuite/ui';
import { CalendarEvent, CreateEventInput } from '@/types/event';
import { useSpaces } from '@/components/providers/spaces-provider';

const EVENT_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f97316', label: 'Orange' },
];

export interface EventComposerRef {
  editEvent: (event: CalendarEvent) => void;
  createEvent: (initialDate?: Date) => void;
  duplicateEvent: (event: CalendarEvent) => void;
  close: () => void;
}

interface EventComposerProps {
  onSave: (event: CreateEventInput, eventId?: string) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  onDuplicate?: (event: CalendarEvent) => void;
  placeholder?: string;
}

export const EventComposer = forwardRef<EventComposerRef, EventComposerProps>(
  function EventComposer({ onSave, onDelete, onDuplicate, placeholder = 'Add a new event...' }, ref) {
    const { currentSpaceId } = useSpaces();
    const [expanded, setExpanded] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState(() => {
      const now = new Date();
      const rounded = setMinutes(setHours(now, now.getHours() + 1), 0);
      return format(rounded, 'HH:mm');
    });
    const [endTime, setEndTime] = useState(() => {
      const now = new Date();
      const rounded = setMinutes(setHours(now, now.getHours() + 2), 0);
      return format(rounded, 'HH:mm');
    });
    const [location, setLocation] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [allDay, setAllDay] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Derived state for multi-day detection
    const isMultiDay = startDate !== endDate;

    const composerRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const isEditing = editingEventId !== null;
    const hasContent = title.trim() || description.trim() || location.trim();

    const resetState = useCallback(() => {
      setExpanded(false);
      setEditingEventId(null);
      setEditingEvent(null);
      setTitle('');
      setDescription('');
      setLocation('');
      setColor('#3b82f6');
      setAllDay(false);
      setShowColorPicker(false);
      setShowDeleteConfirm(false);
      const now = new Date();
      setStartDate(format(now, 'yyyy-MM-dd'));
      setEndDate(format(now, 'yyyy-MM-dd'));
      const rounded = setMinutes(setHours(now, now.getHours() + 1), 0);
      setStartTime(format(rounded, 'HH:mm'));
      setEndTime(format(addHours(rounded, 1), 'HH:mm'));
    }, []);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      editEvent: (event: CalendarEvent) => {
        const eventStartDate = event.startTime.toDate();
        const eventEndDate = event.endTime.toDate();

        setEditingEventId(event.id);
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description || '');
        setStartDate(format(eventStartDate, 'yyyy-MM-dd'));
        setEndDate(format(eventEndDate, 'yyyy-MM-dd'));
        setStartTime(format(eventStartDate, 'HH:mm'));
        setEndTime(format(eventEndDate, 'HH:mm'));
        setLocation(event.location || '');
        setColor(event.color || '#3b82f6');
        setAllDay(event.allDay || false);
        setExpanded(true);
        setShowDeleteConfirm(false);

        requestAnimationFrame(() => titleInputRef.current?.focus());
      },
      createEvent: (initialDate?: Date) => {
        resetState();
        if (initialDate) {
          setStartDate(format(initialDate, 'yyyy-MM-dd'));
          setEndDate(format(initialDate, 'yyyy-MM-dd'));
          setStartTime(format(initialDate, 'HH:mm'));
          setEndTime(format(addHours(initialDate, 1), 'HH:mm'));
        }
        setExpanded(true);
        requestAnimationFrame(() => titleInputRef.current?.focus());
      },
      duplicateEvent: (event: CalendarEvent) => {
        // Copy all event data but don't set an editing ID (creates new event)
        const eventStartDate = event.startTime.toDate();
        const eventEndDate = event.endTime.toDate();

        setEditingEventId(null);
        setEditingEvent(null);
        setTitle(`${event.title} (Copy)`);
        setDescription(event.description || '');
        setStartDate(format(eventStartDate, 'yyyy-MM-dd'));
        setEndDate(format(eventEndDate, 'yyyy-MM-dd'));
        setStartTime(format(eventStartDate, 'HH:mm'));
        setEndTime(format(eventEndDate, 'HH:mm'));
        setLocation(event.location || '');
        setColor(event.color || '#3b82f6');
        setAllDay(event.allDay || false);
        setExpanded(true);
        setShowDeleteConfirm(false);

        requestAnimationFrame(() => titleInputRef.current?.focus());
      },
      close: () => {
        resetState();
      }
    }), [resetState]);

    const handleSubmit = useCallback(async () => {
      if (!title.trim()) return;

      setIsSubmitting(true);
      try {
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

        let startDateTime: Date;
        let endDateTime: Date;

        if (allDay) {
          // For all-day events, use noon local time to avoid timezone date boundary issues
          startDateTime = new Date(startYear, startMonth - 1, startDay, 12, 0, 0, 0);
          endDateTime = new Date(endYear, endMonth - 1, endDay, 12, 0, 0, 0);
        } else {
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);

          startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute, 0, 0);
          endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute, 0, 0);

          // If same day and end time is before start time, assume it's the next day
          if (startDate === endDate && endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
          }
        }

        await onSave({
          title: title.trim(),
          description: description.trim(),
          startTime: startDateTime,
          endTime: endDateTime,
          allDay,
          color,
          location: location.trim(),
          type: 'event',
          spaceId: currentSpaceId,
        }, editingEventId || undefined);

        resetState();
      } catch (error) {
        console.error('Failed to save event:', error);
      } finally {
        setIsSubmitting(false);
      }
    }, [title, description, startDate, endDate, startTime, endTime, allDay, color, location, onSave, resetState, editingEventId, currentSpaceId]);

    const handleDuplicate = useCallback(() => {
      if (!editingEvent || !onDuplicate) return;
      onDuplicate(editingEvent);
    }, [editingEvent, onDuplicate]);

    const handleDelete = useCallback(async () => {
      if (!editingEventId || !onDelete) return;

      setIsSubmitting(true);
      try {
        await onDelete(editingEventId);
        resetState();
      } catch (error) {
        console.error('Failed to delete event:', error);
      } finally {
        setIsSubmitting(false);
        setShowDeleteConfirm(false);
      }
    }, [editingEventId, onDelete, resetState]);

    // Click outside to submit or collapse
    useEffect(() => {
      if (!expanded) return;

      const handlePointerDown = (event: PointerEvent) => {
        if (!composerRef.current) return;
        if (composerRef.current.contains(event.target as Node)) return;
        if (isSubmitting) return;

        if (hasContent && title.trim()) {
          void handleSubmit();
        } else {
          resetState();
        }
      };

      document.addEventListener('pointerdown', handlePointerDown);
      return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [expanded, hasContent, handleSubmit, resetState, isSubmitting, title]);

    return (
      <section className="w-full">
        {!expanded ? (
          <div className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm transition hover:bg-white/10 hover:border-white/20 backdrop-blur-sm">
            <button
              type="button"
              className="flex-1 min-w-0 flex items-center text-left text-sm text-white/50 focus-visible:outline-none"
              onClick={() => {
                setExpanded(true);
                requestAnimationFrame(() => titleInputRef.current?.focus());
              }}
            >
              <Calendar className="h-4 w-4 mr-3 text-white/40" />
              <span>{placeholder}</span>
            </button>
          </div>
        ) : (
          <div
            ref={composerRef}
            className="w-full rounded-2xl shadow-xl bg-[#121212] border border-white/10 backdrop-blur-xl transition-all"
          >
            <div className="flex flex-col gap-3 px-5 py-4">
              {/* Title */}
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                className="w-full bg-transparent text-lg font-semibold text-white placeholder:text-white/30 focus:outline-none"
                autoFocus
              />

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none leading-relaxed"
              />

              {/* Date & Time Row */}
              <div className="flex flex-col gap-2">
                {/* Start Date/Time */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-white/40 w-10">Start</span>
                  <div className="w-44">
                    <DatePicker
                      value={startDate ? new Date(startDate) : null}
                      onChange={(date) => {
                        const newDate = date ? format(date, 'yyyy-MM-dd') : '';
                        setStartDate(newDate);
                        // Auto-adjust end date if it's before start date
                        if (newDate > endDate) {
                          setEndDate(newDate);
                        }
                      }}
                      placeholder="Start date"
                      presets="smart"
                    />
                  </div>

                  {!allDay && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/40" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  )}
                </div>

                {/* End Date/Time */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-white/40 w-10">End</span>
                  <div className="w-44">
                    <DatePicker
                      value={endDate ? new Date(endDate) : null}
                      onChange={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                      placeholder="End date"
                      minDate={startDate ? new Date(startDate) : undefined}
                      presets="none"
                    />
                  </div>

                  {!allDay && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/40" />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  )}
                </div>

                {/* Options Row */}
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allDay}
                      onChange={(e) => setAllDay(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    All day
                  </label>
                  {isMultiDay && (
                    <span className="text-xs text-accent-400">
                      Multi-day event
                    </span>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/40" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-1">
                  {/* Color Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className={clsx(
                        'p-2 rounded-full transition-colors',
                        showColorPicker
                          ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'text-white/40 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <Palette className="h-4 w-4" />
                    </button>

                    {showColorPicker && (
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl flex gap-1.5 z-10">
                        {EVENT_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => {
                              setColor(c.value);
                              setShowColorPicker(false);
                            }}
                            className={clsx(
                              'w-6 h-6 rounded-full transition-transform hover:scale-110',
                              color === c.value && 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]'
                            )}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duplicate button (only when editing) */}
                  {isEditing && onDuplicate && (
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      disabled={isSubmitting}
                      className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      title="Duplicate event"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}

                  {/* Delete button (only when editing) */}
                  {isEditing && onDelete && (
                    <div className="relative">
                      {showDeleteConfirm ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-2 py-1 text-xs text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-2 rounded-full text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetState}
                    className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!title.trim() || isSubmitting}
                    className={clsx(
                      'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      title.trim() && !isSubmitting
                        ? 'bg-[var(--color-primary)] text-white hover:opacity-90'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    )}
                  >
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
);
