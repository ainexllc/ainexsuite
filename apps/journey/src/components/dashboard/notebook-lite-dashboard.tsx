'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  Clock3,
  Flame,
  Loader2,
  PenLine,
  Plus,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { EntriesSection } from '@/components/dashboard/entries-section';
import { IdeaSparkCard } from '@/components/journal/idea-spark-card';
import { usePersonalizedWelcome } from '@/hooks/usePersonalizedWelcome';
import { getUserSettings, updatePrivacySettings, UserSettings } from '@/lib/firebase/settings';
import { Card } from '@/components/ui/card';
import { plainText } from '@/lib/utils/text';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

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
  recentTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onOpenFilters: () => void;
}

function LargeScreenOverview({
  stats,
  wroteToday,
  latestEntry,
  latestDraft,
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
}: OverviewProps) {
  return (
    <div className="sticky top-28 hidden h-fit flex-col gap-6 xl:flex">
      <DashboardStatsCard stats={stats} wroteToday={wroteToday} />
      <LatestEntryCardLarge latestEntry={latestEntry} latestDraft={latestDraft} />
      <TagQuickActionsCard
        recentTags={recentTags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        onOpenFilters={onOpenFilters}
      />
    </div>
  );
}

function MobileOverview({
  stats,
  wroteToday,
  latestEntry,
  latestDraft,
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
}: OverviewProps) {
  return (
    <div className="space-y-4 xl:hidden">
      <MobileStatsCard stats={stats} wroteToday={wroteToday} />
      <MobileLatestEntryCard latestEntry={latestEntry} latestDraft={latestDraft} />
      <MobileTagsCard
        recentTags={recentTags}
        selectedTags={selectedTags}
        onTagToggle={onTagToggle}
        onOpenFilters={onOpenFilters}
      />
    </div>
  );
}

function DashboardStatsCard({
  stats,
  wroteToday,
}: {
  stats: DashboardStats;
  wroteToday: boolean;
}) {
  const metrics = [
    {
      id: 'streak',
      label: 'Active streak',
      value: stats.streak > 0 ? `${stats.streak} day${stats.streak === 1 ? '' : 's'}` : 'Start today',
      description: wroteToday
        ? 'You already wrote today—nice work.'
        : 'Log something today to spark a streak.',
      icon: Flame,
    },
    {
      id: 'weekCount',
      label: 'Entries this week',
      value: stats.weekCount,
      description:
        stats.weekCount >= 4
          ? 'Consistent rhythm this week.'
          : 'Aim for four entries to settle into flow.',
      icon: CalendarCheck2,
    },
    {
      id: 'cadence',
      label: 'Avg cadence',
      value: stats.cadence > 0 ? `${stats.cadence.toFixed(1)} / wk` : '—',
      description: 'Entries per week measured over 28 days.',
      icon: Clock3,
    },
    {
      id: 'averageWords',
      label: 'Avg words',
      value: stats.averageWords > 0 ? stats.averageWords : '—',
      description:
        stats.averageWords > 0
          ? 'Typical entry length.'
          : 'Longer notes surface deeper insights.',
      icon: BarChart3,
    },
  ];

  return (
    <Card className="relative w-full overflow-hidden border-theme-border bg-theme-surface p-6 shadow-[0_30px_80px_-45px_rgba(249,115,22,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#f97316]/10 via-transparent to-transparent" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-theme-text">Writing health</h3>
            <p className="mt-1 text-sm text-theme-text-muted">
              Monitor momentum across your archive.
            </p>
          </div>
          <Flame className="h-6 w-6 text-[#f97316]/80" />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                className="rounded-2xl border border-theme-border bg-theme-hover p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-theme-text-muted">
                    {metric.label}
                  </span>
                  <Icon className="h-4 w-4 text-[#f97316]/70" />
                </div>
                <div className="mt-2 text-base font-semibold text-theme-text">
                  {metric.value}
                </div>
                <p className="mt-1 text-xs text-theme-text-muted">{metric.description}</p>
              </div>
            );
          })}

          <div className="col-span-2 rounded-2xl border border-[#f97316]/20 bg-[#f97316]/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#f97316] dark:text-[#f97316]/80">
                Mood trend
              </span>
              <Sparkles className="h-4 w-4 text-[#f97316] dark:text-[#f97316]/80" />
            </div>
            <div className="mt-2 text-base font-semibold text-theme-text">
              {stats.mostCommonMood.label}
            </div>
            <p className="mt-1 text-xs text-theme-text-muted">
              {stats.mostCommonMood.description}
            </p>
          </div>
        </dl>
      </div>
    </Card>
  );
}

