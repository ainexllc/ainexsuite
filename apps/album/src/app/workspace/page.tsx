'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import type { Moment, SpaceType } from '@ainexsuite/types';
import {
  EmptyState,
  WorkspacePageLayout,
  WorkspaceToolbar,
  WorkspaceLoadingScreen,
  ActivityCalendar,
  ActiveFilterChips,
  SpaceManagementModal,
  type ViewOption,
  type SortOption,
  type SortConfig,
  type FilterChip,
  type FilterChipType,
} from '@ainexsuite/ui';
import { X } from 'lucide-react';
import { TimelineView } from '@/components/timeline-view';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { MomentComposer } from '@/components/moment-composer';
import { PlacesView } from '@/components/places-view';
import { MomentsInsights } from '@/components/moments-insights';
import { useMomentsStore } from '@/lib/store';
import { useSpaces } from '@/components/providers/spaces-provider';
import { SpaceSettingsModal } from '@/components/space-settings-modal';
import { MemberManager } from '@/components/spaces/MemberManager';
import { FlashbackWidget } from '@/components/flashback-widget';
import { TriviaGame } from '@/components/trivia-game';
import { FlipbookPlayer } from '@/components/flipbook-player';
import { SlideshowPlayer } from '@/components/slideshow-player';
import { MomentsFilterContent } from '@/components/moments-filter-content';
import {
  Image as ImageIcon,
  LayoutGrid,
  List,
  Calendar,
  Gamepad2,
  Play,
  Book,
  MapPin,
} from 'lucide-react';

type ViewType = 'timeline' | 'masonry' | 'calendar' | 'places';

const VIEW_OPTIONS: ViewOption<ViewType>[] = [
  { value: 'timeline', icon: List, label: 'Timeline view' },
  { value: 'masonry', icon: LayoutGrid, label: 'Masonry view' },
  { value: 'calendar', icon: Calendar, label: 'Calendar view' },
  { value: 'places', icon: MapPin, label: 'Places view' },
];

const SORT_OPTIONS: SortOption[] = [
  { field: 'date', label: 'Date captured' },
  { field: 'createdAt', label: 'Date added' },
  { field: 'title', label: 'Title' },
];

const MOOD_LABELS: Record<string, string> = {
  Happy: '😊 Happy',
  Loved: '🥰 Loved',
  Excited: '🎉 Excited',
  Chill: '😌 Chill',
  Sad: '😔 Sad',
  Tired: '😴 Tired',
};

interface MomentsFilters {
  tags?: string[];
  moods?: string[];
  people?: string[];
  location?: string;
  dateRange?: { start: string | null; end: string | null };
  datePreset?: string;
}

