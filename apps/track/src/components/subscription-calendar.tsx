"use client";

import { useSubscriptions } from "@/components/providers/subscription-provider";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export function SubscriptionCalendar() {
  const { subscriptions } = useSubscriptions();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Helper to find subscriptions on a given day
  // Note: This logic assumes simple monthly/yearly cycles for display. 
  // Ideally we'd calculate recurrence properly, but for prototype we match nextPaymentDate.
  // Actually, we should probably project dates if nextPaymentDate is in future?
  // For now, let's just show subscriptions that have nextPaymentDate in this month.
  const getSubsForDay = (day: Date) => {
    return subscriptions.filter(sub => isSameDay(new Date(sub.nextPaymentDate), day));
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-lg text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day, dayIdx) => {
          const subs = getSubsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toString()} 
              className={clsx(
                "min-h-[100px] border-b border-r border-zinc-100 dark:border-zinc-800 p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                dayIdx % 7 === 6 && "border-r-0", // Remove right border for last col
                !isSameMonth(day, currentMonth) && "bg-zinc-50/50 dark:bg-zinc-900/50 text-muted-foreground/50"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={clsx(
                  "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-emerald-500 text-white" : "text-zinc-700 dark:text-zinc-300"
                )}>
                  {format(day, 'd')}
                </span>
                {subs.length > 0 && (
                   <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                     ${subs.reduce((acc, s) => acc + s.cost, 0).toFixed(0)}
                   </span>
                )}
              </div>
              
              <div className="space-y-1">
                {subs.map(sub => (
                  <div 
                    key={sub.id} 
                    className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs truncate"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate font-medium">{sub.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