function LatestEntryCardLarge({
  latestEntry,
  latestDraft,
}: {
  latestEntry?: JournalEntry | null;
  latestDraft?: JournalEntry | null;
}) {
  const showDraft =
    latestDraft && (!latestEntry || latestEntry.id !== latestDraft.id);

  return (
    <Card className="relative w-full overflow-hidden border-theme-border bg-theme-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-theme-text">Latest entry</h3>
          <p className="mt-1 text-sm text-theme-text-muted">
            Jump back into your most recent reflections.
          </p>
        </div>
        <BookOpen className="h-6 w-6 text-[#f97316]/70" />
      </div>

      {latestEntry ? (
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-theme-text-muted">
              {formatDate(latestEntry.createdAt)}
            </p>
            <p className="mt-1 text-base font-semibold text-theme-text line-clamp-1">
              {latestEntry.title || 'Untitled entry'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-theme-text-muted line-clamp-5">
              {getEntryPreview(latestEntry, 320)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-theme-text-muted">
            {latestEntry.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-theme-border bg-theme-hover px-2 py-1"
              >
                #{tag}
              </span>
            ))}
            {latestEntry.tags.length === 0 && (
              <span className="rounded-full border border-dashed border-theme-border px-2 py-1">
                No tags yet
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/workspace/${latestEntry.id}/view`}
              className="inline-flex items-center gap-2 rounded-full border border-theme-border px-4 py-2 text-xs font-semibold text-theme-text transition hover:border-[#f97316]/70 hover:text-[#f97316]"
            >
              Preview
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/workspace/${latestEntry.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff8a3d]"
            >
              Open editor
              <PenLine className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-theme-border bg-theme-hover p-5 text-sm text-theme-text-muted">
          Nothing published yet. Start a new entry to see it here.
        </div>
      )}

      {showDraft ? (
        <div className="mt-6 rounded-2xl border border-[#f97316]/20 bg-[#f97316]/10 p-4">
          <p className="text-xs uppercase tracking-wide text-[#f97316] dark:text-[#f97316]/70">
            In progress
          </p>
          <p className="mt-1 text-sm font-semibold text-theme-text line-clamp-1">
            {latestDraft?.title || 'Untitled draft'}
          </p>
          <p className="mt-1 text-xs text-theme-text-muted line-clamp-2">
            {latestDraft ? getEntryPreview(latestDraft, 140) : ''}
          </p>
          <Link
            href={`/workspace/${latestDraft?.id}`}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#f97316] transition hover:text-[#ff8a3d]"
          >
            Resume draft
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </Card>
  );
}

function TagQuickActionsCard({
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
}: {
  recentTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onOpenFilters: () => void;
}) {
  return (
    <Card className="relative w-full overflow-hidden border-theme-border bg-theme-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-theme-text">Quick filters</h3>
          <p className="mt-1 text-sm text-theme-text-muted">
            Pull up themes without leaving the page.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-2 rounded-full border border-theme-border px-3 py-1.5 text-xs font-semibold text-theme-text transition hover:border-[#f97316]/70 hover:text-[#f97316]"
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
                  ? 'border-[#f97316]/80 bg-[#f97316]/20 text-theme-text'
                  : 'border-theme-border bg-theme-hover text-theme-text-muted hover:border-[#f97316]/40 hover:text-[#f97316]',
              )}
            >
              #{tag}
            </button>
          ))
        ) : (
          <p className="text-sm text-theme-text-muted">
            Add tags to entries to unlock quick filters.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-theme-border bg-theme-hover p-4 text-xs text-theme-text-muted">
        Hold <span className="font-semibold text-theme-text">Shift</span> while toggling tags to select several in a row.
      </div>
    </Card>
  );
}

function MobileStatsCard({
  stats,
  wroteToday,
}: {
  stats: DashboardStats;
  wroteToday: boolean;
}) {
  return (
    <Card className="border-theme-border bg-theme-surface p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-theme-text">Snapshot</h3>
          <p className="text-xs text-theme-text-muted">
            Keep tabs on your writing streak.
          </p>
        </div>
        <Flame className="h-5 w-5 text-[#f97316]/80" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-theme-text-muted">
            Streak
          </p>
          <p className="mt-1 text-base font-semibold text-theme-text">
            {stats.streak > 0 ? `${stats.streak}d` : '—'}
          </p>
          <p className="text-[11px] text-theme-text-muted">
            {wroteToday ? 'Today counted.' : 'Write today to start.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-theme-text-muted">
            This week
          </p>
          <p className="mt-1 text-base font-semibold text-theme-text">
            {stats.weekCount}
          </p>
          <p className="text-[11px] text-theme-text-muted">Entries logged.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-theme-text-muted">
            Cadence
          </p>
          <p className="mt-1 text-base font-semibold text-theme-text">
            {stats.cadence > 0 ? `${stats.cadence.toFixed(1)}/wk` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-theme-text-muted">
            Avg words
          </p>
          <p className="mt-1 text-base font-semibold text-theme-text">
            {stats.averageWords > 0 ? stats.averageWords : '—'}
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-theme-border bg-theme-hover p-3 text-xs text-theme-text-muted">
        {stats.mostCommonMood.label}: {stats.mostCommonMood.description}
      </div>
    </Card>
  );
}

function MobileLatestEntryCard({
  latestEntry,
  latestDraft,
}: {
  latestEntry?: JournalEntry | null;
  latestDraft?: JournalEntry | null;
}) {
  const showDraft =
    latestDraft && (!latestEntry || latestDraft.id !== latestEntry.id);

  return (
    <Card className="border-theme-border bg-theme-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-theme-text">Latest entry</h3>
        <BookOpen className="h-5 w-5 text-[#f97316]/70" />
      </div>
      {latestEntry ? (
        <>
          <p className="mt-1 text-xs uppercase tracking-wide text-theme-text-muted">
            {formatRelativeTime(latestEntry.createdAt)}
          </p>
          <p className="mt-1 text-sm font-semibold text-theme-text">
            {latestEntry.title || 'Untitled entry'}
          </p>
          <p className="mt-2 text-sm text-theme-text-muted line-clamp-4">
            {getEntryPreview(latestEntry, 200)}
          </p>
          <div className="mt-3 flex gap-2 text-xs">
            <Link
              href={`/workspace/${latestEntry.id}/view`}
              className="flex-1 rounded-full border border-theme-border px-3 py-2 text-center font-semibold text-theme-text transition hover:border-[#f97316]/60 hover:text-[#f97316]"
            >
              Preview
            </Link>
            <Link
              href={`/workspace/${latestEntry.id}`}
              className="flex-1 rounded-full bg-[#f97316] px-3 py-2 text-center font-semibold text-white transition hover:bg-[#ff8a3d]"
            >
              Edit
            </Link>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-theme-text-muted">
          Create your first entry to see it here.
        </p>
      )}

      {showDraft ? (
        <div className="mt-4 rounded-xl border border-[#f97316]/20 bg-[#f97316]/10 p-3 text-xs">
          <p className="text-[10px] uppercase tracking-wide text-[#f97316] dark:text-[#f97316]/70">
            Draft in progress
          </p>
          <p className="mt-1 text-sm font-semibold text-theme-text">
            {latestDraft?.title || 'Untitled draft'}
          </p>
          <Link
            href={`/workspace/${latestDraft?.id}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#f97316] hover:text-[#ff8a3d]"
          >
            Resume
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </Card>
  );
}

function MobileTagsCard({
  recentTags,
  selectedTags,
  onTagToggle,
  onOpenFilters,
}: {
  recentTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onOpenFilters: () => void;
}) {
  return (
    <Card className="border-theme-border bg-theme-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-theme-text">Tags</h3>
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-1 rounded-full border border-theme-border px-3 py-1 text-xs font-semibold text-theme-text transition hover:border-[#f97316]/60 hover:text-[#f97316]"
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
                  ? 'border-[#f97316]/80 bg-[#f97316]/20 text-theme-text'
                  : 'border-theme-border bg-theme-hover text-theme-text-muted hover:border-[#f97316]/40 hover:text-[#f97316]',
              )}
            >
              #{tag}
            </button>
          ))
        ) : (
          <p className="text-sm text-theme-text-muted">
            Tag entries as you save them to build quick filters.
          </p>
        )}
      </div>
    </Card>
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
}

