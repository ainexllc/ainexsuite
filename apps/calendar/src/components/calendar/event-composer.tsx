'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import { format, addHours, setHours, setMinutes } from 'date-fns';
import { CreateEventInput } from '@/types/event';

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

interface EventComposerProps {
  onSave: (event: CreateEventInput) => Promise<void>;
}

export function EventComposer({ onSave }: EventComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
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

  const composerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const hasContent = title.trim() || description.trim() || location.trim();

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setColor('#3b82f6');
    setAllDay(false);
    setShowColorPicker(false);
    const now = new Date();
    setDate(format(now, 'yyyy-MM-dd'));
    const rounded = setMinutes(setHours(now, now.getHours() + 1), 0);
    setStartTime(format(rounded, 'HH:mm'));
    setEndTime(format(addHours(rounded, 1), 'HH:mm'));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const [year, month, day] = date.split('-').map(Number);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
      const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

      // If end time is before start time, assume it's the next day
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
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
      });

      resetState();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, date, startTime, endTime, allDay, color, location, onSave, resetState]);

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
        <button
          type="button"
          className="flex w-full items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-white/50 shadow-sm transition hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] backdrop-blur-sm"
          onClick={() => {
            setExpanded(true);
            requestAnimationFrame(() => titleInputRef.current?.focus());
          }}
        >
          <Calendar className="h-4 w-4 mr-3 text-white/40" />
          <span>Add a new event...</span>
        </button>
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
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/40" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
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
                  <span className="text-white/40">-</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                All day
              </label>
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
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
