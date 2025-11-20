import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  Clock3,
  Flame,
  PenLine,
  Plus,
  Sparkles,
  Tag,
  Zap,
  Cloud,
  Paintbrush
} from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { EntriesSection } from '@/components/dashboard/entries-section';
import { OnThisDayCard } from '@/components/dashboard/on-this-day-card';
import { usePersonalizedWelcome } from '@/hooks/usePersonalizedWelcome';
import { getUserSettings, updatePrivacySettings, UserSettings } from '@/lib/firebase/settings';
import { plainText } from '@/lib/utils/text';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import { ThemedPanel } from '@/components/dashboard/themed-panel';
import { DASHBOARD_THEMES, getTheme, DashboardTheme } from '@/lib/dashboard-themes';

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
  latestEntry?: JournalEntry | null;
  latestDraft?: JournalEntry | null;
  onThisDayEntries: JournalEntry[];
  recentTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onOpenFilters: () => void;
  theme: DashboardTheme;
}

const IDEA_SUGGESTIONS = [
  { id: '1', type: 'prompt', title: 'Reflect on Calm', description: 'When did you last feel truly at peace?', icon: Cloud },
  { id: '2', type: 'goal', title: 'Weekly Goal', description: 'Review your progress on "Morning Pages".', icon: Zap },
  { id: '3', type: 'memory', title: 'On This Day', description: '1 year ago: "First day at the new job..."', icon: CalendarCheck2 },
];

function LargeScreenOverview({
  stats,
  wroteToday,
  latestEntry,
  latestDraft,
  onThisDayEntries,
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
  theme,
}: OverviewProps) {
  return (
    <div className="sticky top-28 hidden h-fit flex-col gap-6 xl:flex">
      <DashboardStatsCard stats={stats} wroteToday={wroteToday} theme={theme} />
      <LatestEntryCardLarge latestEntry={latestEntry} latestDraft={latestDraft} theme={theme} />
      {onThisDayEntries.length > 0 && <OnThisDayCard entries={onThisDayEntries} />}
      <TagQuickActionsCard
        recentTags={recentTags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        onOpenFilters={onOpenFilters}
        theme={theme}
      />
    </div>
  );
}

function MobileOverview({
  stats,
  wroteToday,
  latestEntry,
  latestDraft,
  onThisDayEntries,
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
  theme,
}: OverviewProps) {
  return (
    <div className="space-y-4 xl:hidden">
      <MobileStatsCard stats={stats} wroteToday={wroteToday} theme={theme} />
      <MobileLatestEntryCard latestEntry={latestEntry} latestDraft={latestDraft} theme={theme} />
      {onThisDayEntries.length > 0 && <OnThisDayCard entries={onThisDayEntries} />}
      <MobileTagsCard
        recentTags={recentTags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        onOpenFilters={onOpenFilters}
        theme={theme}
      />
    </div>
  );
}

function DashboardStatsCard({
  stats,
  wroteToday: _wroteToday,
  theme,
}: {
  stats: DashboardStats;
  wroteToday: boolean;
  theme: DashboardTheme;
}) {
  const metrics = [
    {
      id: 'streak',
      label: 'Active streak',
      value: stats.streak > 0 ? `${stats.streak} day${stats.streak === 1 ? '' : 's'}` : 'Start today',
      description: _wroteToday
        ? 'You already wrote today.'
        : 'Log something today.',
      icon: Flame,
    },
    {
      id: 'weekCount',
      label: 'Entries this week',
      value: stats.weekCount,
      description: 'Weekly volume.',
      icon: CalendarCheck2,
    },
    {
      id: 'cadence',
      label: 'Avg cadence',
      value: stats.cadence > 0 ? `${stats.cadence.toFixed(1)} / wk` : '—',
      description: 'Entries per week.',
      icon: Clock3,
    },
    {
      id: 'averageWords',
      label: 'Avg words',
      value: stats.averageWords > 0 ? stats.averageWords : '—',
      description: 'Typical length.',
      icon: BarChart3,
    },
  ];

  return (
    <ThemedPanel theme={theme} className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={cn("text-lg font-semibold", theme.textPrimary)}>Writing health</h3>
          <p className={cn("mt-1 text-sm", theme.textSecondary)}>
            Monitor momentum across your archive.
          </p>
        </div>
        <Flame className={cn("h-6 w-6", theme.accent)} />
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className={cn("p-4 backdrop-blur-sm rounded-xl border", theme.bgSurface, theme.border)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-[10px] font-bold uppercase tracking-wide", theme.textSecondary)}>
                  {metric.label}
                </span>
                <Icon className={cn("h-3.5 w-3.5", theme.textSecondary)} />
              </div>
              <div className={cn("mt-2 text-base font-semibold", theme.textPrimary)}>
                {metric.value}
              </div>
              <p className={cn("mt-1 text-xs line-clamp-1", theme.textSecondary)}>{metric.description}</p>
            </div>
          );
        })}

        <div className={cn("col-span-2 p-4 rounded-xl border", theme.accentBg, theme.id === 'cyber' ? 'border-fuchsia-500/20' : 'border-transparent')}>
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-[10px] font-bold uppercase tracking-wide", theme.accent)}>
              Mood trend
            </span>
            <Sparkles className={cn("h-3.5 w-3.5", theme.accent)} />
          </div>
          <div className={cn("mt-2 text-base font-semibold", theme.textPrimary)}>
            {stats.mostCommonMood.label}
          </div>
          <p className={cn("mt-1 text-xs", theme.textSecondary)}>
            {stats.mostCommonMood.description}
          </p>
        </div>
      </dl>
    </ThemedPanel>
  );
}