export function NotebookLiteDashboard({
  userDisplayName,
  userId,
  searchTerm,
  selectedTags,
  recentTags,
  onSearchTermChange,
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
}: NotebookLiteDashboardProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showWelcomeOptIn, setShowWelcomeOptIn] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(0);

  // Fetch user settings
  useEffect(() => {
    if (userId) {
      getUserSettings(userId).then(setSettings);
    }
  }, [userId]);

  const wroteToday = useMemo(() => {
    if (!latestEntry) return false;
    const created = latestEntry.createdAt instanceof Date ? latestEntry.createdAt : new Date(latestEntry.createdAt);
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
  const loadingMessages = [
    { title: 'Reading your journal entries...', subtitle: 'Analyzing your recent thoughts and reflections' },
    { title: 'Identifying patterns and themes...', subtitle: 'Looking for connections across your entries' },
    { title: 'Crafting your personalized message...', subtitle: 'Writing something meaningful just for you' },
  ];

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoadingWelcome) {
      setLoadingMessage(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessage((prev) => (prev + 1) % loadingMessages.length);
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
      setShowWelcomeOptIn(false);
    } catch (error) {
      console.error('Failed to enable personalized welcome:', error);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="rounded-[28px] border border-theme-border bg-theme-surface p-8 shadow-[0_30px_80px_-40px_rgba(249,115,22,0.35)] backdrop-blur">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#f97316]">
              <Sparkles className="h-4 w-4" />
              Notebook Lite
            </div>
            <h1 className="text-3xl font-semibold text-theme-text sm:text-4xl">
              Welcome back{userDisplayName ? `, ${userDisplayName.split(' ')[0]}` : ''}.
            </h1>
            {isLoadingWelcome ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#f97316]/30 bg-gradient-to-br from-[#f97316]/10 via-[#f97316]/5 to-transparent p-6">
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="absolute -left-10 -top-10 h-32 w-32 animate-pulse rounded-full bg-[#f97316]/20 blur-3xl" />
                <div className="absolute -bottom-10 -right-10 h-32 w-32 animate-pulse rounded-full bg-[#f97316]/10 blur-3xl" style={{ animationDelay: '1s' }} />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-[#f97316]/30" />
                      <Sparkles className="relative h-6 w-6 animate-pulse text-[#f97316]" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="transition-all duration-500">
                      <p className="text-base font-semibold text-theme-text">
                        {loadingMessages[loadingMessage].title}
                      </p>
                      <p className="mt-1.5 text-sm text-theme-text-muted">
                        {loadingMessages[loadingMessage].subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex gap-1.5">
                        {loadingMessages.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              idx === loadingMessage
                                ? 'w-8 bg-[#f97316]'
                                : idx < loadingMessage
                                  ? 'w-1.5 bg-[#f97316]/60'
                                  : 'w-1.5 bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-1 ml-auto">
                        <div className="h-1 w-1 animate-bounce rounded-full bg-[#f97316]" style={{ animationDelay: '0ms' }} />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-[#f97316]" style={{ animationDelay: '150ms' }} />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-[#f97316]" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : welcomeMessage ? (
              <div className="relative rounded-2xl border border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent p-6">
                <div className="absolute right-4 top-4">
                  <Sparkles className="h-4 w-4 text-[#f97316]/40" />
                </div>
                <div className="space-y-3 pr-8">
                  {welcomeMessage.split('\n\n').slice(0, 3).map((paragraph, idx) => (
                    <p
                      key={idx}
                      className={`text-sm leading-relaxed ${
                        idx === 0
                          ? 'text-base font-medium text-theme-text'
                          : 'text-theme-text-muted'
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : settings && !settings.privacy?.personalizedWelcome && entries.length > 0 ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-[#f97316]/20 bg-[#f97316]/10 p-3">
                <p className="text-sm text-theme-text">
                  Get personalized welcome messages based on your recent entries?
                </p>
                <button
                  onClick={handleEnableWelcome}
                  className="rounded-full bg-[#f97316] px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-[#ff8a3d]"
                >
                  Enable
                </button>
              </div>
            ) : (
              <p className="text-sm text-theme-text-muted">
                Move from an idea to a saved entry in seconds. This pared-back dashboard keeps the writing tools up front
                so you can jump straight into your next note.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/workspace/new"
                className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_14px_45px_rgba(249,115,22,0.45)] transition hover:-translate-y-0.5 hover:bg-[#ff8a3d]"
              >
                <Plus className="h-4 w-4" />
                New entry
              </Link>
              {latestDraft ? (
                <Link
                  href={`/workspace/${latestDraft.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-theme-border px-5 py-2.5 text-sm font-semibold text-theme-text transition hover:border-[#f97316]/60 hover:text-[#f97316]"
                >
                  <PenLine className="h-4 w-4" />
                  Resume draft
                </Link>
              ) : null}
            </div>
          </div>
          <IdeaSparkCard userId={userId} variant="full" />
        </div>
      </header>

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
        <div className="space-y-6">
          <MobileOverview
            stats={stats}
            wroteToday={wroteToday}
            latestEntry={latestEntry}
            latestDraft={latestDraft}
            recentTags={recentTags}
            selectedTags={selectedTags}
            onTagToggle={onTagToggle}
            onOpenFilters={onOpenFilters}
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
          />
        </div>

        <LargeScreenOverview
          stats={stats}
          wroteToday={wroteToday}
          latestEntry={latestEntry}
          latestDraft={latestDraft}
          recentTags={recentTags}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
          onOpenFilters={onOpenFilters}
        />
      </div>
    </div>
  );
}
