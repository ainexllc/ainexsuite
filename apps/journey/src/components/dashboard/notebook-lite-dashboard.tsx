import { useState, useEffect } from 'react';
import type { JournalEntry } from '@ainexsuite/types';
import { OnThisDayCard } from '@/components/dashboard/on-this-day-card';
import { JournalBoard } from '@/components/journal/journal-board';
import { usePersonalizedWelcome } from '@/hooks/usePersonalizedWelcome';
import { getUserSettings, UserSettings } from '@/lib/firebase/settings';

type ViewMode = 'list' | 'masonry' | 'calendar';

interface DashboardStats {
  streak: number;
  weekCount: number;
  cadence: number;
  averageWords: number;
  mostCommonMood: { label: string; description: string };
}

interface NotebookLiteDashboardProps {
  userDisplayName?: string | null;
  userId?: string;
  searchTerm: string;
  selectedTags: string[];
  recentTags: string[];
  onSearchTermChange: (value: string) => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  onOpenFilters: () => void;
  entries: JournalEntry[];
  paginatedEntries: JournalEntry[];
  totalEntries: number;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onEntryUpdated: () => void;
  latestEntry?: JournalEntry | null;
  latestDraft?: JournalEntry | null;
  stats: DashboardStats;
  isLoadingEntries: boolean;
  onThisDayEntries: JournalEntry[];
  viewMode?: ViewMode;
}

export function NotebookLiteDashboard({
  userDisplayName,
  userId,
  searchTerm,
  selectedTags,
  recentTags: _recentTags,
  onSearchTermChange: _onSearchTermChange,
  onTagToggle: _onTagToggle,
  onClearFilters,
  onOpenFilters: _onOpenFilters,
  entries,
  paginatedEntries,
  totalEntries,
  totalPages,
  page,
  onPageChange,
  onEntryUpdated,
  latestEntry: _latestEntry,
  latestDraft: _latestDraft,
  stats: _stats,
  isLoadingEntries,
  onThisDayEntries,
  viewMode = 'masonry',
}: NotebookLiteDashboardProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Fetch user settings
  useEffect(() => {
    if (userId) {
      getUserSettings(userId).then(setSettings);
    }
  }, [userId]);

  // Get personalized welcome message based on recent entries
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isLoading: _isLoadingWelcome } = usePersonalizedWelcome({
    userName: userDisplayName ?? null,
    recentEntries: entries.filter((entry) => !entry.isDraft),
    enabled: entries.length > 0 && settings?.privacy?.personalizedWelcome === true,
  });

  const hasFilters = searchTerm.length > 0 || selectedTags.length > 0;

  return (
    <div className="min-h-screen transition-colors duration-500">
      <div className="mx-auto max-w-7xl space-y-6 pb-20">
        {/* On This Day - Full Width */}
        {onThisDayEntries.length > 0 && <OnThisDayCard entries={onThisDayEntries} />}

        {/* Journal Board with Pinned Section */}
        <JournalBoard
          entries={paginatedEntries}
          viewMode={viewMode}
          loading={isLoadingEntries}
          onEntryUpdated={onEntryUpdated}
          searchTerm={searchTerm}
          hasFilters={hasFilters}
          onClearFilters={onClearFilters}
        />

        {/* Pagination */}
        {!isLoadingEntries && totalPages > 1 && (
          <div className="flex items-center justify-between rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              className="rounded-full px-3 py-1 text-sm font-semibold text-muted-foreground transition hover:bg-accent/10 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs">
              Page {page + 1} of {totalPages} ({totalEntries} entries)
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              className="rounded-full px-3 py-1 text-sm font-semibold text-muted-foreground transition hover:bg-accent/10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
