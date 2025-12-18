'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { Loader2, Eye, Edit2, BookOpen } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { cn } from '@/lib/utils';
import { plainText } from '@/lib/utils/text';
import { RichTextViewer } from '@/components/ui/rich-text-viewer';
import { JournalCard } from '@/components/journal/journal-card';
import { EmptyState } from '@ainexsuite/ui';

interface EntriesSectionProps {
  entriesToDisplay: JournalEntry[];
  totalEntries: number;
  searchTerm: string;
  selectedTags: string[];
  onClearFilters: () => void;
  onEntryUpdated: () => void;
  layoutVariant?: 'grid' | 'list';
  id?: string;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EntriesSection({
  entriesToDisplay,
  totalEntries,
  searchTerm,
  selectedTags,
  onClearFilters,
  onEntryUpdated,
  layoutVariant = 'grid',
  id,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
}: EntriesSectionProps) {
  const emptyStateActive = totalEntries === 0;

  return (
    <section id={id}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All entries</h2>
          <p className="text-sm text-muted-foreground">
            Filtered view of your journal archive.
          </p>
        </div>
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {totalEntries} entr{totalEntries === 1 ? 'y' : 'ies'}
        </span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && emptyStateActive ? (
        <EmptyState
          title={
            searchTerm || selectedTags.length > 0
              ? 'No entries match your filters'
              : 'No journal entries yet'
          }
          description={
            searchTerm || selectedTags.length > 0
              ? 'Try adjusting your search or removing a tag filter.'
              : 'Start capturing moments today to build your archive.'
          }
          icon={BookOpen}
          variant="illustrated"
          action={
            searchTerm || selectedTags.length > 0
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
      ) : null}

      {!isLoading && !emptyStateActive && (
        <div
          className={cn(
            'gap-6',
            layoutVariant === 'grid'
              ? 'grid md:grid-cols-2 xl:grid-cols-3'
              : 'space-y-4',
          )}
        >
          {entriesToDisplay.map((entry) => (
            <Fragment key={entry.id}>
              {layoutVariant === 'grid' ? (
                <JournalCard entry={entry} onUpdate={onEntryUpdated} />
              ) : (
                <div className="rounded-2xl border border-border bg-card p-5 shadow transition hover:bg-accent/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {entry.title || 'Untitled entry'}
                        </h3>
                        {entry.isDraft && (
                          <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                            Draft
                          </span>
                        )}
                      </div>
                      <RichTextViewer
                        content={entry.content}
                        className="mt-2 text-sm text-muted-foreground line-clamp-3"
                      />
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {entry.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border px-2 py-0.5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/workspace/${entry.id}/view`}
                        className="rounded-full border border-border p-2 text-foreground transition hover:bg-accent/10"
                        title="View entry"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/workspace/${entry.id}`}
                        className="rounded-full border border-border p-2 text-foreground transition hover:bg-accent/10"
                        title="Edit entry"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    <span>
                      {entry.mood
                        ? `Mood: ${entry.mood}`
                        : `${plainText(entry.content)
                            .split(/\s+/)
                            .filter(Boolean).length} words`}
                    </span>
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            className="rounded-full px-3 py-1 text-sm font-semibold text-muted-foreground transition hover:bg-accent/10 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            className="rounded-full px-3 py-1 text-sm font-semibold text-muted-foreground transition hover:bg-accent/10 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