export default function MomentsWorkspacePage() {
  const { user, isReady } = useWorkspaceAuth();

  // Use shared SpacesProvider for spaces (auto-creates default space)
  const { spaces, currentSpaceId, currentSpace, createSpace, updateSpace, deleteSpace } = useSpaces();

  // Space management modals
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);

  // Use Zustand store for moments data
  const {
    moments,
    isLoadingMoments,
    fetchMoments,
  } = useMomentsStore();

  // UI State
  const [showEditor, setShowEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [detailMoment, setDetailMoment] = useState<Moment | null>(null);

  // View & Filter State
  const [view, setView] = useState<ViewType>('timeline');
  const [sort, setSort] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [filters, setFilters] = useState<MomentsFilters>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch moments when space changes
  useEffect(() => {
    if (isReady && user?.uid && currentSpaceId) {
      fetchMoments(user.uid, currentSpaceId);
    }
  }, [currentSpaceId, fetchMoments, user?.uid, isReady]);

  const handleUpdate = async () => {
    if (user?.uid && currentSpaceId) {
      fetchMoments(user.uid, currentSpaceId);
    }
    setShowEditor(false);
    setSelectedMoment(null);
  };

  // Get unique values for filters
  const allTags = useMemo(() =>
    Array.from(new Set(moments.flatMap((m) => m.tags || []))).sort(),
    [moments]
  );
  const allMoods = useMemo(() =>
    Array.from(new Set(moments.map((m) => m.mood).filter(Boolean))) as string[],
    [moments]
  );
  const allPeople = useMemo(() =>
    Array.from(new Set(moments.flatMap((m) => m.people || []))).sort(),
    [moments]
  );

  // Apply filters
  const filteredMoments = useMemo(() => {
    let result = [...moments];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) =>
        m.title.toLowerCase().includes(query) ||
        m.caption?.toLowerCase().includes(query) ||
        m.location?.toLowerCase().includes(query) ||
        m.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        m.people?.some((person) => person.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((m) =>
        filters.tags!.some((tag) => m.tags?.includes(tag))
      );
    }

    // Filter by moods
    if (filters.moods && filters.moods.length > 0) {
      result = result.filter((m) => filters.moods!.includes(m.mood || ''));
    }

    // Filter by people
    if (filters.people && filters.people.length > 0) {
      result = result.filter((m) =>
        filters.people!.some((person) => m.people?.includes(person))
      );
    }

    // Filter by location
    if (filters.location) {
      result = result.filter((m) => m.location === filters.location);
    }

    // Filter by date range
    if (filters.dateRange?.start || filters.dateRange?.end) {
      result = result.filter((m) => {
        const momentDate = new Date(m.date).toISOString().split('T')[0];
        if (filters.dateRange!.start && momentDate < filters.dateRange!.start) return false;
        if (filters.dateRange!.end && momentDate > filters.dateRange!.end) return false;
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sort.field) {
        case 'date':
          aVal = a.date;
          bVal = b.date;
          break;
        case 'createdAt':
          aVal = a.createdAt || 0;
          bVal = b.createdAt || 0;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          aVal = a.date;
          bVal = b.date;
      }

      if (sort.direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });

    return result;
  }, [moments, filters, sort, searchQuery]);

  // Calculate activity data for calendar view
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    moments.forEach((moment) => {
      const date = new Date(moment.date).toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    });
    return data;
  }, [moments]);

  // Generate filter chips
  const filterChips = useMemo(() => {
    const chips: FilterChip[] = [];

    // Tag chips
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => {
        chips.push({
          id: tag,
          label: `#${tag}`,
          type: 'label' as FilterChipType,
        });
      });
    }

    // Mood chips
    if (filters.moods && filters.moods.length > 0) {
      filters.moods.forEach((mood) => {
        chips.push({
          id: mood,
          label: MOOD_LABELS[mood] || mood,
          type: 'noteType' as FilterChipType,
        });
      });
    }

    // People chips
    if (filters.people && filters.people.length > 0) {
      filters.people.forEach((person) => {
        chips.push({
          id: person,
          label: person,
          type: 'space' as FilterChipType,
        });
      });
    }

    // Location chip
    if (filters.location) {
      chips.push({
        id: 'location_filter',
        label: filters.location,
        type: 'space' as FilterChipType,
      });
    }

    // Date range chip
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const dateLabel =
        filters.datePreset && filters.datePreset !== 'custom'
          ? filters.datePreset
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
          : 'Custom Date';
      chips.push({
        id: 'dateRange',
        label: dateLabel,
        type: 'date' as FilterChipType,
      });
    }

    return chips;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.moods && filters.moods.length > 0) count++;
    if (filters.people && filters.people.length > 0) count++;
    if (filters.location) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    return count;
  }, [filters]);

  const handleFilterReset = useCallback(() => {
    setFilters({});
  }, []);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        // Clear search when closing
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  const handleRemoveChip = useCallback(
    (chipId: string, chipType: FilterChipType) => {
      switch (chipType) {
        case 'label':
          // Remove tag
          setFilters({
            ...filters,
            tags: filters.tags?.filter((t) => t !== chipId) || [],
          });
          break;
        case 'noteType':
          // Remove mood
          setFilters({
            ...filters,
            moods: filters.moods?.filter((m) => m !== chipId) || [],
          });
          break;
        case 'space':
          if (chipId === 'location_filter') {
            setFilters({ ...filters, location: undefined });
          } else {
            // Remove person
            setFilters({
              ...filters,
              people: filters.people?.filter((p) => p !== chipId) || [],
            });
          }
          break;
        case 'date':
          setFilters({
            ...filters,
            dateRange: { start: null, end: null },
            datePreset: undefined,
          });
          break;
      }
    },
    [filters]
  );

  const isCalendarView = view === 'calendar';

  // Map spaces to format expected by SpaceManagementModal
  const userSpaces = useMemo(() => {
    return spaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        memberCount: s.memberUids?.length || 1,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
      }));
  }, [spaces, user?.uid]);

  // Space management handlers
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, _hiddenInApps: string[]) => {
    const name = type.charAt(0).toUpperCase() + type.slice(1);
    await createSpace({ name, type });
  }, [createSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, _hiddenInApps: string[]) => {
    await createSpace({ name, type: 'project' });
  }, [createSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  // Show loading screen
  if (isLoadingMoments && moments.length === 0) {
    return <WorkspaceLoadingScreen />;
  }

  if (!user) return null;

  return (
    <>
      <WorkspacePageLayout
        className="pt-[17px]"
        maxWidth="default"
        insightsBanner={<MomentsInsights moments={moments} />}
        composer={
          <MomentComposer
            onMomentCreated={handleUpdate}
            onManagePeople={() => setShowMemberManager(true)}
            onManageSpaces={() => setShowSpaceManagement(true)}
          />
        }
        toolbar={
          <div className="space-y-2">
            {isSearchOpen && (
              <div className="flex items-center gap-2 justify-center">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search moments..."
                    autoFocus
                    className="w-full px-4 py-2 pr-10 bg-surface-base border border-outline-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-hover rounded text-text-muted hover:text-text-primary"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <WorkspaceToolbar
              viewMode={view}
              onViewModeChange={setView}
              viewOptions={VIEW_OPTIONS}
              sort={sort}
              onSortChange={setSort}
              sortOptions={SORT_OPTIONS}
              filterContent={
                <MomentsFilterContent
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableTags={allTags}
                  availableMoods={allMoods}
                  availablePeople={allPeople}
                />
              }
              activeFilterCount={activeFilterCount}
              onFilterReset={handleFilterReset}
              viewPosition="right"
              onSearchClick={handleSearchToggle}
              isSearchActive={isSearchOpen || !!searchQuery}
              rightSlot={
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowFlipbook(true)}
                    className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                    title="View as Flipbook"
                    disabled={filteredMoments.length === 0}
                  >
                    <Book className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowSlideshow(true)}
                    className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                    title="Play Slideshow"
                    disabled={filteredMoments.length === 0}
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowGame(true)}
                    className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                    title="Play Trivia"
                    disabled={filteredMoments.length === 0}
                  >
                    <Gamepad2 className="h-4 w-4" />
                  </button>
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
        {/* Flashback Widget - Full Width (only on timeline, no filters) */}
        {view === 'timeline' && filterChips.length === 0 && moments.length > 0 && (
          <FlashbackWidget onDetail={setDetailMoment} />
        )}

        {/* Empty State */}
        {filteredMoments.length === 0 && (
          <EmptyState
            title={filterChips.length > 0 ? 'No matching moments' : 'No moments yet'}
            description={
              filterChips.length > 0
                ? 'Try adjusting your filters or create a new moment'
                : 'Start capturing your memories! Create your first moment above.'
            }
            icon={ImageIcon}
            variant="default"
          />
        )}

        {/* Views */}
        {filteredMoments.length > 0 && (
          isCalendarView ? (
            <ActivityCalendar
              activityData={activityData}
              size="large"
            />
          ) : view === 'places' ? (
            <PlacesView
              moments={filteredMoments}
              onSelectLocation={(location) => {
                setFilters({ ...filters, location });
                setView('masonry');
              }}
              onPlayStory={(location) => {
                setFilters({ ...filters, location });
                setShowSlideshow(true);
              }}
            />
          ) : (
            <TimelineView
              moments={filteredMoments}
              viewMode={view}
              onEdit={(moment) => {
                setSelectedMoment(moment);
                setShowEditor(true);
              }}
              onDetail={(moment) => setDetailMoment(moment)}
            />
          )
        )}
      </WorkspacePageLayout>

      {/* Modals */}
      {showEditor && (
        <PhotoEditor
          moment={selectedMoment}
          spaceId={currentSpaceId || undefined}
          onClose={() => {
            setShowEditor(false);
            setSelectedMoment(null);
          }}
          onSave={handleUpdate}
        />
      )}

      {detailMoment && (
        <PhotoDetail
          moment={detailMoment}
          onClose={() => setDetailMoment(null)}
          onEdit={() => {
            setSelectedMoment(detailMoment);
            setDetailMoment(null);
            setShowEditor(true);
          }}
        />
      )}

      {showSettings && currentSpace && (
        <SpaceSettingsModal
          space={currentSpace}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showGame && (
        <TriviaGame
          moments={moments}
          onClose={() => setShowGame(false)}
        />
      )}

      {showSlideshow && (
        <SlideshowPlayer
          moments={filteredMoments}
          onClose={() => setShowSlideshow(false)}
        />
      )}

      {showFlipbook && (
        <FlipbookPlayer
          moments={filteredMoments}
          onClose={() => setShowFlipbook(false)}
        />
      )}

      {/* Space Management Modals */}
      <MemberManager
        isOpen={showMemberManager}
        onClose={() => setShowMemberManager(false)}
      />

      <SpaceManagementModal
        isOpen={showSpaceManagement}
        onClose={() => setShowSpaceManagement(false)}
        userSpaces={userSpaces}
        onJoinGlobalSpace={handleJoinGlobalSpace}
        onLeaveGlobalSpace={handleLeaveGlobalSpace}
        onCreateCustomSpace={handleCreateCustomSpace}
        onRenameCustomSpace={handleRenameCustomSpace}
        onDeleteCustomSpace={handleDeleteCustomSpace}
      />
    </>
  );
}