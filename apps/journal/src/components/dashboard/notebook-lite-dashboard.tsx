import { useState, useEffect, RefObject, useCallback } from 'react';
import { Loader2, ArrowUp } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { OnThisDayCard } from '@/components/dashboard/on-this-day-card';
import { JournalBoard } from '@/components/journal/journal-board';
import { usePersonalizedWelcome } from '@/hooks/usePersonalizedWelcome';
import { getUserSettings, UserSettings } from '@/lib/firebase/settings';

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
  displayEntries: JournalEntry[];
  totalEntries: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
  onEntryUpdated: () => void;
  latestEntry?: JournalEntry | null;
  latestDraft?: JournalEntry | null;
  stats: DashboardStats;
  isLoadingEntries: boolean;
  onThisDayEntries: JournalEntry[];
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
  displayEntries,
  totalEntries,
  hasMore,
  isLoadingMore,
  sentinelRef,
  onEntryUpdated,
  latestEntry: _latestEntry,
  latestDraft: _latestDraft,
  stats: _stats,
  isLoadingEntries,
  onThisDayEntries,
}: NotebookLiteDashboardProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Fetch user settings
  useEffect(() => {
    if (userId) {
      getUserSettings(userId).then(setSettings);
    }
  }, [userId]);

  // Track scroll position for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get personalized welcome message based on recent entries
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isLoading: _isLoadingWelcome } = usePersonalizedWelcome({
    userName: userDisplayName ?? null,
    recentEntries: entries.filter((entry) => !entry.isDraft),
    enabled: entries.length > 0 && settings?.privacy?.personalizedWelcome === true,
  });

  const hasFilters = searchTerm.length > 0 || selectedTags.length > 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 pb-20">
        {/* On This Day - Full Width */}
        {onThisDayEntries.length > 0 && <OnThisDayCard entries={onThisDayEntries} />}

        {/* Journal Board with Pinned Section */}
        <JournalBoard
          entries={displayEntries}
          loading={isLoadingEntries}
          onEntryUpdated={onEntryUpdated}
          searchTerm={searchTerm}
          hasFilters={hasFilters}
          onClearFilters={onClearFilters}
        />

        {/* Infinite scroll sentinel and loading indicator */}
        {sentinelRef && (
          <div ref={sentinelRef} className="h-4" aria-hidden="true" />
        )}

        {isLoadingMore && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading more entries...</span>
          </div>
        )}

        {/* End of entries indicator */}
        {!isLoadingEntries && !isLoadingMore && !hasMore && totalEntries > 0 && (
          <div className="flex items-center justify-center py-4">
            <span className="text-xs text-muted-foreground">
              {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        )}
      </div>

      {/* Back to Top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
