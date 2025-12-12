'use client';

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  format,
  setHours,
  setMinutes,
  max,
  min,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/event';

interface MultiDayEventSegment {
  event: CalendarEvent;
  startDayIndex: number;
  spanDays: number;
  isStart: boolean;
  isEnd: boolean;
}

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
}

export function WeekView({ 
  currentDate, 
  events, 
  onEventClick,
  onTimeSlotClick
}: WeekViewProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

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

  // Get all-day and multi-day events for the week header
  const getAllDayEvents = (): MultiDayEventSegment[] => {
    const segments: MultiDayEventSegment[] = [];

    events.forEach(event => {
      if (!event.allDay && !isMultiDayEvent(event)) return;

      const eventStart = event.startTime.toDate();
      const eventEnd = event.endTime.toDate();

      // Check if event overlaps with this week
      if (eventEnd < startDate || eventStart > endDate) return;

      // Calculate segment within this week
      const segmentStart = max([eventStart, startDate]);
      const segmentEnd = min([eventEnd, endDate]);

      const startDayIndex = days.findIndex(d => isSameDay(d, segmentStart));
      const endDayIndex = days.findIndex(d => isSameDay(d, segmentEnd));

      if (startDayIndex === -1) return;

      const spanDays = Math.max(1, endDayIndex - startDayIndex + 1);

      segments.push({
        event,
        startDayIndex: startDayIndex >= 0 ? startDayIndex : 0,
        spanDays,
        isStart: isSameDay(eventStart, segmentStart),
        isEnd: isSameDay(eventEnd, segmentEnd),
      });
    });

    return segments;
  };

  const getTimedEventsForDay = (day: Date) => {
    return events.filter(event => {
      if (event.allDay || isMultiDayEvent(event)) return false;
      return isSameDay(event.startTime.toDate(), day);
    });
  };

  const allDayEvents = getAllDayEvents();

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
      <div className="flex border-b border-border bg-surface-elevated/10">
        <div className="w-16 border-r border-border flex-shrink-0"></div> {/* Time gutter */}
        <div className="flex-1 grid grid-cols-7">
          {days.map((day) => (
            <div
              key={day.toString()}
              className={cn(
                "py-3 text-center border-r border-border last:border-r-0",
                isToday(day) ? "bg-foreground/5" : ""
              )}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-xl font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full mx-auto",
                isToday(day) ? "bg-accent-500 text-foreground" : "text-foreground"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All-day / Multi-day Events Section */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-border bg-surface-elevated/5">
          <div className="w-16 border-r border-border flex-shrink-0 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/60">All day</span>
          </div>
          <div className="flex-1 grid grid-cols-7 relative min-h-[32px] py-1">
            {allDayEvents.map((segment, idx) => {
              const { event, startDayIndex, spanDays, isStart, isEnd } = segment;
              const eventColor = event.color || '#3b82f6';

              return (
                <div
                  key={`allday-${event.id}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className={cn(
                    "absolute top-1 px-2 py-0.5 text-xs truncate cursor-pointer transition-all z-10",
                    "text-white font-medium hover:opacity-90"
                  )}
                  style={{
                    left: `calc(${(startDayIndex / 7) * 100}% + 2px)`,
                    width: `calc(${(spanDays / 7) * 100}% - 4px)`,
                    backgroundColor: eventColor,
                    borderRadius: isStart && isEnd
                      ? '4px'
                      : isStart
                        ? '4px 0 0 4px'
                        : isEnd
                          ? '0 4px 4px 0'
                          : '0',
                  }}
                  title={event.allDay
                    ? event.title
                    : `${event.title} (${format(event.startTime.toDate(), 'MMM d')} - ${format(event.endTime.toDate(), 'MMM d')})`
                  }
                >
                  {event.title}
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
          <div className="w-16 border-r border-border flex-shrink-0 bg-surface-elevated/5">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-2 text-xs text-muted-foreground/80 font-medium">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
                {/* Small tick mark */}
                <div className="absolute top-0 right-0 w-1.5 h-[1px] bg-border"></div>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="flex-1 grid grid-cols-7 relative">
            {/* Horizontal Hour Lines */}
            {hours.map((hour) => (
               <div
                 key={`line-${hour}`}
                 className="absolute left-0 right-0 border-t border-border/50 pointer-events-none"
                 style={{ top: `${hour * 60}px` }}
               ></div>
            ))}

            {days.map((day, _index) => {
              const timedEvents = getTimedEventsForDay(day);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "relative h-full border-r border-border last:border-r-0 group",
                    isToday(day) ? "bg-foreground/5" : ""
                  )}
                >
                  {/* Clickable time slots (invisible overlays) */}
                  {hours.map((hour) => (
                    <div
                      key={`slot-${hour}`}
                      className="h-[60px] w-full hover:bg-foreground/5 cursor-pointer"
                      onClick={() => {
                        const clickedTime = setMinutes(setHours(day, hour), 0);
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
                        "absolute left-0.5 right-1 rounded-md p-1.5 text-xs border cursor-pointer transition-all z-10 overflow-hidden hover:z-20 hover:scale-[1.02]",
                        eventTypeStyles[event.type] || eventTypeStyles.event
                      )}
                      style={getEventStyle(event)}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="opacity-80 truncate">
                        {format(event.startTime.toDate(), 'h:mm a')} - {format(event.endTime.toDate(), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
