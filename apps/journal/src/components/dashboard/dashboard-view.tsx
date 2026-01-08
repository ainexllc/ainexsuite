'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@ainexsuite/auth';
import { useToast, ActivityCalendar, type SortConfig } from '@ainexsuite/ui';
import { getOnThisDayEntries } from '@/lib/firebase/firestore';
import type { JournalEntry, MoodType } from '@ainexsuite/types';
import { FilterModal } from '@/components/journal/filter-modal';
import { getMoodLabel } from '@/lib/utils/mood';
import { plainText } from '@/lib/utils/text';
import { NotebookLiteDashboard } from '@/components/dashboard/notebook-lite-dashboard';
import { useSpaces } from '@/components/providers/spaces-provider';
import type { JournalFilterValue } from '@/components/journal/journal-filter-content';
import { useInfiniteEntries } from '@/hooks/use-infinite-entries';

// Updated to match reduced analytically meaningful mood set
const POSITIVE_MOODS: Set<MoodType> = new Set([
  'happy',
  'excited',
  'grateful',
  'peaceful',
]);

const NEGATIVE_MOODS: Set<MoodType> = new Set([
  'anxious',
  'sad',
  'frustrated',
  'tired',
]);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface DashboardViewProps {
  dateFilter?: string;
  /** Key that triggers a refresh when changed */
  refreshKey?: number;
  /** Filters from toolbar */
  filters?: JournalFilterValue;
  /** Sort configuration */
  sort?: SortConfig;
  /** Search query from toolbar */
  searchQuery?: string;
  /** Callback for search query changes */
  onSearchQueryChange?: (query: string) => void;
  /** Whether search is open */
  isSearchOpen?: boolean;
  /** View mode */
  viewMode?: 'masonry' | 'calendar';
}

