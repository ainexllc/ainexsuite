'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@ainexsuite/auth';
import { useToast } from '@/lib/toast';
import { getUserJournalEntries, getOnThisDayEntries } from '@/lib/firebase/firestore';
import type { JournalEntry, MoodType } from '@ainexsuite/types';
import { FilterModal } from '@/components/journal/filter-modal';
import { getMoodLabel } from '@/lib/utils/mood';
import { plainText } from '@/lib/utils/text';
import { NotebookLiteDashboard } from '@/components/dashboard/notebook-lite-dashboard';
import { DEFAULT_THEME_ID } from '@/lib/dashboard-themes';

const POSITIVE_MOODS: Set<MoodType> = new Set([
  'happy',
  'excited',
  'grateful',
  'peaceful',
  'hopeful',
  'energetic',
  'confident',
  'loved',
  'inspired',
  'content',
]);

const NEGATIVE_MOODS: Set<MoodType> = new Set([
  'sad',
  'anxious',
  'angry',
  'stressed',
  'frustrated',
]);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function DashboardView({ dateFilter }: { dateFilter?: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [onThisDayEntries, setOnThisDayEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading your journal...');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(0);
  const [currentThemeId, setCurrentThemeId] = useState(DEFAULT_THEME_ID);

  useEffect(() => {
    const savedTheme = localStorage.getItem('journey-dashboard-theme');
    if (savedTheme) {
      setCurrentThemeId(savedTheme);
    }
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId);
    localStorage.setItem('journey-dashboard-theme', themeId);
  };

  useEffect(() => {
    if (user) {
      setLoadingMessage('Loading your journal entries...');
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setEntries([]);
      }, 10000); // 10 second timeout

      void loadEntries().finally(() => clearTimeout(timeoutId));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateFilter]); // Add dateFilter to dependencies

  const loadEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Set a timeout to show a helpful message if loading takes too long
      const timeoutId = setTimeout(() => {
        setLoadingMessage('Still loading... This is taking longer than expected');
      }, 3000);

      const [ { entries: fetchedEntries }, onThisDay ] = await Promise.all([
        getUserJournalEntries(user.uid, {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        getOnThisDayEntries(user.uid)
      ]);

      clearTimeout(timeoutId);
      setEntries(fetchedEntries);
      setOnThisDayEntries(onThisDay);
      setLoadingMessage('Loaded successfully!');
    } catch (error) {
      setError('Failed to load journal entries. Please try refreshing the page.');
      toast({
        title: 'Error',
        description: 'Failed to load journal entries. Please refresh the page.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    
    let currentEntries = entries;

    if (dateFilter) {
      currentEntries = currentEntries.filter(entry => {
        const entryDate = typeof entry.date === 'number'
          ? new Date(entry.date).toISOString().split('T')[0]
          : entry.date;
        return entryDate === dateFilter;
      });
    }

    return currentEntries.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.title.toLowerCase().includes(search) ||
        plainText(entry.content).toLowerCase().includes(search) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(search));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => entry.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [entries, searchTerm, selectedTags, dateFilter]);

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

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchTerm('');
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedTags]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredEntries.length / 10) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredEntries.length, page]);

  const PAGE_SIZE = 10;
  const totalEntries = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const paginatedEntries = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredEntries.slice(start, start + PAGE_SIZE);
  }, [filteredEntries, page]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
          <p className="text-sm text-white/70">{loadingMessage}</p>
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
        paginatedEntries={paginatedEntries}
        totalEntries={totalEntries}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEntryUpdated={loadEntries}
        isLoadingEntries={loading}
        onThisDayEntries={onThisDayEntries}
        currentThemeId={currentThemeId}
        onThemeChange={handleThemeChange}
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
