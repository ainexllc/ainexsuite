'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  useToast,
  WorkspacePageLayout,
  WorkspaceToolbar,
  ActiveFilterChips,
  SpaceManagementModal,
  type ViewOption,
  type FilterChip,
  type FilterChipType,
  type UserSpace,
} from '@ainexsuite/ui';
import type { SpaceType } from '@ainexsuite/types';
import {
  Loader2,
  CalendarDays,
  CalendarRange,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, format, isWithinInterval } from 'date-fns';

import { CalendarViewType } from '@/components/calendar/calendar-header';
import { MonthView } from '@/components/calendar/month-view';
import { WeekView } from '@/components/calendar/week-view';
import { DayView } from '@/components/calendar/day-view';
import { AgendaView } from '@/components/calendar/agenda-view';
import { EventComposer, EventComposerRef } from '@/components/calendar/event-composer';
import { CalendarFilterContent, CalendarFilters } from '@/components/calendar/calendar-filter-content';
import { KeyboardShortcutsModal } from '@/components/calendar/keyboard-shortcuts-modal';
import { EventsService } from '@/lib/events';
import { useEvents } from '@/components/providers/events-provider';
import { CalendarEvent, CreateEventInput, EventType } from '@/types/event';
import { useReminders } from '@/hooks/use-reminders';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { MemberManager } from '@/components/spaces/MemberManager';
import { useSpaces } from '@/components/providers/spaces-provider';

const VIEW_OPTIONS: ViewOption<CalendarViewType>[] = [
  { value: 'month', icon: CalendarDays, label: 'Month view' },
  { value: 'week', icon: CalendarRange, label: 'Week view' },
  { value: 'day', icon: CalendarIcon, label: 'Day view' },
  { value: 'agenda', icon: List, label: 'Agenda view' },
];

// Sort options - can be used when sorting is needed
// const SORT_OPTIONS: SortOption[] = [
//   { field: 'dueDate', label: 'Event time' },
//   { field: 'title', label: 'Title' },
//   { field: 'createdAt', label: 'Date created' },
// ];

const EVENT_COLOR_MAP: Record<string, string> = {
  '#3b82f6': 'Blue',
  '#ef4444': 'Red',
  '#22c55e': 'Green',
  '#f59e0b': 'Amber',
  '#8b5cf6': 'Purple',
  '#ec4899': 'Pink',
  '#06b6d4': 'Cyan',
  '#f97316': 'Orange',
};

const DEFAULT_FILTERS: CalendarFilters = {
  eventTypes: [],
  colors: [],
  datePreset: undefined,
  dateRange: { start: null, end: null },
};