export function DashboardView({
  dateFilter,
  refreshKey,
  filters,
  sort,
  searchQuery,
  onSearchQueryChange,
  viewMode = 'masonry',
}: DashboardViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentSpaceId } = useSpaces();

  // Use infinite scroll hook for entries
  const {
    entries,
    isLoading: loading,
    isLoadingMore,
    hasMore,
    error,
    refresh: loadEntries,
    sentinelRef,
  } = useInfiniteEntries({
    userId: user?.uid,
    spaceId: currentSpaceId,
    enabled: !!user?.uid,
  });

  const [onThisDayEntries, setOnThisDayEntries] = useState<JournalEntry[]>([]);
  // Use external search if provided, otherwise local
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = searchQuery ?? localSearchTerm;
  const setSearchTerm = onSearchQueryChange ?? setLocalSearchTerm;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Calendar view state
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);

  // Load "On This Day" entries separately
  useEffect(() => {
    if (!user?.uid) return;
    getOnThisDayEntries(user.uid, currentSpaceId).then(setOnThisDayEntries);
  }, [user?.uid, currentSpaceId]);

  // Refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      void loadEntries();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Track last shown error to prevent duplicate toasts
  const lastShownErrorRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);

  // Show error toast (only once per unique error, skip permission errors during initial load)
  useEffect(() => {
    // Skip errors during initial load phase - permission errors are expected when auth is initializing
    if (initialLoadRef.current) {
      if (!loading) {
        initialLoadRef.current = false;
      }
      return;
    }

    // Only show toast for new errors that aren't permission-related
    if (error && error !== lastShownErrorRef.current) {
      // Skip permission-denied errors which are expected during auth transitions
      if (error.toLowerCase().includes('permission') || error.toLowerCase().includes('unauthorized')) {
        return;
      }
      lastShownErrorRef.current = error;
      toast({
        title: 'Error',
        description: error,
        variant: 'error',
      });
    } else if (!error) {
      // Reset when error clears
      lastShownErrorRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading]);

  const filteredEntries = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    let currentEntries = entries;

    // Filter out archived entries (unless we add an archive view later)
    currentEntries = currentEntries.filter(entry => !entry.archived);

    // Date filter from URL
    if (dateFilter) {
      currentEntries = currentEntries.filter(entry => {
        const entryDate = typeof entry.date === 'number'
          ? new Date(entry.date).toISOString().split('T')[0]
          : entry.date;
        return entryDate === dateFilter;
      });
    }

    // Apply toolbar filters
    if (filters) {
      // Mood filter
      if (filters.moods && filters.moods.length > 0) {
        currentEntries = currentEntries.filter(entry =>
          entry.mood && filters.moods!.includes(entry.mood)
        );
      }

      // Color filter
      if (filters.colors && filters.colors.length > 0) {
        currentEntries = currentEntries.filter(entry =>
          filters.colors!.includes(entry.color || 'default')
        );
      }

      // Tag filter from toolbar
      if (filters.tags && filters.tags.length > 0) {
        currentEntries = currentEntries.filter(entry =>
          filters.tags!.some(tag => entry.tags.includes(tag))
        );
      }

      // Date range filter
      if (filters.dateRange?.start || filters.dateRange?.end) {
        const dateField = filters.dateField || 'createdAt';
        currentEntries = currentEntries.filter(entry => {
          // Get the date value based on the field
          let dateValue: Date;
          if (dateField === 'updatedAt') {
            dateValue = new Date(entry.updatedAt);
          } else {
            dateValue = new Date(entry.createdAt);
          }

          if (filters.dateRange?.start && dateValue < filters.dateRange.start) {
            return false;
          }
          if (filters.dateRange?.end && dateValue > filters.dateRange.end) {
            return false;
          }
          return true;
        });
      }

      // Status filter (drafts/published)
      if (filters.status && filters.status !== 'all') {
        currentEntries = currentEntries.filter(entry => {
          if (filters.status === 'drafts') {
            return entry.isDraft === true;
          }
          if (filters.status === 'published') {
            return entry.isDraft !== true;
          }
          return true;
        });
      }
    }

    // Text search filter
    currentEntries = currentEntries.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.title.toLowerCase().includes(search) ||
        plainText(entry.content).toLowerCase().includes(search) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(search));

      // Legacy tag filter from local state (FilterModal)
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => entry.tags.includes(tag));

      return matchesSearch && matchesTags;
    });

    // Sort: pinned entries first, then by sort config
    currentEntries.sort((a, b) => {
      // Pinned entries first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then apply sort config
      const sortField = sort?.field || 'createdAt';
      const sortDir = sort?.direction === 'asc' ? 1 : -1;

      if (sortField === 'title') {
        return sortDir * (a.title || '').localeCompare(b.title || '');
      }

      // Get date values based on sort field
      let aDate: number;
      let bDate: number;
      if (sortField === 'updatedAt') {
        aDate = new Date(a.updatedAt).getTime();
        bDate = new Date(b.updatedAt).getTime();
      } else {
        aDate = new Date(a.createdAt).getTime();
        bDate = new Date(b.createdAt).getTime();
      }
      return sortDir * (aDate - bDate);
    });

    return currentEntries;
  }, [entries, searchTerm, selectedTags, dateFilter, filters, sort]);

  const recentTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.slice(0, 10).forEach((entry) => {
      entry.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [entries]);

  const stats = useMemo(() => {
    return {
      streak: computeStreak(entries),
      weekCount: entries.filter((entry) => {
        const createdAt = new Date(entry.createdAt);
        return Date.now() - createdAt.getTime() <= WEEK_MS;
      }).length,
      cadence: computeCadence(entries),
      averageWords: computeAverageWords(entries),
      mostCommonMood: computeMostCommonMood(entries),
    };
  }, [entries]);

  // Calculate activity data for calendar view (entries per date)
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    // Use filtered entries (excluding archived) for activity data
    const nonArchivedEntries = entries.filter(entry => !entry.archived);
    nonArchivedEntries.forEach((entry) => {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      data[date] = (data[date] || 0) + 1;
    });
    return data;
  }, [entries]);

  // Handle date selection from calendar
  const handleCalendarDateSelect = useCallback((date: Date) => {
    setSelectedCalendarDate(date);
  }, []);

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchTerm('');
  };

  const totalEntries = filteredEntries.length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
          <p className="text-sm text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadEntries}
            className="px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#f97316]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const latestDraft = entries.find((entry) => entry.isDraft) ?? null;
  const latestEntry =
    entries.find((entry) => !entry.isDraft) ?? entries[0] ?? null;

  // Calendar view
  if (viewMode === 'calendar') {
    return (
      <>
        <div className="space-y-6">
          <ActivityCalendar
            activityData={activityData}
            onDateSelect={handleCalendarDateSelect}
            selectedDate={selectedCalendarDate}
            size="large"
            view={calendarView}
            onViewChange={setCalendarView}
          />

          {/* Show entries for selected date */}
          {selectedCalendarDate && (() => {
            const selectedDateStr = selectedCalendarDate.toISOString().split('T')[0];
            const dateEntries = filteredEntries.filter((entry) => {
              const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
              return entryDate === selectedDateStr;
            });
            return dateEntries.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {dateEntries.length} {dateEntries.length === 1 ? 'entry' : 'entries'} on{' '}
                  {selectedCalendarDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <NotebookLiteDashboard
                  userDisplayName={user?.displayName ?? user?.email ?? null}
                  userId={user?.uid}
                  latestEntry={latestEntry}
                  latestDraft={latestDraft}
                  recentTags={recentTags}
                  stats={stats}
                  searchTerm={searchTerm}
                  selectedTags={selectedTags}
                  onSearchTermChange={setSearchTerm}
                  onTagToggle={handleTagSelect}
                  onClearFilters={handleClearFilters}
                  onOpenFilters={() => setShowFilterModal(true)}
                  entries={entries}
                  displayEntries={dateEntries}
                  totalEntries={dateEntries.length}
                  hasMore={false}
                  isLoadingMore={false}
                  onEntryUpdated={loadEntries}
                  isLoadingEntries={loading}
                  onThisDayEntries={[]}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No entries on this date</p>
              </div>
            );
          })()}
        </div>

        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          entries={entries}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onClearAll={handleClearFilters}
        />
      </>
    );
  }

  // List/Masonry view
  return (
    <>
      <NotebookLiteDashboard
        userDisplayName={user?.displayName ?? user?.email ?? null}
        userId={user?.uid}
        latestEntry={latestEntry}
        latestDraft={latestDraft}
        recentTags={recentTags}
        stats={stats}
        searchTerm={searchTerm}
        selectedTags={selectedTags}
        onSearchTermChange={setSearchTerm}
        onTagToggle={handleTagSelect}
        onClearFilters={handleClearFilters}
        onOpenFilters={() => setShowFilterModal(true)}
        entries={entries}
        displayEntries={filteredEntries}
        totalEntries={totalEntries}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        sentinelRef={sentinelRef}
        onEntryUpdated={loadEntries}
        isLoadingEntries={loading}
        onThisDayEntries={onThisDayEntries}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        entries={entries}
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        onClearAll={handleClearFilters}
      />
    </>
  );
}

