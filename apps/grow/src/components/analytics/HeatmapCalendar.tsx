'use client';

import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, getDay } from 'date-fns';
import { Completion } from '@/types/models';
import { cn } from '@/lib/utils';

interface HeatmapCalendarProps {
  completions: Completion[];
  weeks?: number; // Number of weeks to show (default 12)
}

interface DayData {
  date: string;
  count: number;
  dayOfWeek: number;
}

export function HeatmapCalendar({ completions, weeks = 12 }: HeatmapCalendarProps) {
  const { days, maxCount, monthLabels } = useMemo(() => {
    const today = new Date();
    const endDate = today;
    const startDate = subDays(today, weeks * 7 - 1);

    // Adjust start to beginning of week
    const adjustedStart = startOfWeek(startDate, { weekStartsOn: 0 });

    const allDays = eachDayOfInterval({ start: adjustedStart, end: endDate });

    // Count completions per day
    const countMap = new Map<string, number>();
    completions.forEach((c) => {
      const current = countMap.get(c.date) || 0;
      countMap.set(c.date, current + 1);
    });

    const dayData: DayData[] = allDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: dateStr,
        count: countMap.get(dateStr) || 0,
        dayOfWeek: getDay(day),
      };
    });

    const max = Math.max(...dayData.map((d) => d.count), 1);

    // Generate month labels
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    let weekIndex = 0;

    for (let i = 0; i < dayData.length; i += 7) {
      const day = new Date(dayData[i].date);
      const month = day.getMonth();
      if (month !== lastMonth) {
        months.push({
          label: format(day, 'MMM'),
          weekIndex,
        });
        lastMonth = month;
      }
      weekIndex++;
    }

    return { days: dayData, maxCount: max, monthLabels: months };
  }, [completions, weeks]);

  // Group days into weeks (columns)
  const weekColumns = useMemo(() => {
    const columns: DayData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      columns.push(days.slice(i, i + 7));
    }
    return columns;
  }, [days]);

  // Get color intensity based on count
  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return 'bg-indigo-900/50';
    if (intensity <= 0.5) return 'bg-indigo-700/70';
    if (intensity <= 0.75) return 'bg-indigo-500';
    return 'bg-indigo-400';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Activity Heatmap</h3>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="h-[13px] text-[9px] text-white/30 flex items-center"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1 overflow-x-auto">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 relative h-4">
            {monthLabels.map((month, i) => (
              <div
                key={i}
                className="absolute text-[9px] text-white/40"
                style={{ left: `${month.weekIndex * 16}px` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weekColumns.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.map((day) => {
                  const isToday = day.date === format(new Date(), 'yyyy-MM-dd');
                  const isFuture = new Date(day.date) > new Date();

                  return (
                    <div
                      key={day.date}
                      className={cn(
                        'w-[13px] h-[13px] rounded-sm transition-all',
                        isFuture ? 'bg-transparent' : getColor(day.count),
                        isToday && 'ring-1 ring-white/50',
                        !isFuture && 'hover:ring-1 hover:ring-white/30 cursor-pointer'
                      )}
                      title={
                        isFuture
                          ? ''
                          : `${format(new Date(day.date), 'MMM d, yyyy')}: ${day.count} completion${day.count !== 1 ? 's' : ''}`
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-[9px] text-white/30">Less</span>
        <div className="flex gap-[2px]">
          <div className="w-[10px] h-[10px] rounded-sm bg-white/5" />
          <div className="w-[10px] h-[10px] rounded-sm bg-indigo-900/50" />
          <div className="w-[10px] h-[10px] rounded-sm bg-indigo-700/70" />
          <div className="w-[10px] h-[10px] rounded-sm bg-indigo-500" />
          <div className="w-[10px] h-[10px] rounded-sm bg-indigo-400" />
        </div>
        <span className="text-[9px] text-white/30">More</span>
      </div>
    </div>
  );
}