export default function WorkspacePage() {
  const { user } = useWorkspaceAuth();
  const { toast } = useToast();
  const composerRef = useRef<EventComposerRef>(null);
  const { events, loading: isLoadingEvents, refreshEvents } = useEvents();
  const { allSpaces, createSpace, updateSpace, deleteSpace } = useSpaces();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);

  // Map spaces to UserSpace format for SpaceManagementModal
  const userSpaces = useMemo<UserSpace[]>(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type as SpaceType,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal ?? false,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
      }));
  }, [allSpaces, user?.uid]);

  // Space management callbacks
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, hiddenInApps: string[]) => {
    if (!user) return;
    const globalSpaceNames: Record<string, string> = {
      family: 'Family',
      couple: 'Couple',
      squad: 'Team',
      work: 'Group',
    };
    const spaceId = await createSpace({
      name: globalSpaceNames[type] || type,
      type,
    });
    await updateSpace(spaceId, { isGlobal: true, hiddenInApps });
  }, [user, createSpace, updateSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, hiddenInApps: string[]) => {
    if (!user) return;
    const spaceId = await createSpace({
      name,
      type: 'work',
    });
    if (hiddenInApps.length > 0) {
      await updateSpace(spaceId, { hiddenInApps });
    }
  }, [user, createSpace, updateSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Enable reminders
  useReminders(events);

  // Keyboard shortcuts
  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onNewEvent: () => composerRef.current?.createEvent(new Date()),
    onToday: () => setCurrentDate(new Date()),
    onPrev: () => {
      if (view === 'month') setCurrentDate(prev => subMonths(prev, 1));
      else if (view === 'week') setCurrentDate(prev => subWeeks(prev, 1));
      else if (view === 'day') setCurrentDate(prev => subDays(prev, 1));
    },
    onNext: () => {
      if (view === 'month') setCurrentDate(prev => addMonths(prev, 1));
      else if (view === 'week') setCurrentDate(prev => addWeeks(prev, 1));
      else if (view === 'day') setCurrentDate(prev => addDays(prev, 1));
    },
    onViewChange: setView,
    onCloseComposer: () => composerRef.current?.close(),
    onToggleSearch: () => setShowSearch(prev => !prev),
  });

  // Filter events based on current filters and search
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Event type filter
      if (filters.eventTypes.length > 0) {
        if (!filters.eventTypes.includes(event.type)) return false;
      }

      // Color filter
      if (filters.colors.length > 0) {
        if (!event.color || !filters.colors.includes(event.color)) return false;
      }

      // Date range filter
      if (filters.dateRange.start && filters.dateRange.end) {
        const eventStart = event.startTime.toDate();
        const eventEnd = event.endTime.toDate();
        const filterStart = filters.dateRange.start;
        const filterEnd = filters.dateRange.end;

        // Check if event overlaps with filter range
        const overlaps =
          isWithinInterval(eventStart, { start: filterStart, end: filterEnd }) ||
          isWithinInterval(eventEnd, { start: filterStart, end: filterEnd }) ||
          (eventStart <= filterStart && eventEnd >= filterEnd);

        if (!overlaps) return false;
      }

      return true;
    });
  }, [events, filters, searchQuery]);

  // Generate filter chips
  const filterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    // Event type chips
    filters.eventTypes.forEach(type => {
      chips.push({
        id: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        type: 'noteType' as FilterChipType,
      });
    });

    // Color chips
    filters.colors.forEach(color => {
      chips.push({
        id: color,
        label: EVENT_COLOR_MAP[color] || 'Color',
        type: 'color' as FilterChipType,
        colorValue: color,
      });
    });

    // Date range chip
    if (filters.datePreset && filters.datePreset !== 'custom') {
      chips.push({
        id: 'dateRange',
        label: filters.datePreset.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type: 'date' as FilterChipType,
      });
    } else if (filters.dateRange.start || filters.dateRange.end) {
      chips.push({
        id: 'dateRange',
        label: 'Custom Date',
        type: 'date' as FilterChipType,
      });
    }

    return chips;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.eventTypes.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleRemoveChip = useCallback((chipId: string, chipType: FilterChipType) => {
    switch (chipType) {
      case 'noteType':
        setFilters(prev => ({
          ...prev,
          eventTypes: prev.eventTypes.filter(t => t !== chipId) as EventType[],
        }));
        break;
      case 'color':
        setFilters(prev => ({
          ...prev,
          colors: prev.colors.filter(c => c !== chipId),
        }));
        break;
      case 'date':
        setFilters(prev => ({
          ...prev,
          datePreset: undefined,
          dateRange: { start: null, end: null },
        }));
        break;
    }
  }, []);


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

  // Handle event duplication
  const handleDuplicateEvent = (event: CalendarEvent) => {
    // Use the composer's duplicateEvent method which copies all event data
    composerRef.current?.duplicateEvent(event);
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

  // Date navigation label
  const dateLabel = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'week') {
      const weekStart = subDays(currentDate, currentDate.getDay());
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy');
    return format(currentDate, 'MMMM yyyy');
  }, [currentDate, view]);

  return (
    <WorkspacePageLayout
      maxWidth="wide"
      className="h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 flex flex-col"
      composer={
        <EventComposer
          ref={composerRef}
          onSave={handleComposerSave}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          onManagePeople={() => setShowMemberManager(true)}
          onManageSpaces={() => setShowSpaceManagement(true)}
        />
      }
      toolbar={
        <div className="space-y-2">
          <WorkspaceToolbar
            viewMode={view}
            onViewModeChange={setView}
            viewOptions={VIEW_OPTIONS}
            filterContent={<CalendarFilterContent filters={filters} onFiltersChange={setFilters} />}
            activeFilterCount={activeFilterCount}
            onFilterReset={handleFilterReset}
            viewPosition="right"
            leftSlot={
              <div className="flex items-center gap-3">
                {/* Date Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-3 py-1 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-lg font-semibold text-foreground">{dateLabel}</span>
              </div>
            }
            rightSlot={
              <div className="flex items-center gap-2">
                {/* Search */}
                {showSearch ? (
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search events..."
                      className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 w-40"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearch(false);
                      }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                    title="Search events"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            }
          />
          {filterChips.length > 0 && (
            <ActiveFilterChips
              chips={filterChips}
              onRemove={handleRemoveChip}
              onClearAll={handleFilterReset}
              className="px-1"
            />
          )}
        </div>
      }
    >
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
                  events={filteredEvents}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                  onEventDrop={handleEventDrop}
                />
              )}
              {view === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
              {view === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
              {view === 'agenda' && (
                <AgendaView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                />
              )}
            </>
          )}
        </div>

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Member Manager Modal */}
        <MemberManager
          isOpen={showMemberManager}
          onClose={() => setShowMemberManager(false)}
        />

        {/* Space Management Modal */}
        <SpaceManagementModal
          isOpen={showSpaceManagement}
          onClose={() => setShowSpaceManagement(false)}
          userSpaces={userSpaces}
          onJoinGlobalSpace={handleJoinGlobalSpace}
          onLeaveGlobalSpace={handleLeaveGlobalSpace}
          onCreateCustomSpace={handleCreateCustomSpace}
          onRenameCustomSpace={handleRenameCustomSpace}
          onDeleteCustomSpace={handleDeleteCustomSpace}
          onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
        />
    </WorkspacePageLayout>
  );
}