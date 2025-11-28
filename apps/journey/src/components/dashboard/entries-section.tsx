'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { Loader2, Eye, Edit2, BookOpen } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { cn } from '@/lib/utils';
import { plainText } from '@/lib/utils/text';
import { RichTextViewer } from '@/components/ui/rich-text-viewer';
import { JournalCard } from '@/components/journal/journal-card';
import { DashboardTheme } from '@/lib/dashboard-themes';
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
  theme?: DashboardTheme;
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
  theme,
}: EntriesSectionProps) {
  const emptyStateActive = totalEntries === 0;
  
  // Fallback classes if theme is missing (though it should be passed)
  const textPrimary = theme?.textPrimary || 'text-theme-text';
  const textSecondary = theme?.textSecondary || 'text-theme-text-muted';
  const borderClass = theme?.border || 'border-theme-border';
  const bgSurface = theme?.bgSurface || 'bg-theme-surface';
  const accentText = theme?.accent || 'text-[#f97316]';

  return (
    <section id={id}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={cn("text-xl font-semibold", textPrimary)}>All entries</h2>
          <p className={cn("text-sm", textSecondary)}>
            Filtered view of your journal archive.
          </p>
        </div>
        <span className={cn("text-xs font-medium uppercase", textSecondary)}>
          {totalEntries} entr{totalEntries === 1 ? 'y' : 'ies'}
        </span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className={cn("h-8 w-8 animate-spin", accentText)} />
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
                <JournalCard entry={entry} onUpdate={onEntryUpdated} theme={theme} />
              ) : (
                <div className={cn("rounded-2xl border p-5 shadow transition", borderClass, bgSurface, theme?.bgHover)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={cn("text-base font-semibold", textPrimary)}>
                          {entry.title || 'Untitled entry'}
                        </h3>
                        {entry.isDraft && (
                          <span className={cn("rounded-full border border-dashed px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", borderClass, accentText)}>
                            Draft
                          </span>
                        )}
                      </div>
                      <RichTextViewer
                        content={entry.content}
                        className={cn("mt-2 text-sm line-clamp-3", textSecondary)}
                      />
                      <div className={cn("mt-3 flex flex-wrap gap-2 text-xs", textSecondary)}>
                        {entry.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={cn("rounded-full border px-2 py-0.5", borderClass)}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/workspace/${entry.id}/view`}
                        className={cn("rounded-full border p-2 transition hover:bg-white/5", borderClass, textPrimary)}
                        title="View entry"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/workspace/${entry.id}`}
                        className={cn("rounded-full border p-2 transition hover:bg-foreground/5", borderClass, textPrimary)}
                        title="Edit entry"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className={cn("mt-4 flex items-center justify-between text-xs", textSecondary)}>
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
        <div className={cn("mt-6 flex items-center justify-between rounded-full border px-4 py-2 text-sm", borderClass, bgSurface, textSecondary)}>
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            className={cn("rounded-full px-3 py-1 text-sm font-semibold transition hover:bg-foreground/5 disabled:opacity-40", textSecondary)}
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
            className={cn("rounded-full px-3 py-1 text-sm font-semibold transition hover:bg-foreground/5 disabled:opacity-40", textSecondary)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
