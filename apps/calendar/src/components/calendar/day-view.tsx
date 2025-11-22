'use client';

import { 
  format, 
  setHours,
  setMinutes,
  isSameDay,
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

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.startTime.toDate(), day));
  };

  const dayEvents = getEventsForDay(currentDate);

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
    <div className="flex flex-col h-full bg-surface-elevated/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Header Row */}
      <div className="flex border-b border-white/10 bg-surface-elevated/10 py-4 px-6 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            {format(currentDate, 'EEEE')}
          </div>
          <div className="text-3xl font-bold text-accent-500 mt-1">
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin relative">
        <div className="flex min-h-[1440px]"> {/* 24 hours * 60px */}
          
          {/* Time Axis */}
          <div className="w-20 border-r border-white/10 flex-shrink-0 bg-surface-elevated/5">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-3 text-xs text-white/40 font-medium">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
                {/* Small tick mark */}
                <div className="absolute top-0 right-0 w-2 h-[1px] bg-white/10"></div>
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div className="flex-1 relative bg-surface-base/20">
            {/* Horizontal Hour Lines */}
            {hours.map((hour) => (
               <div 
                 key={`line-${hour}`} 
                 className="absolute left-0 right-0 border-t border-white/5 pointer-events-none"
                 style={{ top: `${hour * 60}px` }}
               ></div>
            ))}

            {/* Clickable time slots */}
            {hours.map((hour) => (
              <div
                key={`slot-${hour}`}
                className="h-[60px] w-full hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  const clickedTime = setMinutes(setHours(currentDate, hour), 0);
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
