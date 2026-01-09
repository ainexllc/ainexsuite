'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CalendarGrid } from './calendar-grid';
import { PresetButtons } from './preset-buttons';
import { TimeInput } from './time-input';
import {
  formatDisplayDate,
  getSmartPresets,
  getBasicPresets,
  addMonths,
  subMonths,
  setTime,
} from './utils';
import type { DateTimePickerProps } from './types';

export const DateTimePicker = React.forwardRef<HTMLButtonElement, DateTimePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select date and time',
      disabled = false,
      error = false,
      minDate,
      maxDate,
      presets = 'smart',
      timeFormat = '12h',
      minuteStep = 15,
      showSeconds = false,
      className,
      id,
      name,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => value || new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get presets based on mode
    const presetOptions = presets === 'smart'
      ? getSmartPresets()
      : presets === 'basic'
        ? getBasicPresets()
        : [];

    // Close on click outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
      function handleEscape(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isOpen]);

    // Update states when value changes externally
    useEffect(() => {
      if (value) {
        setSelectedDate(value);
        setCurrentMonth(value);
      }
    }, [value]);

    const handleDateSelect = useCallback((date: Date) => {
      // Preserve time from current selection or use noon as default
      const currentTime = selectedDate || value;
      let newDate = date;

      if (currentTime) {
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        newDate = setTime(date, hours, minutes);
      } else {
        // Default to noon
        newDate = setTime(date, 12, 0);
      }

      setSelectedDate(newDate);
      onChange(newDate);
    }, [selectedDate, value, onChange]);

    const handleTimeChange = useCallback((date: Date) => {
      setSelectedDate(date);
      onChange(date);
    }, [onChange]);

    const handlePresetSelect = useCallback((date: Date) => {
      // Presets set to noon by default
      const withTime = setTime(date, 12, 0);
      setSelectedDate(withTime);
      setCurrentMonth(withTime);
      onChange(withTime);
    }, [onChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedDate(null);
      onChange(null);
    }, [onChange]);

    const handlePrevMonth = useCallback(() => {
      setCurrentMonth(prev => subMonths(prev, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
      setCurrentMonth(prev => addMonths(prev, 1));
    }, []);

    const handleDone = useCallback(() => {
      setIsOpen(false);
    }, []);

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        {/* Trigger Button */}
        <button
          ref={ref}
          type="button"
          id={id}
          name={name}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={cn(
            'w-full rounded-lg border bg-surface-elevated px-4 py-2.5',
            'text-left text-sm',
            'focus:outline-none focus:ring-2',
            'transition-all duration-200',
            'flex items-center justify-between gap-2',
            error
              ? 'border-danger focus:ring-danger'
              : 'border-outline-subtle hover:border-outline-base focus:ring-primary',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'cursor-pointer'
          )}
        >
          <span className={cn(value ? 'text-ink-900' : 'text-ink-400')}>
            {value ? formatDisplayDate(value, true) : placeholder}
          </span>

          <div className="flex items-center gap-1">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
                className="p-0.5 rounded hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear date"
              >
                <X className="h-4 w-4" />
              </span>
            )}
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                'absolute left-0 top-full mt-2 z-50',
                'bg-background/95 backdrop-blur-xl rounded-xl',
                'border border-border shadow-xl',
                'origin-top-left'
              )}
              role="dialog"
              aria-label="Choose date and time"
            >
              {/* Presets */}
              {presetOptions.length > 0 && (
                <div className="px-3 pt-3 pb-2 border-b border-border">
                  <PresetButtons
                    presets={presetOptions}
                    onSelect={handlePresetSelect}
                  />
                </div>
              )}

              {/* Calendar */}
              <CalendarGrid
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onDateClick={handleDateSelect}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                minDate={minDate}
                maxDate={maxDate}
                size="md"
              />

              {/* Time Input */}
              <div className="px-3 py-3 border-t border-border">
                <TimeInput
                  value={selectedDate}
                  onChange={handleTimeChange}
                  format={timeFormat}
                  minuteStep={minuteStep}
                  showSeconds={showSeconds}
                  disabled={!selectedDate}
                />
              </div>

              {/* Done button */}
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={handleDone}
                  className={cn(
                    'w-full py-2 text-sm font-medium rounded-lg transition-colors',
                    'bg-[var(--color-primary)] text-white',
                    'hover:bg-[var(--color-primary)]/90'
                  )}
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';
