'use client';

import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { TileBase, TileProps } from './tile-base';
import { useAuth } from '@ainexsuite/auth';
import { useCalendarData, getTimeUntil, formatEventTime, CalendarEvent, EventType } from '@/hooks/use-calendar-data';

// Event type colors
const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string }> = {
  event: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  task: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  reminder: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  holiday: { bg: 'bg-green-500/20', text: 'text-green-400' },
};

// Event item component
function EventItem({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.event;
  const timeUntil = getTimeUntil(event.startTime);
  const eventTime = formatEventTime(event);

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-1.5 bg-foreground/5 rounded-lg">
        <div className={`w-1.5 h-6 rounded-full ${colors.bg.replace('/20', '')}`} />
        <span className="text-xs flex-1 truncate text-foreground">{event.title}</span>
        <span className="text-[10px] text-muted-foreground">{timeUntil}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-2.5 rounded-xl ${colors.bg}`}>
      <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
        <Calendar className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] ${colors.text} font-medium`}>
            {timeUntil}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {eventTime}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarTile(props: Omit<TileProps, 'title' | 'children'>) {
  const { user } = useAuth();
  const { upcomingEvents, nextEvent, todayEvents, isLoading } = useCalendarData(user?.uid);

  const isCompact = props.variant === 'small';

  return (
    <TileBase {...props} title="Calendar">
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !nextEvent ? (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <div className="p-3 rounded-full bg-green-500/10 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm font-medium text-foreground/80">All clear!</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            No events scheduled
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Summary header */}
          {todayEvents.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">
                {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''} today
              </span>
            </div>
          )}

          {/* Next event (highlighted) */}
          <div className="mb-2">
            <EventItem event={nextEvent} compact={isCompact} />
          </div>

          {/* More events */}
          {upcomingEvents.length > 1 && (
            <div className={`flex-1 overflow-y-auto space-y-1.5 ${isCompact ? 'max-h-16' : 'max-h-28'}`}>
              {upcomingEvents.slice(1, isCompact ? 2 : 4).map(event => (
                <EventItem key={event.id} event={event} compact />
              ))}
              {upcomingEvents.length > (isCompact ? 2 : 4) && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +{upcomingEvents.length - (isCompact ? 2 : 4)} more events
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </TileBase>
  );
}
