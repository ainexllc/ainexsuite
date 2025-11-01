'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast';
import { getUserJournalEntries } from '@/lib/firebase/firestore';
import type { JournalEntry, MoodType } from '@ainexsuite/types';
import { FilterModal } from '@/components/journal/filter-modal';
import { getMoodLabel } from '@/lib/utils/mood';
import { plainText } from '@/lib/utils/text';
import { NotebookLiteDashboard } from '@/components/dashboard/notebook-lite-dashboard';

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

export function DashboardView() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (user) {
      void loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { entries: fetchedEntries } = await getUserJournalEntries(user.uid, {
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
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

    return entries.filter((entry) => {
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
  }, [entries, searchTerm, selectedTags]);

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
        const createdAt = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
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
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
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
    const createdAt =
      entry.createdAt instanceof Date
        ? entry.createdAt
        : new Date(entry.createdAt);
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

function formatDateKey(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().slice(0, 10);
}
