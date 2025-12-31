'use client';

import { useMemo } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import type { JournalEntry } from '@ainexsuite/types';
import { ListSection, EmptyState } from '@ainexsuite/ui';
import { JournalCard } from './journal-card';
import { ColumnSelector } from './column-selector';
import { usePreferences } from '@/components/providers/preferences-provider';

interface JournalBoardProps {
  entries: JournalEntry[];
  loading?: boolean;
  onEntryUpdated: () => void;
  searchTerm?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function JournalBoard({
  entries,
  loading = false,
  onEntryUpdated,
  searchTerm = '',
  hasFilters = false,
  onClearFilters,
}: JournalBoardProps) {
  const { preferences } = usePreferences();

  // Separate breakpoints for Pinned and All Entries sections
  const pinnedBreakpoints = useMemo(() => ({
    default: preferences.pinnedColumns || 3,
    1024: Math.min(preferences.pinnedColumns || 3, 2),
    640: 1,
  }), [preferences.pinnedColumns]);

  const allEntriesBreakpoints = useMemo(() => ({
    default: preferences.allEntriesColumns || 3,
    1024: Math.min(preferences.allEntriesColumns || 3, 2),
    640: 1,
  }), [preferences.allEntriesColumns]);

  // Separate and sort pinned and unpinned entries by latest updated
  const { pinned, others } = useMemo(() => {
    const getTime = (date: Date | { toDate: () => Date } | number | undefined) => {
      if (!date) return 0;
      if (typeof date === 'number') return date;
      if (date instanceof Date) return date.getTime();
      if (typeof date.toDate === 'function') return date.toDate().getTime();
      return 0;
    };

    const pinnedEntries = entries
      .filter((entry) => entry.pinned)
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
    const otherEntries = entries
      .filter((entry) => !entry.pinned)
      .sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
    return { pinned: pinnedEntries, others: otherEntries };
  }, [entries]);

  const hasEntries = pinned.length + others.length > 0;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasEntries) {
    return (
      <EmptyState
        title={
          searchTerm || hasFilters
            ? 'No entries match your filters'
            : 'No journal entries yet'
        }
        description={
          searchTerm || hasFilters
            ? 'Try adjusting your search or removing filters.'
            : 'Start capturing moments today to build your journal.'
        }
        icon={BookOpen}
        variant="illustrated"
        action={
          searchTerm || hasFilters
            ? {
                label: 'Reset filters',
                onClick: onClearFilters,
              }
            : {
                label: 'Create your first entry',
                href: '/workspace/new',
              }
        }
      />
    );
  }

  const renderMasonry = (items: JournalEntry[], breakpoints: Record<string, number>) => (
    <Masonry
      breakpointCols={breakpoints}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map((entry) => (
        <div key={entry.id} className="mb-4">
          <JournalCard entry={entry} onUpdate={onEntryUpdated} />
        </div>
      ))}
    </Masonry>
  );

  return (
    <div className="space-y-10">
      {/* Pinned Entries Section */}
      {pinned.length > 0 && (
        <ListSection
          title="Pinned"
          count={pinned.length}
          action={<ColumnSelector section="pinned" />}
        >
          {renderMasonry(pinned, pinnedBreakpoints)}
        </ListSection>
      )}

      {/* All Other Entries Section */}
      {others.length > 0 && pinned.length > 0 && (
        <ListSection
          title="All Entries"
          count={others.length}
          action={<ColumnSelector section="allEntries" />}
        >
          {renderMasonry(others, allEntriesBreakpoints)}
        </ListSection>
      )}

      {/* Entries without section header when no pinned entries */}
      {others.length > 0 && pinned.length === 0 && (
        <ListSection
          title="All Entries"
          count={others.length}
          action={<ColumnSelector section="allEntries" />}
        >
          {renderMasonry(others, allEntriesBreakpoints)}
        </ListSection>
      )}
    </div>
  );
}