function LatestEntryCardLarge({
  latestEntry,
  latestDraft: _latestDraft,
  theme,
}: {
  latestEntry?: JournalEntry | null;
  latestDraft?: JournalEntry | null;
  theme: DashboardTheme;
}) {
  const showDraft =
    _latestDraft && (!latestEntry || latestEntry.id !== _latestDraft.id);

  return (
    <ThemedPanel theme={theme} hover={true} className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={cn("text-lg font-semibold", theme.textPrimary)}>Latest entry</h3>
          <p className={cn("mt-1 text-sm", theme.textSecondary)}>
            Jump back into your most recent reflections.
          </p>
        </div>
        <BookOpen className={cn("h-6 w-6", theme.textSecondary)} />
      </div>

      {latestEntry ? (
        <div className="mt-5 space-y-4">
          <div>
            <p className={cn("text-xs uppercase tracking-wide", theme.textSecondary)}>
              {formatDate(new Date(latestEntry.createdAt))}
            </p>
            <p className={cn("mt-1 text-base font-semibold line-clamp-1", theme.textPrimary)}>
              {latestEntry.title || 'Untitled entry'}
            </p>
            <p className={cn("mt-2 text-sm leading-relaxed line-clamp-5", theme.textSecondary)}>
              {getEntryPreview(latestEntry, 320)}
            </p>
          </div>
          <div className={cn("flex flex-wrap gap-2 text-xs", theme.textSecondary)}>
            {latestEntry.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={cn("rounded-full px-2 py-1 border", theme.bgSurface, theme.border)}
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/workspace/${latestEntry.id}/view`}
              className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition", theme.border, theme.textPrimary, theme.bgHover)}
            >
              Preview
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/workspace/${latestEntry.id}`}
              className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition", theme.bgSurface, theme.textPrimary, theme.bgHover)}
            >
              Open editor
              <PenLine className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className={cn("mt-5 rounded-2xl border border-dashed p-5 text-sm", theme.border, theme.textSecondary)}>
          Nothing published yet. Start a new entry to see it here.
        </div>
      )}

      {showDraft ? (
        <div className={cn("mt-6 rounded-2xl border p-4", theme.border, theme.bgSurface)}>
          <p className={cn("text-xs uppercase tracking-wide", theme.accent)}>
            In progress
          </p>
          <p className={cn("mt-1 text-sm font-semibold line-clamp-1", theme.textPrimary)}>
            {_latestDraft?.title || 'Untitled draft'}
          </p>
          <Link
            href={`/workspace/${_latestDraft?.id}`}
            className={cn("mt-3 inline-flex items-center gap-2 text-xs font-semibold transition hover:underline", theme.accent)}
          >
            Resume draft
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </ThemedPanel>
  );
}

function TagQuickActionsCard({
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
  theme,
}: {
  recentTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onOpenFilters: () => void;
  theme: DashboardTheme;
}) {
  return (
    <ThemedPanel theme={theme} className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={cn("text-lg font-semibold", theme.textPrimary)}>Quick filters</h3>
          <p className={cn("mt-1 text-sm", theme.textSecondary)}>
            Pull up themes without leaving the page.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition", theme.border, theme.textPrimary, theme.bgHover)}
        >
          <Tag className="h-3.5 w-3.5" />
          Filters
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {recentTags.length ? (
          recentTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagToggle(tag)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                selectedTags.includes(tag)
                  ? cn(theme.accentBg, theme.accent, 'border-transparent')
                  : cn(theme.border, theme.bgSurface, theme.textSecondary, theme.bgHover),
              )}
            >
              #{tag}
            </button>
          ))
        ) : (
          <p className={cn("text-sm", theme.textSecondary)}>
            Add tags to entries to unlock quick filters.
          </p>
        )}
      </div>
    </ThemedPanel>
  );
}

