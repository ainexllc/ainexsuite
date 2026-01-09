'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CalendarGrid } from './calendar-grid';
import { RangePresetButtons } from './preset-buttons';
import {
  formatDisplayRange,
  getSmartRangePresets,
  addMonths,
  subMonths,
} from './utils';
import type { DateRangePickerProps, DateRange } from './types';

export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (
    {
      value = { start: null, end: null },
      onChange,
      placeholder = 'Select date range',
      disabled = false,
      error = false,
      minDate,
      maxDate,
      presets = 'smart',
      numberOfMonths = 2,
      className,
      id,
      name,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => value.start || new Date());
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [selectingEnd, setSelectingEnd] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get presets
    const presetOptions = presets === 'smart' ? getSmartRangePresets() : [];

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
      if (value.start) {
        setCurrentMonth(value.start);
      }
    }, [value.start]);

    const handleDateClick = useCallback((date: Date) => {
      if (!selectingEnd || !value.start) {
        // Selecting start date
        onChange({ start: date, end: null });
        setSelectingEnd(true);
      } else {
        // Selecting end date
        if (date < value.start) {
          // If clicked date is before start, swap them
          onChange({ start: date, end: value.start });
        } else {
          onChange({ start: value.start, end: date });
        }
        setSelectingEnd(false);
        setHoverDate(null);
      }
    }, [selectingEnd, value.start, onChange]);

    const handlePresetSelect = useCallback((range: DateRange) => {
      onChange(range);
      if (range.start) {
        setCurrentMonth(range.start);
      }
      setSelectingEnd(false);
      setIsOpen(false);
    }, [onChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onChange({ start: null, end: null });
      setSelectingEnd(false);
    }, [onChange]);

    const handlePrevMonth = useCallback(() => {
      setCurrentMonth(prev => subMonths(prev, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
      setCurrentMonth(prev => addMonths(prev, 1));
    }, []);

    const handleDateHover = useCallback((date: Date | null) => {
      if (selectingEnd && value.start) {
        setHoverDate(date);
      }
    }, [selectingEnd, value.start]);

    const handleDone = useCallback(() => {
      setIsOpen(false);
      setSelectingEnd(false);
    }, []);

    // Calculate second month for dual calendar view
    const secondMonth = addMonths(currentMonth, 1);

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
          <span className={cn(
            (value.start || value.end) ? 'text-ink-900' : 'text-ink-400',
            'flex items-center gap-2'
          )}>
            {value.start || value.end ? (
              <>
                {formatDisplayRange(value)}
              </>
            ) : (
              placeholder
            )}
          </span>

          <div className="flex items-center gap-1">
            {(value.start || value.end) && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
                className="p-0.5 rounded hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear dates"
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
                'origin-top-left',
                numberOfMonths === 2 ? 'min-w-[580px]' : 'min-w-[280px]'
              )}
              role="dialog"
              aria-label="Choose date range"
            >
              <div className="flex">
                {/* Presets sidebar */}
                {presetOptions.length > 0 && (
                  <div className="w-40 p-3 border-r border-border">
                    <RangePresetButtons
                      presets={presetOptions}
                      onSelect={handlePresetSelect}
                    />
                  </div>
                )}

                {/* Calendars */}
                <div className="flex-1">
                  {/* Selection hint */}
                  <div className="px-3 pt-3 pb-2 text-center">
                    <span className="text-xs text-muted-foreground">
                      {selectingEnd && value.start
                        ? 'Select end date'
                        : 'Select start date'}
                    </span>
                  </div>

                  <div className={cn(
                    'flex',
                    numberOfMonths === 2 ? 'gap-2' : ''
                  )}>
                    {/* First calendar */}
                    <CalendarGrid
                      currentMonth={currentMonth}
                      selectedRange={value}
                      hoverDate={hoverDate}
                      onDateClick={handleDateClick}
                      onDateHover={handleDateHover}
                      onPrevMonth={handlePrevMonth}
                      onNextMonth={numberOfMonths === 1 ? handleNextMonth : () => {}}
                      minDate={minDate}
                      maxDate={maxDate}
                      isRangeMode={true}
                      showNavigation={true}
                      size="sm"
                    />

                    {/* Second calendar (for dual view) */}
                    {numberOfMonths === 2 && (
                      <CalendarGrid
                        currentMonth={secondMonth}
                        selectedRange={value}
                        hoverDate={hoverDate}
                        onDateClick={handleDateClick}
                        onDateHover={handleDateHover}
                        onPrevMonth={() => {}}
                        onNextMonth={handleNextMonth}
                        minDate={minDate}
                        maxDate={maxDate}
                        isRangeMode={true}
                        showNavigation={true}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-3 pb-3 pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {value.start && value.end
                        ? formatDisplayRange(value)
                        : value.start
                          ? 'Select end date...'
                          : 'Select dates'}
                    </span>
                    <button
                      type="button"
                      onClick={handleDone}
                      disabled={!value.start || !value.end}
                      className={cn(
                        'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        value.start && value.end
                          ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90'
                          : 'bg-foreground/10 text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

DateRangePicker.displayName = 'DateRangePicker';