function computeStreak(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  const daySet = new Set(
    entries.map((entry) => formatDateKey(entry.createdAt)),
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (daySet.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeCadence(entries: JournalEntry[]): number {
  const horizonMs = 28 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - horizonMs;
  const recent = entries.filter((entry) => {
    const createdAt = new Date(entry.createdAt);
    return createdAt.getTime() >= cutoff;
  }).length;
  return recent / 4;
}

function computeAverageWords(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  const totalWords = entries.reduce((sum, entry) => {
    const text = plainText(entry.content);
    if (!text) return sum;
    const words = text.split(/\s+/).filter(Boolean).length;
    return sum + words;
  }, 0);
  return Math.round(totalWords / entries.length);
}

function computeMostCommonMood(entries: JournalEntry[]) {
  const counts = new Map<MoodType, number>();
  entries.forEach((entry) => {
    if (!entry.mood) return;
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  });

  let topMood: MoodType | null = null;
  let max = 0;
  counts.forEach((count, mood) => {
    if (count > max) {
      max = count;
      topMood = mood;
    }
  });

  if (!topMood) {
    return {
      label: 'Mood tracker',
      description: 'Log your mood to surface insights.',
    };
  }

  const tone = POSITIVE_MOODS.has(topMood)
    ? 'Mostly uplifting entries lately.'
    : NEGATIVE_MOODS.has(topMood)
    ? 'Spend a moment grounding yourself today.'
    : 'A balanced tone across your recent writing.';

  return {
    label: getMoodLabel(topMood),
    description: tone,
  };
}

function formatDateKey(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().slice(0, 10);
}
