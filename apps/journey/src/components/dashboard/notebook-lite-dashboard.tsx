import { useMemo, useState, useEffect } from 'react';
import type { JournalEntry } from '@ainexsuite/types';
import { EntriesSection } from '@/components/dashboard/entries-section';
import { OnThisDayCard } from '@/components/dashboard/on-this-day-card';
import { usePersonalizedWelcome } from '@/hooks/usePersonalizedWelcome';
import { getUserSettings, UserSettings } from '@/lib/firebase/settings';
import { cn } from '@/lib/utils';
import { getTheme, DashboardTheme } from '@/lib/dashboard-themes';
import { JournalComposer } from '@/components/journal/journal-composer';
import { JournalInsights } from '@/components/journal/journal-insights';

interface DashboardStats {
  streak: number;
  weekCount: number;
  cadence: number;
  averageWords: number;
  mostCommonMood: { label: string; description: string };
}

interface OverviewProps {
  stats: DashboardStats;
  wroteToday: boolean;
  onThisDayEntries: JournalEntry[];
  entries: JournalEntry[];
  theme: DashboardTheme;
}

function LargeScreenOverview({
  onThisDayEntries,
  entries,
  theme,
}: OverviewProps) {
  return (
    <div className="sticky top-28 hidden h-fit flex-col gap-6 xl:flex">
      <JournalInsights entries={entries} variant="sidebar" />
      {onThisDayEntries.length > 0 && <OnThisDayCard entries={onThisDayEntries} theme={theme} />}
    </div>
  );
}

function MobileOverview({
  onThisDayEntries,
  entries,
  theme,
}: OverviewProps) {
  return (
    <div className="space-y-4 xl:hidden">
      <JournalInsights entries={entries} variant="sidebar" />
      {onThisDayEntries.length > 0 && <OnThisDayCard entries={onThisDayEntries} theme={theme} />}
    </div>
  );
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
  latestEntry,
  latestDraft: _latestDraft,
  stats,
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

  const wroteToday = useMemo(() => {
    if (!latestEntry) return false;
    const created = new Date(latestEntry.createdAt);
    const today = new Date();
    return created.getFullYear() === today.getFullYear()
      && created.getMonth() === today.getMonth()
      && created.getDate() === today.getDate();
  }, [latestEntry]);

  // Get personalized welcome message based on recent entries
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isLoading: isLoadingWelcome } = usePersonalizedWelcome({
    userName: userDisplayName ?? null,
    recentEntries: entries.filter((entry) => !entry.isDraft),
    enabled: entries.length > 0 && settings?.privacy?.personalizedWelcome === true,
  });

  return (
    <div className={cn("transition-colors duration-500 min-h-screen", theme.font)}>
      <div className="space-y-12 pb-20 max-w-7xl mx-auto">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
          <div className="space-y-6">
            <JournalComposer onEntryCreated={onEntryUpdated} />

            <MobileOverview
              stats={stats}
              wroteToday={wroteToday}
              onThisDayEntries={onThisDayEntries}
              entries={entries}
              theme={theme}
            />

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

          <LargeScreenOverview
            stats={stats}
            wroteToday={wroteToday}
            onThisDayEntries={onThisDayEntries}
            entries={entries}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
