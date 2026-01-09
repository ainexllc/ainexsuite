'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CalendarGrid } from './calendar-grid';
import { PresetButtons } from './preset-buttons';
import {
  formatDisplayDate,
  getSmartPresets,
  getBasicPresets,
  addMonths,
  subMonths,
} from './utils';
import type { DatePickerProps } from './types';

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select date',
      disabled = false,
      error = false,
      minDate,
      maxDate,
      presets = 'smart',
      className,
      id,
      name,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => value || new Date());
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

    // Update current month when value changes
    useEffect(() => {
      if (value) {
        setCurrentMonth(value);
      }
    }, [value]);

    const handleDateSelect = useCallback((date: Date) => {
      onChange(date);
      setIsOpen(false);
    }, [onChange]);

    const handlePresetSelect = useCallback((date: Date) => {
      onChange(date);
      setCurrentMonth(date);
      setIsOpen(false);
    }, [onChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    }, [onChange]);

    const handlePrevMonth = useCallback(() => {
      setCurrentMonth(prev => subMonths(prev, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
      setCurrentMonth(prev => addMonths(prev, 1));
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
            {value ? formatDisplayDate(value) : placeholder}
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
              aria-label="Choose date"
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
                selectedDate={value}
                onDateClick={handleDateSelect}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                minDate={minDate}
                maxDate={maxDate}
                size="md"
              />

              {/* Today button */}
              <div className="px-3 pb-3 pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={() => handleDateSelect(new Date())}
                  className={cn(
                    'w-full py-1.5 text-xs font-medium rounded-lg transition-colors',
                    'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                  )}
                >
                  Today
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
