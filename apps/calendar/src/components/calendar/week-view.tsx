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
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/event';

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

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.startTime.toDate(), day));
  };

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
    task: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/30",
    reminder: "bg-amber-500/20 text-amber-200 border-amber-500/30 hover:bg-amber-500/30",
    holiday: "bg-rose-500/20 text-rose-200 border-rose-500/30 hover:bg-rose-500/30"
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
              const dayEvents = getEventsForDay(day);

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

                  {/* Render Events */}
                  {dayEvents.map((event) => {
                    if (event.allDay) return null; // Handle all-day separately later
                    
                    return (
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
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
