'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { Loader2, Plus, Eye, Edit2 } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { cn } from '@/lib/utils';
import { plainText } from '@/lib/utils/text';
import { RichTextViewer } from '@/components/ui/rich-text-viewer';
import { JournalCard } from '@/components/journal/journal-card';
import { DashboardTheme } from '@/lib/dashboard-themes';

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
  const accentBorder = theme?.id === 'obsidian' ? 'border-[#f97316]' : theme?.border || 'border-[#f97316]';

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
        <div className={cn("flex flex-col items-center justify-center rounded-[28px] border p-12 text-center shadow-[0_20px_60px_-35px_rgba(249,115,22,0.28)]", borderClass, bgSurface)}>
          <div className={cn("mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5", textPrimary)}>
            <Loader2 className={cn("h-10 w-10", accentText)} />
          </div>
          <h3 className={cn("text-lg font-semibold", textPrimary)}>
            {searchTerm || selectedTags.length > 0
              ? 'No entries match your filters'
              : 'No journal entries yet'}
          </h3>
          <p className={cn("mt-2 max-w-md text-sm", textSecondary)}>
            {searchTerm || selectedTags.length > 0
              ? 'Try adjusting your search or removing a tag filter.'
              : 'Start capturing moments today to build your archive.'}
          </p>
          {searchTerm || selectedTags.length > 0 ? (
            <button
              type="button"
              onClick={onClearFilters}
              className={cn("mt-4 rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-white/10", accentBorder, accentText)}
            >
              Reset filters
            </button>
          ) : (
            <Link
              href="/workspace/new"
              className={cn("mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5", 
                  theme?.accentBg || 'bg-[#f97316]', 
                  theme?.id === 'wireframe' ? 'text-white border border-white' : 'text-black'
              )}
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
                        className={cn("rounded-full border p-2 transition hover:bg-white/5", borderClass, textPrimary)}
                        title="Edit entry"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className={cn("mt-4 flex items-center justify-between text-xs", textSecondary)}>
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
        <div className={cn("mt-6 flex items-center justify-between rounded-full border px-4 py-2 text-sm", borderClass, bgSurface, textSecondary)}>
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            className={cn("rounded-full px-3 py-1 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-40", textSecondary)}
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
            className={cn("rounded-full px-3 py-1 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-40", textSecondary)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