function MobileStatsCard({
  stats,
  wroteToday: _wroteToday,
  theme,
}: {
  stats: DashboardStats;
  wroteToday: boolean;
  theme: DashboardTheme;
}) {
  return (
    <ThemedPanel theme={theme} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={cn("text-base font-semibold", theme.textPrimary)}>Snapshot</h3>
          <p className={cn("text-xs", theme.textSecondary)}>
            Keep tabs on your writing streak.
          </p>
        </div>
        <Flame className={cn("h-5 w-5", theme.accent)} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className={cn("text-xs uppercase tracking-wide", theme.textSecondary)}>
            Streak
          </p>
          <p className={cn("mt-1 text-base font-semibold", theme.textPrimary)}>
            {stats.streak > 0 ? `${stats.streak}d` : '—'}
          </p>
        </div>
        <div>
          <p className={cn("text-xs uppercase tracking-wide", theme.textSecondary)}>
            This week
          </p>
          <p className={cn("mt-1 text-base font-semibold", theme.textPrimary)}>
            {stats.weekCount}
          </p>
        </div>
      </div>
    </ThemedPanel>
  );
}

function MobileLatestEntryCard({
  latestEntry,
  latestDraft: _latestDraft,
  theme,
}: {
  latestEntry?: JournalEntry | null;
  latestDraft?: JournalEntry | null;
  theme: DashboardTheme;
}) {
  return (
    <ThemedPanel theme={theme} className="p-4">
      <div className="flex items-center justify-between">
        <h3 className={cn("text-base font-semibold", theme.textPrimary)}>Latest entry</h3>
        <BookOpen className={cn("h-5 w-5", theme.textSecondary)} />
      </div>
      {latestEntry ? (
        <>
          <p className={cn("mt-1 text-xs uppercase tracking-wide", theme.textSecondary)}>
            {formatRelativeTime(new Date(latestEntry.createdAt))}
          </p>
          <p className={cn("mt-1 text-sm font-semibold", theme.textPrimary)}>
            {latestEntry.title || 'Untitled entry'}
          </p>
          <p className={cn("mt-2 text-sm line-clamp-4", theme.textSecondary)}>
            {getEntryPreview(latestEntry, 200)}
          </p>
          <div className="mt-3 flex gap-2 text-xs">
            <Link
              href={`/workspace/${latestEntry.id}/view`}
              className={cn("flex-1 rounded-full border px-3 py-2 text-center font-semibold transition", theme.border, theme.textPrimary, theme.bgHover)}
            >
              Preview
            </Link>
            <Link
              href={`/workspace/${latestEntry.id}`}
              className={cn("flex-1 rounded-full px-3 py-2 text-center font-semibold transition", theme.bgSurface, theme.textPrimary, theme.bgHover)}
            >
              Edit
            </Link>
          </div>
        </>
      ) : (
        <p className={cn("mt-3 text-sm", theme.textSecondary)}>
          Create your first entry to see it here.
        </p>
      )}
    </ThemedPanel>
  );
}

function MobileTagsCard({
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
  theme,
}: {
  recentTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onOpenFilters: () => void;
  theme: DashboardTheme;
}) {
  return (
    <ThemedPanel theme={theme} className="p-4">
      <div className="flex items-center justify-between">
        <h3 className={cn("text-base font-semibold", theme.textPrimary)}>Tags</h3>
        <button
          type="button"
          onClick={onOpenFilters}
          className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition", theme.border, theme.textPrimary, theme.bgHover)}
        >
          <Tag className="h-3 w-3" />
          Filters
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {recentTags.length ? (
          recentTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagToggle(tag)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                selectedTags.includes(tag)
                  ? cn(theme.accentBg, theme.accent, 'border-transparent')
                  : cn(theme.border, theme.bgSurface, theme.textSecondary, theme.bgHover),
              )}
            >
              #{tag}
            </button>
          ))
        ) : (
          <p className={cn("text-sm", theme.textSecondary)}>
            Tag entries as you save them to build quick filters.
          </p>
        )}
      </div>
    </ThemedPanel>
  );
}

