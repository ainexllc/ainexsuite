import { useEffect, useRef } from 'react';
import { CalendarEvent } from '@/types/event';
import { differenceInMinutes, isAfter, isBefore, addMinutes } from 'date-fns';

export function useReminders(events: CalendarEvent[]) {
  const notifiedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      
      events.forEach(event => {
        // Skip if already notified
        // We use a composite key for recurring instances: id + start time
        const eventKey = `${event.id}_${event.startTime.toDate().getTime()}`;
        if (notifiedEvents.current.has(eventKey)) return;

        const eventStart = event.startTime.toDate();
        
        // Check if event is starting in the next 15 minutes
        // And hasn't already started more than 1 minute ago
        if (
          isAfter(eventStart, now) &&
          isBefore(eventStart, addMinutes(now, 15))
        ) {
          const minutesUntil = differenceInMinutes(eventStart, now);
          
          new Notification(`Upcoming: ${event.title}`, {
            body: `Starts in ${minutesUntil} minute${minutesUntil === 1 ? '' : 's'}`,
            icon: '/icon.png' // We can add an icon later
          });

          notifiedEvents.current.add(eventKey);
        }
      });
    };

    // Check every minute
    const intervalId = setInterval(checkReminders, 60000);
    
    // Initial check
    checkReminders();

    return () => clearInterval(intervalId);
  }, [events]);
}
