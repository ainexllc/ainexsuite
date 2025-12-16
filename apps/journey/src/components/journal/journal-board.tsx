'use client';

import { useMemo } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { ListSection, EmptyState } from '@ainexsuite/ui';
import { JournalCard } from './journal-card';

type ViewMode = 'list' | 'masonry' | 'calendar';

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
  // Separate pinned and unpinned entries
  const { pinned, others } = useMemo(() => {
    const pinnedEntries = entries.filter((entry) => entry.pinned);
    const otherEntries = entries.filter((entry) => !entry.pinned);
    return { pinned: pinnedEntries, others: otherEntries };
  }, [entries]);

  const hasEntries = pinned.length + others.length > 0;

  // Masonry layout uses CSS columns
  const masonryClasses = 'columns-1 sm:columns-2 lg:columns-3 gap-4';

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

  return (
    <div className="space-y-10">
      {/* Pinned Entries Section */}
      {pinned.length > 0 && (
        <ListSection title="Pinned" count={pinned.length}>
          <div className={viewMode === 'list' ? 'space-y-3' : masonryClasses}>
            {pinned.map((entry) => (
              <div
                key={entry.id}
                className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
              >
                <JournalCard entry={entry} onUpdate={onEntryUpdated} />
              </div>
            ))}
          </div>
        </ListSection>
      )}

      {/* All Other Entries Section */}
      {others.length > 0 && pinned.length > 0 && (
        <ListSection title="All Entries" count={others.length}>
          <div className={viewMode === 'list' ? 'space-y-3' : masonryClasses}>
            {others.map((entry) => (
              <div
                key={entry.id}
                className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
              >
                <JournalCard entry={entry} onUpdate={onEntryUpdated} />
              </div>
            ))}
          </div>
        </ListSection>
      )}

      {/* Entries without section header when no pinned entries */}
      {others.length > 0 && pinned.length === 0 && (
        <div className={viewMode === 'list' ? 'space-y-3' : masonryClasses}>
          {others.map((entry) => (
            <div
              key={entry.id}
              className={viewMode === 'list' ? '' : 'mb-4 break-inside-avoid'}
            >
              <JournalCard entry={entry} onUpdate={onEntryUpdated} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
