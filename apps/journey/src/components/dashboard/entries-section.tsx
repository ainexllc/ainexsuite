'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { Loader2, Plus, Eye, Edit2 } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { cn } from '@/lib/utils';
import { plainText } from '@/lib/utils/text';
import { RichTextViewer } from '@/components/ui/rich-text-viewer';
import { JournalCard } from '@/components/journal/journal-card';

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
          <h2 className="text-xl font-semibold text-theme-text">All entries</h2>
          <p className="text-sm text-theme-text-muted">
            Filtered view of your journal archive.
          </p>
        </div>
        <span className="text-xs font-medium uppercase text-theme-text-muted">
          {totalEntries} entr{totalEntries === 1 ? 'y' : 'ies'}
        </span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
        </div>
      )}

      {!isLoading && emptyStateActive ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-theme-border bg-theme-surface p-12 text-center shadow-[0_20px_60px_-35px_rgba(249,115,22,0.28)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f97316]/15 text-theme-text">
            <Loader2 className="h-10 w-10 text-[#f97316]" />
          </div>
          <h3 className="text-lg font-semibold text-theme-text">
            {searchTerm || selectedTags.length > 0
              ? 'No entries match your filters'
              : 'No journal entries yet'}
          </h3>
          <p className="mt-2 max-w-md text-sm text-theme-text-muted">
            {searchTerm || selectedTags.length > 0
              ? 'Try adjusting your search or removing a tag filter.'
              : 'Start capturing moments today to build your archive.'}
          </p>
          {searchTerm || selectedTags.length > 0 ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 rounded-full border border-[#f97316] px-4 py-2 text-sm font-semibold text-[#f97316] transition hover:bg-[#f97316] hover:text-black"
            >
              Reset filters
            </button>
          ) : (
            <Link
              href="/workspace/new"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-2 text-sm font-semibold text-black shadow-[0_14px_45px_rgba(249,115,22,0.45)] transition hover:-translate-y-0.5 hover:bg-[#ff8a3d]"
            >
              <Plus className="h-4 w-4" />
              Create your first entry
            </Link>
          )}
        </div>
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
                <div className="rounded-2xl border border-theme-border bg-theme-surface p-5 shadow transition hover:border-[#f97316]/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-theme-text">
                          {entry.title || 'Untitled entry'}
                        </h3>
                        {entry.isDraft && (
                          <span className="rounded-full border border-dashed border-[#f97316]/50 bg-[#f97316]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#f97316]">
                            Draft
                          </span>
                        )}
                      </div>
                      <RichTextViewer
                        content={entry.content}
                        className="mt-2 text-sm text-theme-text-muted line-clamp-3"
                      />
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-theme-text-muted">
                        {entry.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-theme-border px-2 py-0.5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/workspace/${entry.id}/view`}
                        className="rounded-full border border-theme-border p-2 text-theme-text transition hover:border-[#f97316]/60 hover:text-[#f97316]"
                        title="View entry"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/workspace/${entry.id}`}
                        className="rounded-full border border-theme-border p-2 text-theme-text transition hover:border-[#f97316]/60 hover:text-[#f97316]"
                        title="Edit entry"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-theme-text-muted">
                    <span>{entry.createdAt instanceof Date ? entry.createdAt.toLocaleDateString() : new Date(entry.createdAt).toLocaleDateString()}</span>
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
        <div className="mt-6 flex items-center justify-between rounded-full border border-theme-border bg-theme-surface px-4 py-2 text-sm text-theme-text-muted">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            className="rounded-full px-3 py-1 text-sm font-semibold text-theme-text-muted transition hover:text-theme-text disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-theme-text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            className="rounded-full px-3 py-1 text-sm font-semibold text-theme-text-muted transition hover:text-theme-text disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
