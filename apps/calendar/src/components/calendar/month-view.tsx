'use client';

import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  format 
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/event';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => Promise<void>;
}

export function MonthView({ 
  currentDate, 
  events, 
  onDayClick, 
  onEventClick,
  onEventDrop
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = event.startTime.toDate();
      return isSameDay(eventDate, day);
    });
  };

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(event));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data || !onEventDrop) return;

    try {
      const event = JSON.parse(data) as CalendarEvent;
      // Rehydrate timestamps since JSON.parse turns them into strings/objects
      // We need the original event object or enough data to reconstruct it.
      // However, the parent component will have the real event list.
      // We'll pass the parsed object, but we need to be careful about the timestamp methods.
      // Actually, simpler: we just need the ID to find the real event in the parent, 
      // OR we assume the parent will fetch the fresh event.
      
      // Let's convert the stringified timestamps back to objects that look enough like Firestore timestamps 
      // for the logic to work, or better yet, let the parent handle the finding.
      // But `event` is used in the signature. 
      
      // Best approach: The dropped data contains the ID. We find the full event from our `events` prop.
      const realEvent = events.find(e => e.id === event.id);
      if (realEvent) {
        await onEventDrop(realEvent, day);
      }
    } catch (err) {
      console.error("Failed to parse dropped event", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-elevated/5 rounded-xl border border-border overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-elevated/10">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toString()}
              onClick={() => onDayClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={cn(
                "min-h-[100px] p-2 border-b border-r border-border transition-colors hover:bg-foreground/5 flex flex-col gap-1",
                !isCurrentMonth && "bg-background/20 text-muted-foreground/60",
                isCurrentMonth && "bg-transparent text-foreground",
                // Remove right border for last column
                (dayIdx + 1) % 7 === 0 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full pointer-events-none",
                    isDayToday && "bg-accent-500 text-foreground",
                    !isDayToday && "text-inherit"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto scrollbar-none">
                {dayEvents.map((event) => {
                  const eventTypeStyles = {
                    event: "bg-accent-500/20 text-accent-200 border-accent-500/30 hover:bg-accent-500/30",
                    task: "bg-surface-success/20 text-success border-surface-success/30 hover:bg-surface-success/30",
                    reminder: "bg-surface-warning/20 text-warning border-surface-warning/30 hover:bg-surface-warning/30",
                    holiday: "bg-surface-error/20 text-error border-surface-error/30 hover:bg-surface-error/30"
                  };

                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded truncate cursor-pointer transition-all border active:opacity-50",
                        eventTypeStyles[event.type] || eventTypeStyles.event
                      )}
                      title={event.title}
                    >
                      {event.allDay ? '' : format(event.startTime.toDate(), 'h:mm a ')}
                      <span className="font-medium">{event.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
