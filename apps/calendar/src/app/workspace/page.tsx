'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { Timestamp } from 'firebase/firestore';
import { WorkspaceLayout, SUITE_APPS, getAppUrl } from '@ainexsuite/ui';
import { useVisualStyle } from '@/lib/theme/visual-style';
import { useToast } from '@/lib/toast';
import {
  Loader2,
  Calendar as CalendarIcon,
  LayoutGrid,
  CheckSquare,
  BookOpen,
  Activity,
  Heart,
  Zap,
  TrendingUp,
  Settings,
  Image as ImageIcon,
  GitBranch
} from 'lucide-react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

import { CalendarHeader, CalendarViewType } from '@/components/calendar/calendar-header';
import { MonthView } from '@/components/calendar/month-view';
import { WeekView } from '@/components/calendar/week-view';
import { DayView } from '@/components/calendar/day-view';
import { AgendaView } from '@/components/calendar/agenda-view';
import { EventModal } from '@/components/calendar/event-modal';
import { EventsService } from '@/lib/events';
import { CalendarEvent, CreateEventInput } from '@/types/event';
import { useReminders } from '@/hooks/use-reminders';

// Environment-aware app URLs
const isDev = process.env.NODE_ENV === 'development';

// Simple icon mapping using Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  notes: BookOpen,
  journey: BookOpen,
  todo: CheckSquare,
  track: Activity,
  moments: ImageIcon,
  grow: TrendingUp,
  pulse: Zap,
  fit: Heart,
  projects: LayoutGrid,
  workflow: GitBranch,
  calendar: CalendarIcon,
  admin: Settings,
};

// Build apps array from shared configuration with icons
const apps = Object.entries(SUITE_APPS).map(([slug, config]) => ({
  name: config.name,
  slug: config.slug,
  description: config.description,
  icon: iconMap[slug] || Settings,
  color: config.color,
  url: getAppUrl(slug, isDev),
}));

export default function WorkspacePage() {
  const { user, loading, signOut, ssoInProgress } = useAuth();
  const router = useRouter();
  const { selectedVariant } = useVisualStyle();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);

  // Enable reminders
  useReminders(events);

  // Redirect to login if not authenticated
  // Wait for SSO to complete before redirecting to prevent interrupting app switching
  useEffect(() => {
    if (!loading && !ssoInProgress && !user) {
      const isDev = process.env.NODE_ENV === 'development';
      const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;

      window.location.href = isDev
        ? 'http://localhost:3000'
        : mainDomain ? `https://${mainDomain}/login` : '/login';
    }
  }, [user, loading, ssoInProgress, router]);

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
  }, [user, toast]);

  const handleSignOut = async () => {
    await signOut();
    const isDev = process.env.NODE_ENV === 'development';
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;
    
    window.location.href = isDev 
      ? 'http://localhost:3000' 
      : mainDomain ? `https://${mainDomain}` : '/';
  };

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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: CreateEventInput) => {
    if (!user) return;
    try {
      if (editingEvent) {
        await EventsService.updateEvent(user.uid, {
          id: editingEvent.id,
          ...eventData
        });
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully.",
          variant: 'success'
        });
      } else {
        await EventsService.addEvent(user.uid, eventData);
        toast({
          title: "Event created",
          description: "Your event has been added to the calendar.",
          variant: 'success'
        });
      }

      // Refresh events
      const fetchedEvents = await EventsService.getEvents(user.uid);
      setEvents(fetchedEvents);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error saving event", e);
      toast({
        title: "Failed to save event",
        description: "There was an error saving your event. Please try again.",
        variant: 'error'
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    try {
      await EventsService.deleteEvent(user.uid, eventId);
      toast({
        title: "Event deleted",
        description: "Your event has been removed from the calendar.",
        variant: 'success'
      });
      // Refresh events
      const fetchedEvents = await EventsService.getEvents(user.uid);
      setEvents(fetchedEvents);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error deleting event", e);
      toast({
        title: "Failed to delete event",
        description: "There was an error deleting your event. Please try again.",
        variant: 'error'
      });
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

      // Refresh to get real timestamps
      const fetchedEvents = await EventsService.getEvents(user.uid);
      setEvents(fetchedEvents);
      toast({
        title: "Event moved",
        description: "Your event has been moved successfully.",
        variant: 'success'
      });
    } catch (e) {
      console.error("Error dropping event", e);
      // Revert on error
      const fetchedEvents = await EventsService.getEvents(user.uid);
      setEvents(fetchedEvents);
      toast({
        title: "Failed to move event",
        description: "There was an error moving your event. Please try again.",
        variant: 'error'
      });
    }
  };

  const handleNewEventClick = () => {
    setSelectedDate(new Date());
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  if (loading || ssoInProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className={`pointer-events-none absolute inset-0 -z-10 ${selectedVariant.heroAtmosphere}`} />
      
      <WorkspaceLayout
        user={user}
        onSignOut={handleSignOut}
        appName="Calendar"
        appColor="#8b5cf6"
        showBackground={true}
        apps={apps}
      >
        <div className="h-[calc(100vh-80px)] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <CalendarHeader 
                currentDate={currentDate}
                view={view}
                onViewChange={setView}
                onPrevMonth={handlePrev}
                onNextMonth={handleNext}
                onToday={handleToday}
             />
             <button 
               onClick={handleNewEventClick}
               className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium transition-colors"
             >
                <span className="text-xl leading-none pb-0.5">+</span>
                <span>New Event</span>
             </button>
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
        </div>

        <EventModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          initialDate={selectedDate}
          eventToEdit={editingEvent}
        />
      </WorkspaceLayout>
    </div>
  );
}
