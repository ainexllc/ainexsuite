"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Sun,
  CalendarDays,
} from "lucide-react";
import { clsx } from "clsx";

// =============================================================================
// Date Helper Functions
// =============================================================================

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isToday(date: Date): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return today.getTime() === target.getTime();
}

function isTomorrow(date: Date): boolean {
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = startOfDay(date);
  return tomorrow.getTime() === target.getTime();
}

function isPast(date: Date): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return target.getTime() < today.getTime();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(dateString: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString + "T00:00:00");
  return isNaN(date.getTime()) ? null : date;
}

// =============================================================================
// Constants
// =============================================================================

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// =============================================================================
// Types
// =============================================================================

interface ChecklistDueDatePickerProps {
  value: string | null | undefined;
  onChange: (date: string | null) => void;
  className?: string;
}

type DateStatus = "overdue" | "today" | "future" | "none";

// =============================================================================
// Component
// =============================================================================

export function ChecklistDueDatePicker({
  value,
  onChange,
  className,
}: ChecklistDueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse the current value
  const currentDate = value ? parseISODate(value) : null;

  // Determine date status for styling
  const getDateStatus = useCallback((date: Date | null): DateStatus => {
    if (!date) return "none";
    if (isPast(date) && !isToday(date)) return "overdue";
    if (isToday(date)) return "today";
    return "future";
  }, []);

  const dateStatus = getDateStatus(currentDate);

  // Format the display text
  const getDisplayText = useCallback((date: Date | null): string => {
    if (!date) return "";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return formatShortDate(date);
  }, []);

  const displayText = getDisplayText(currentDate);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowCalendar(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectDate = (date: Date | null) => {
    onChange(date ? toISODateString(date) : null);
    setIsOpen(false);
    setShowCalendar(false);
  };

  const handleQuickSelect = (days: number) => {
    const date = startOfDay(addDays(new Date(), days));
    handleSelectDate(date);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
    setShowCalendar(false);
  };

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (isOpen) {
      setShowCalendar(false);
    }
  };

  // Style classes based on date status
  const statusStyles: Record<DateStatus, string> = {
    overdue:
      "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    today:
      "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
    future:
      "bg-white/10 text-white/70 border-white/20 hover:bg-white/15 hover:text-white",
    none: "bg-transparent text-white/40 border-transparent hover:bg-white/10 hover:text-white/60",
  };

  return (
    <div ref={containerRef} className={clsx("relative inline-block", className)}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={togglePopover}
        className={clsx(
          "flex items-center gap-1 px-1.5 h-5 rounded-md text-xs font-medium border transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50",
          statusStyles[dateStatus]
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={currentDate ? `Due date: ${displayText}` : "Add due date"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {dateStatus === "overdue" ? (
          <AlertCircle className="h-3 w-3" />
        ) : (
          <Calendar className="h-3 w-3" />
        )}
        {currentDate ? (
          <>
            <span>{displayText}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
              className="ml-0.5 p-0.5 rounded hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Clear due date"
            >
              <X className="h-2.5 w-2.5" />
            </span>
          </>
        ) : null}
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 right-0 top-full mt-1"
            role="dialog"
            aria-label="Select due date"
          >
            {!showCalendar ? (
              <QuickPresets
                onSelectPreset={handleQuickSelect}
                onShowCalendar={() => setShowCalendar(true)}
                onClear={handleClear}
                hasValue={!!currentDate}
              />
            ) : (
              <CalendarPicker
                value={currentDate}
                onChange={handleSelectDate}
                onBack={() => setShowCalendar(false)}
                onClose={() => {
                  setIsOpen(false);
                  setShowCalendar(false);
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Quick Presets Component
// =============================================================================

interface QuickPresetsProps {
  onSelectPreset: (days: number) => void;
  onShowCalendar: () => void;
  onClear: (e: React.MouseEvent) => void;
  hasValue: boolean;
}

function QuickPresets({
  onSelectPreset,
  onShowCalendar,
  onClear,
  hasValue,
}: QuickPresetsProps) {
  const presets = [
    { label: "Today", days: 0, icon: Clock },
    { label: "Tomorrow", days: 1, icon: Sun },
    { label: "Next Week", days: 7, icon: CalendarDays },
  ];

  return (
    <div className="rounded-lg bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden w-[160px]">
      <div className="p-1">
        {presets.map(({ label, days, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelectPreset(days)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors text-left"
          >
            <Icon className="h-4 w-4 text-white/50" />
            {label}
          </button>
        ))}

        <div className="border-t border-white/10 my-1" />

        <button
          type="button"
          onClick={onShowCalendar}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors text-left"
        >
          <Calendar className="h-4 w-4 text-white/50" />
          Pick date
        </button>

        {hasValue && (
          <>
            <div className="border-t border-white/10 my-1" />
            <button
              type="button"
              onClick={onClear}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors text-left"
            >
              <X className="h-4 w-4" />
              Remove date
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Calendar Picker Component
// =============================================================================

interface CalendarPickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onBack: () => void;
  onClose: () => void;
}

function CalendarPicker({
  value,
  onChange,
  onBack,
  onClose,
}: CalendarPickerProps) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [year, month]);

  const goToPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const selectDate = (date: Date) => {
    onChange(date);
  };

  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const isTodayDate = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date): boolean => {
    return date.getTime() < today.getTime();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-lg bg-zinc-900 border border-white/10 shadow-2xl p-3 w-[240px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Back to presets"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <span className="text-xs font-medium text-white min-w-[100px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition"
            aria-label="Next month"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] text-white/40 font-medium py-0.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                type="button"
                onClick={() => selectDate(date)}
                className={clsx(
                  "w-full h-full rounded text-xs font-medium transition flex items-center justify-center",
                  isSelected(date)
                    ? "bg-[var(--color-primary)] text-white"
                    : isTodayDate(date)
                      ? "bg-white/10 text-white ring-1 ring-[var(--color-primary)]/50"
                      : isPastDate(date)
                        ? "text-white/30 hover:bg-white/5"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {date.getDate()}
              </button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>

      {/* Quick today button */}
      <div className="mt-2 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => onChange(today)}
          className="w-full text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition text-center py-1"
        >
          Today
        </button>
      </div>
    </motion.div>
  );
}
