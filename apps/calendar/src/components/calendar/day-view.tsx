'use client';

import {
  format,
  setHours,
  setMinutes,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/event';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick
}: DayViewProps) {
  // Generate time slots (00:00 to 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Helper to check if an event spans multiple days
  const isMultiDayEvent = (event: CalendarEvent): boolean => {
    const start = event.startTime.toDate();
    const end = event.endTime.toDate();
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return startDay.getTime() !== endDay.getTime();
  };

  // Get all-day and multi-day events for this day
  const getAllDayEvents = () => {
    const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    return events.filter(event => {
      if (!event.allDay && !isMultiDayEvent(event)) return false;

      const eventStart = event.startTime.toDate();
      const eventEnd = event.endTime.toDate();

      // Check if current day falls within event range
      return isSameDay(dayStart, eventStart) ||
             isSameDay(dayStart, eventEnd) ||
             isWithinInterval(dayStart, { start: eventStart, end: eventEnd });
    });
  };

  // Get timed events (non-all-day, single-day events)
  const getTimedEventsForDay = () => {
    return events.filter(event => {
      if (event.allDay || isMultiDayEvent(event)) return false;
      return isSameDay(event.startTime.toDate(), currentDate);
    });
  };

  const allDayEvents = getAllDayEvents();
  const timedEvents = getTimedEventsForDay();

  // Calculate position and height for an event within the day column
  const getEventStyle = (event: CalendarEvent) => {
    const start = event.startTime.toDate();
    const end = event.endTime.toDate();
    
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();

    // Top position (pixels) - assuming 60px per hour
    const top = (startHour * 60) + startMin;
    
    // Duration in minutes
    let duration = ((endHour * 60) + endMin) - ((startHour * 60) + startMin);
    // Minimum height of 25px for visibility
    if (duration < 25) duration = 25;

    return {
      top: `${top}px`,
      height: `${duration}px`,
    };
  };

  const eventTypeStyles: Record<string, string> = {
    event: "bg-accent-500/20 text-accent-200 border-accent-500/30 hover:bg-accent-500/30",
    task: "bg-surface-success/20 text-success border-surface-success/30 hover:bg-surface-success/30",
    reminder: "bg-surface-warning/20 text-warning border-surface-warning/30 hover:bg-surface-warning/30",
    holiday: "bg-surface-error/20 text-error border-surface-error/30 hover:bg-surface-error/30"
  };

  return (
    <div className="flex flex-col h-full bg-surface-elevated/5 rounded-xl border border-border overflow-hidden">
      {/* Header Row */}
      <div className="flex border-b border-border bg-surface-elevated/10 py-4 px-6 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {format(currentDate, 'EEEE')}
          </div>
          <div className="text-3xl font-bold text-accent-500 mt-1">
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* All-day / Multi-day Events Section */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-border bg-surface-elevated/5 px-6 py-2">
          <div className="w-20 flex-shrink-0 flex items-center">
            <span className="text-xs text-muted-foreground/60">All day</span>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {allDayEvents.map((event) => {
              const eventColor = event.color || '#3b82f6';
              const isMulti = isMultiDayEvent(event);

              return (
                <div
                  key={`allday-${event.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="px-3 py-1.5 text-sm rounded cursor-pointer transition-all text-white font-medium hover:opacity-90"
                  style={{ backgroundColor: eventColor }}
                  title={isMulti
                    ? `${event.title} (${format(event.startTime.toDate(), 'MMM d')} - ${format(event.endTime.toDate(), 'MMM d')})`
                    : event.title
                  }
                >
                  {event.title}
                  {isMulti && (
                    <span className="opacity-70 ml-2 text-xs">
                      ({format(event.startTime.toDate(), 'MMM d')} - {format(event.endTime.toDate(), 'MMM d')})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin relative">
        <div className="flex min-h-[1440px]"> {/* 24 hours * 60px */}

          {/* Time Axis */}
          <div className="w-20 border-r border-border flex-shrink-0 bg-surface-elevated/5">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-3 text-xs text-muted-foreground/80 font-medium">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
                {/* Small tick mark */}
                <div className="absolute top-0 right-0 w-2 h-[1px] bg-border"></div>
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div className="flex-1 relative bg-surface-base/20">
            {/* Horizontal Hour Lines */}
            {hours.map((hour) => (
               <div
                 key={`line-${hour}`}
                 className="absolute left-0 right-0 border-t border-border/50 pointer-events-none"
                 style={{ top: `${hour * 60}px` }}
               ></div>
            ))}

            {/* Clickable time slots */}
            {hours.map((hour) => (
              <div
                key={`slot-${hour}`}
                className="h-[60px] w-full hover:bg-foreground/5 cursor-pointer"
                onClick={() => {
                  const clickedTime = setMinutes(setHours(currentDate, hour), 0);
                  onTimeSlotClick(clickedTime);
                }}
              />
            ))}

            {/* Render Timed Events (non-all-day, single-day events) */}
            {timedEvents.map((event) => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                className={cn(
                  "absolute left-2 right-2 rounded-lg p-3 text-sm border cursor-pointer transition-all z-10 overflow-hidden hover:z-20 hover:scale-[1.01] shadow-sm",
                  eventTypeStyles[event.type] || eventTypeStyles.event
                )}
                style={getEventStyle(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-xs opacity-70 whitespace-nowrap">
                    {format(event.startTime.toDate(), 'h:mm a')}
                  </div>
                </div>
                {event.description && (
                  <div className="text-xs opacity-80 mt-1 line-clamp-2">
                    {event.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
