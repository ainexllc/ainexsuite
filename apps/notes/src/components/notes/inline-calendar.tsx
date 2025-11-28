"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { clsx } from "clsx";

interface InlineCalendarProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onClose: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function InlineCalendar({ value, onChange, onClose }: InlineCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const clearDate = () => {
    onChange(null);
    onClose();
  };

  const selectToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    onChange(now);
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="rounded-xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-4 w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-white">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-white/40 font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                type="button"
                onClick={() => selectDate(date)}
                className={clsx(
                  "w-full h-full rounded-lg text-sm font-medium transition flex items-center justify-center",
                  isSelected(date)
                    ? "bg-blue-500 text-white"
                    : isToday(date)
                    ? "bg-white/10 text-white ring-1 ring-blue-500/50"
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

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={selectToday}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
        >
          Today
        </button>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={clearDate}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white/70 transition"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/70 hover:text-white font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
