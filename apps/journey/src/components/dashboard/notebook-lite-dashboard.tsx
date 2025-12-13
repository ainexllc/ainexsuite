import { useMemo, useState, useEffect } from 'react';
import type { JournalEntry } from '@ainexsuite/types';
import { EntriesSection } from '@/components/dashboard/entries-section';
import { OnThisDayCard } from '@/components/dashboard/on-this-day-card';
import { usePersonalizedWelcome } from '@/hooks/usePersonalizedWelcome';
import { getUserSettings, UserSettings } from '@/lib/firebase/settings';
import { cn } from '@/lib/utils';
import { getTheme } from '@/lib/dashboard-themes';
import { JournalComposer } from '@/components/journal/journal-composer';

import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';

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
  currentThemeId?: string;
  onThemeChange?: (themeId: string) => void;
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
  currentThemeId = 'obsidian',
  onThemeChange: _onThemeChange
}: NotebookLiteDashboardProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const theme = useMemo(() => getTheme(currentThemeId), [currentThemeId]);

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

  return (
    <div className={cn("transition-colors duration-500 min-h-screen", theme.font)}>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">


        {/* Space Switcher */}
        <div className="flex items-center gap-4">
          <SpaceSwitcher />
        </div>

        {/* Journal Composer */}
        <JournalComposer onEntryCreated={onEntryUpdated} />

        {/* On This Day - Full Width */}
        {onThisDayEntries.length > 0 && (
          <OnThisDayCard entries={onThisDayEntries} theme={theme} />
        )}

        {/* Entries Section - Full Width */}
        <EntriesSection
          layoutVariant="list"
          entriesToDisplay={paginatedEntries}
          totalEntries={totalEntries}
          searchTerm={searchTerm}
          selectedTags={selectedTags}
          onClearFilters={onClearFilters}
          onEntryUpdated={onEntryUpdated}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isLoadingEntries}
          theme={theme}
        />
      </div>
    </div>
  );
}