function getEntryPreview(entry: JournalEntry, limit = 180): string {
  const text = plainText(entry.content ?? '');
  if (!text) {
    return 'No body text saved for this entry yet.';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).trimEnd()}…`;
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

const LOADING_MESSAGES = [
  { title: 'Reading your journal entries...', subtitle: 'Analyzing your recent thoughts and reflections' },
  { title: 'Identifying patterns and themes...', subtitle: 'Looking for connections across your entries' },
  { title: 'Crafting your personalized message...', subtitle: 'Writing something meaningful just for you' },
];

export function NotebookLiteDashboard({
  userDisplayName,
  userId,
  searchTerm,
  selectedTags,
  recentTags,
  onSearchTermChange: _onSearchTermChange,
  onTagToggle,
  onClearFilters,
  onOpenFilters,
  entries,
  paginatedEntries,
  totalEntries,
  totalPages,
  page,
  onPageChange,
  onEntryUpdated,
  latestEntry,
  latestDraft,
  stats,
  isLoadingEntries,
  onThisDayEntries,
  currentThemeId = 'obsidian',
  onThemeChange
}: NotebookLiteDashboardProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(0);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

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
  const { welcomeMessage, isLoading: isLoadingWelcome } = usePersonalizedWelcome({
    userName: userDisplayName ?? null,
    recentEntries: entries.filter((entry) => !entry.isDraft),
    enabled: entries.length > 0 && settings?.privacy?.personalizedWelcome === true,
  });

  // Progressive loading messages
  // const loadingMessages = ... (removed)

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoadingWelcome) {
      setLoadingMessage(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessage((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoadingWelcome]);

  // Handle enabling personalized welcome
  const handleEnableWelcome = async () => {
    if (!userId || !settings) return;

    try {
      await updatePrivacySettings(userId, {
        ...settings.privacy,
        personalizedWelcome: true,
      });
      setSettings({
        ...settings,
        privacy: {
          ...settings.privacy,
          personalizedWelcome: true,
        },
      });
    } catch (error) {
      // Ignore update error
    }
  };

  return (
    <div className={cn("transition-colors duration-500 min-h-screen", theme.bg, theme.font)}>
      <div className="space-y-12 pb-20 max-w-7xl mx-auto">
        <ThemedPanel theme={theme} className="p-8 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-8">
           {/* Theme Specific Background Effects */}
           {theme.id === 'obsidian' && <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />}
           {theme.id === 'cyber' && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />}

           <div className="space-y-4 relative z-10 flex-1">
             <div className="flex items-center gap-4">
                <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit", theme.accentBg, theme.accent)}>
                   <Sparkles className="h-3 w-3" /> Notebook Lite
                </div>
                
                {/* THEME CHANGER */}
                <div className="relative">
                   <button 
                     onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                     className={cn("p-1.5 rounded-full transition-colors", theme.textSecondary, theme.bgHover)}
                     title="Change Theme"
                   >
                      <Paintbrush className="h-3.5 w-3.5" />
                   </button>
                   {isThemeMenuOpen && (
                      <div className="absolute top-8 left-0 z-50 bg-black border border-white/10 rounded-xl p-2 w-48 shadow-xl backdrop-blur-xl grid grid-cols-1 gap-1">
                         {DASHBOARD_THEMES.map(t => (
                            <button
                               key={t.id}
                               onClick={() => { onThemeChange?.(t.id); setIsThemeMenuOpen(false); }}
                               className={cn(
                                 "text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                                 currentThemeId === t.id ? "bg-white text-black" : "text-gray-400 hover:bg-white/10 hover:text-white"
                               )}
                            >
                               {t.name}
                            </button>
                         ))}
                      </div>
                   )}
                </div>
             </div>

            <h1 className={cn("text-3xl font-semibold sm:text-4xl", theme.textPrimary)}>
              Welcome back{userDisplayName ? `, ${userDisplayName.split(' ')[0]}` : ''}.
            </h1>
            {isLoadingWelcome ? (
              <div className={cn("relative overflow-hidden rounded-2xl border p-6", theme.border, theme.bgSurface)}>
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className={cn("absolute inset-0 animate-ping rounded-full opacity-30", theme.accentBg)} />
                      <Sparkles className={cn("relative h-6 w-6 animate-pulse", theme.accent)} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="transition-all duration-500">
                      <p className={cn("text-base font-semibold", theme.textPrimary)}>
                        {LOADING_MESSAGES[loadingMessage].title}
                      </p>
                      <p className={cn("mt-1.5 text-sm", theme.textSecondary)}>
                        {LOADING_MESSAGES[loadingMessage].subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : welcomeMessage ? (
              <div className={cn("relative rounded-2xl border p-6", theme.border, theme.bgSurface)}>
                <div className="absolute right-4 top-4">
                  <Sparkles className={cn("h-4 w-4 opacity-40", theme.accent)} />
                </div>
                <div className="space-y-3 pr-8">
                  {welcomeMessage.split('\n\n').slice(0, 3).map((paragraph, idx) => (
                    <p
                      key={idx}
                      className={cn("text-sm leading-relaxed", idx === 0 ? theme.textPrimary : theme.textSecondary)}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : settings && !settings.privacy?.personalizedWelcome && entries.length > 0 ? (
              <div className={cn("flex items-center justify-between gap-4 rounded-lg border p-3", theme.border, theme.bgSurface)}>
                <p className={cn("text-sm", theme.textPrimary)}>
                  Get personalized welcome messages based on your recent entries?
                </p>
                <button
                  onClick={handleEnableWelcome}
                  className={cn("rounded-full px-4 py-1.5 text-xs font-semibold transition", theme.accentBg, theme.accent, theme.bgHover)}
                >
                  Enable
                </button>
              </div>
            ) : (
              <p className={cn("text-sm", theme.textSecondary)}>
                Move from an idea to a saved entry in seconds.
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 relative z-10">
              <Link
                href="/workspace/new"
                className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5", 
                    theme.id === 'wireframe' ? 'border border-white text-white hover:bg-white hover:text-black' : 
                    theme.id === 'cyber' ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]' :
                    'bg-white text-black hover:bg-gray-200 shadow-lg'
                )}
              >
                <Plus className="h-4 w-4" />
                New entry
              </Link>
              {latestDraft ? (
                <Link
                  href={`/workspace/${latestDraft.id}`}
                  className={cn("inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition", theme.border, theme.textPrimary, theme.bgHover)}
                >
                  <PenLine className="h-4 w-4" />
                  Resume draft
                </Link>
              ) : null}
            </div>
        </ThemedPanel>

        {/* IDEA SUGGESTIONS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {IDEA_SUGGESTIONS.map((idea) => (
            <ThemedPanel key={idea.id} theme={theme} hover={true} className="p-4 flex flex-col justify-between h-32">
               <div className="flex justify-between items-start">
                  <div className={cn("p-2 rounded-lg", theme.bgSurface, theme.textSecondary)}>
                     <idea.icon className="w-5 h-5" />
                  </div>
                  {idea.type === 'prompt' && <span className={cn("text-[10px] font-bold uppercase", theme.accent)}>Daily</span>}
               </div>
               <div>
                  <h4 className={cn("font-semibold mb-1", theme.textPrimary)}>{idea.title}</h4>
                  <p className={cn("text-xs line-clamp-2", theme.textSecondary)}>{idea.description}</p>
               </div>
            </ThemedPanel>
          ))}
        </div>

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
          <div className="space-y-6">
            <MobileOverview
              stats={stats}
              wroteToday={wroteToday}
              latestEntry={latestEntry}
              latestDraft={latestDraft}
              onThisDayEntries={onThisDayEntries}
              recentTags={recentTags}
              selectedTags={selectedTags}
              onTagToggle={onTagToggle}
              onOpenFilters={onOpenFilters}
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
            latestEntry={latestEntry}
            latestDraft={latestDraft}
            onThisDayEntries={onThisDayEntries}
            recentTags={recentTags}
            selectedTags={selectedTags}
            onTagToggle={onTagToggle}
            onOpenFilters={onOpenFilters}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
