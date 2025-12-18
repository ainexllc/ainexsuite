'use client';

import { useMemo } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import type { JournalEntry } from '@ainexsuite/types';
import { ListSection, EmptyState } from '@ainexsuite/ui';
import { JournalCard } from './journal-card';

type ViewMode = 'list' | 'masonry' | 'calendar';

const masonryBreakpoints = {
  default: 3,
  1024: 2,
  640: 1,
};

interface JournalBoardProps {
  entries: JournalEntry[];
  viewMode?: ViewMode;
  loading?: boolean;
  onEntryUpdated: () => void;
  searchTerm?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function JournalBoard({
  entries,
  viewMode = 'masonry',
  loading = false,
  onEntryUpdated,
  searchTerm = '',
  hasFilters = false,
  onClearFilters,
}: JournalBoardProps) {
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

  const renderMasonry = (items: JournalEntry[]) => (
    <Masonry
      breakpointCols={masonryBreakpoints}
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

  const renderList = (items: JournalEntry[]) => (
    <div className="space-y-3">
      {items.map((entry) => (
        <JournalCard key={entry.id} entry={entry} onUpdate={onEntryUpdated} />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Pinned Entries Section */}
      {pinned.length > 0 && (
        <ListSection title="Pinned" count={pinned.length}>
          {viewMode === 'list' ? renderList(pinned) : renderMasonry(pinned)}
        </ListSection>
      )}

      {/* All Other Entries Section */}
      {others.length > 0 && pinned.length > 0 && (
        <ListSection title="All Entries" count={others.length}>
          {viewMode === 'list' ? renderList(others) : renderMasonry(others)}
        </ListSection>
      )}

      {/* Entries without section header when no pinned entries */}
      {others.length > 0 && pinned.length === 0 && (
        viewMode === 'list' ? renderList(others) : renderMasonry(others)
      )}
    </div>
  );
}
