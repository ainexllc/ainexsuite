'use client';

import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-white min-w-[200px]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1 bg-surface-elevated rounded-lg p-1 border border-white/10">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="h-8 w-[1px] bg-white/10 mx-2" />

      <div className="flex items-center gap-1 bg-surface-elevated rounded-lg p-1 border border-white/10">
        <button
          onClick={() => onViewChange('month')}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            view === 'month' ? "bg-accent-500 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Month</span>
        </button>
        <button
          onClick={() => onViewChange('week')}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            view === 'week' ? "bg-accent-500 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Week</span>
        </button>
        <button
          onClick={() => onViewChange('day')}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            view === 'day' ? "bg-accent-500 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          <List className="w-4 h-4" />
          <span>Day</span>
        </button>
        <button
          onClick={() => onViewChange('agenda')}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            view === 'agenda' ? "bg-accent-500 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
          )}
        >
          <List className="w-4 h-4" />
          <span>Agenda</span>
        </button>
      </div>
    </div>
  );
}
