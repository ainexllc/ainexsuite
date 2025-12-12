'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useToast, WorkspacePageLayout } from '@ainexsuite/ui';
import { Loader2 } from 'lucide-react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

import { CalendarHeader, CalendarViewType } from '@/components/calendar/calendar-header';
import { MonthView } from '@/components/calendar/month-view';
import { WeekView } from '@/components/calendar/week-view';
import { DayView } from '@/components/calendar/day-view';
import { AgendaView } from '@/components/calendar/agenda-view';
import { EventComposer, EventComposerRef } from '@/components/calendar/event-composer';
import { SpaceSwitcher } from '@/components/spaces';
import { EventsService } from '@/lib/events';
import { CalendarEvent, CreateEventInput } from '@/types/event';
import { useReminders } from '@/hooks/use-reminders';
import { useWorkspaceAuth } from '@ainexsuite/auth';

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const { toast } = useToast();
  const composerRef = useRef<EventComposerRef>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Enable reminders
  useReminders(events);

  // Refresh events helper
  const refreshEvents = useCallback(async () => {
    if (!user) return;
    const fetchedEvents = await EventsService.getEvents(user.uid);
    setEvents(fetchedEvents);
  }, [user]);

  // Fetch events
  useEffect(() => {
    if (!user) return;

    async function fetchEvents() {
      setIsLoadingEvents(true);
      try {
        const fetchedEvents = await EventsService.getEvents(user!.uid);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast({
          title: "Failed to load events",
          description: "Unable to fetch your calendar events. Please refresh the page.",
          variant: 'error'
        });
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(prev => subMonths(prev, 1));
    else if (view === 'week') setCurrentDate(prev => subWeeks(prev, 1));
    else if (view === 'day') setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(prev => addMonths(prev, 1));
    else if (view === 'week') setCurrentDate(prev => addWeeks(prev, 1));
    else if (view === 'day') setCurrentDate(prev => addDays(prev, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  // Open composer for new event on a specific date
  const handleDayClick = (date: Date) => {
    composerRef.current?.createEvent(date);
  };

  // Open composer to edit an existing event
  const handleEventClick = (event: CalendarEvent) => {
    // Skip task events - they should open in todo app
    if (event.id.startsWith('task_')) return;
    composerRef.current?.editEvent(event);
  };

  // Handler for composer save (both new and edit)
  const handleComposerSave = async (eventData: CreateEventInput, eventId?: string) => {
    if (!user) return;
    try {
      if (eventId) {
        // Updating existing event
        await EventsService.updateEvent(user.uid, {
          id: eventId,
          ...eventData
        });
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully.",
          variant: 'success'
        });
      } else {
        // Creating new event
        await EventsService.addEvent(user.uid, eventData);
        toast({
          title: "Event created",
          description: "Your event has been added to the calendar.",
          variant: 'success'
        });
      }
      await refreshEvents();
    } catch (e) {
      console.error("Error saving event", e);
      toast({
        title: "Failed to save event",
        description: "There was an error saving your event. Please try again.",
        variant: 'error'
      });
      throw e; // Re-throw so composer knows save failed
    }
  };

  // Handler for composer delete
  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    try {
      await EventsService.deleteEvent(user.uid, eventId);
      toast({
        title: "Event deleted",
        description: "Your event has been removed from the calendar.",
        variant: 'success'
      });
      await refreshEvents();
    } catch (e) {
      console.error("Error deleting event", e);
      toast({
        title: "Failed to delete event",
        description: "There was an error deleting your event. Please try again.",
        variant: 'error'
      });
      throw e;
    }
  };

  const handleEventDrop = async (event: CalendarEvent, newDate: Date) => {
    if (!user) return;

    // Calculate time difference
    const oldStart = event.startTime.toDate();
    const oldEnd = event.endTime.toDate();
    const duration = oldEnd.getTime() - oldStart.getTime();

    // Create new start time (keep original time of day, just change date)
    const newStartTime = new Date(newDate);
    newStartTime.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);

    const newEndTime = new Date(newStartTime.getTime() + duration);

    // Optimistic update
    setEvents(prev => prev.map(e =>
      e.id === event.id
        ? {
            ...e,
            startTime: Timestamp.fromDate(newStartTime),
            endTime: Timestamp.fromDate(newEndTime)
          }
        : e
    ));

    try {
      await EventsService.updateEvent(user.uid, {
        id: event.id,
        startTime: newStartTime,
        endTime: newEndTime
      });

      await refreshEvents();
      toast({
        title: "Event moved",
        description: "Your event has been moved successfully.",
        variant: 'success'
      });
    } catch (e) {
      console.error("Error dropping event", e);
      await refreshEvents();
      toast({
        title: "Failed to move event",
        description: "There was an error moving your event. Please try again.",
        variant: 'error'
      });
    }
  };

  const handleTimeSlotClick = (date: Date) => {
    composerRef.current?.createEvent(date);
  };

  return (
    <WorkspacePageLayout
      maxWidth="wide"
      className="h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 flex flex-col"
      composer={
        <EventComposer
          ref={composerRef}
          onSave={handleComposerSave}
          onDelete={handleDeleteEvent}
        />
      }
      composerActions={<SpaceSwitcher />}
    >
        <div className="flex items-center justify-between mb-6">
          <CalendarHeader
            currentDate={currentDate}
            view={view}
            onViewChange={setView}
            onPrevMonth={handlePrev}
            onNextMonth={handleNext}
            onToday={handleToday}
          />
        </div>

        <div className="flex-1 min-h-0">
          {isLoadingEvents ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
            </div>
          ) : (
            <>
              {view === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  events={events}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                  onEventDrop={handleEventDrop}
                />
              )}
              {view === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
              {view === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
              {view === 'agenda' && (
                <AgendaView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                />
              )}
            </>
          )}
        </div>
    </WorkspacePageLayout>
  );
}