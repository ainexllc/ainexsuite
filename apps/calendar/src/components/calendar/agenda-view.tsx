'use client';

import { 
  format, 
  isSameDay,
  isToday,
  startOfDay,
  addDays,
  isAfter
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/event';
import { Calendar as CalendarIcon, Clock, Circle, CheckCircle2, AlertCircle } from 'lucide-react';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function AgendaView({ 
  currentDate, 
  events, 
  onEventClick 
}: AgendaViewProps) {
  // Get next 14 days for agenda
  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(currentDate), i));

  const getEventsForDay = (day: Date) => {
    return events
      .filter(event => isSameDay(event.startTime.toDate(), day))
      .sort((a, b) => a.startTime.toDate().getTime() - b.startTime.toDate().getTime());
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task': return CheckCircle2;
      case 'reminder': return AlertCircle;
      default: return Circle;
    }
  };

  const getEventColorClass = (type: string) => {
    switch (type) {
      case 'task': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case 'reminder': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-accent-500 bg-accent-500/10 border-accent-500/20";
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-elevated/5 rounded-xl border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            if (dayEvents.length === 0) return null;

            const isDayToday = isToday(day);

            return (
              <div key={day.toString()} className="space-y-3">
                <div className="flex items-center gap-3 sticky top-0 bg-background py-2 z-10">
                  <div className={cn(
                    "text-2xl font-bold w-12 text-center leading-none",
                    isDayToday ? "text-accent-500" : "text-foreground/80"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex flex-col">
                    <div className={cn(
                      "text-sm font-medium uppercase tracking-wider",
                      isDayToday ? "text-accent-500" : "text-muted-foreground"
                    )}>
                      {isDayToday ? 'Today' : format(day, 'EEEE')}
                    </div>
                    <div className="text-xs text-muted-foreground/60 font-medium">
                      {format(day, 'MMMM yyyy')}
                    </div>
                  </div>
                  <div className="h-[1px] flex-1 bg-border ml-4"></div>
                </div>

                <div className="space-y-2 pl-16">
                  {dayEvents.map((event) => {
                    const Icon = getEventIcon(event.type);
                    const colorClass = getEventColorClass(event.type);

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="group flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-foreground/5 hover:bg-foreground/10 hover:border-border transition-all cursor-pointer"
                      >
                        <div className={cn("p-2 rounded-lg", colorClass)}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground truncate">
                              {event.title}
                            </h4>
                            {event.type !== 'event' && (
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider",
                                colorClass
                              )}>
                                {event.type}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-medium whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" />
                          {event.allDay ? (
                            <span>All Day</span>
                          ) : (
                            <span>
                              {format(event.startTime.toDate(), 'h:mm a')} - {format(event.endTime.toDate(), 'h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Empty State if no events in next 14 days */}
          {events.filter(e => isAfter(e.startTime.toDate(), startOfDay(currentDate))).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">No upcoming events</h3>
              <p className="text-muted-foreground max-w-sm">
                You don&apos;t have any events scheduled for the next 14 days. Click &quot;New Event&quot; to add something to your agenda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
