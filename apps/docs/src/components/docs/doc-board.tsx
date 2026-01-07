"use client";

import { useMemo, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";
import Masonry from "react-masonry-css";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { DocCard } from "@/components/docs/doc-card";
import { ColumnSelector } from "@/components/docs/column-selector";
import { useDocs } from "@/components/providers/docs-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useDocSelection } from "@/components/providers/selection-provider";

const SKELETON_BREAKPOINTS = { default: 2, 640: 1 };

function NotesSkeleton() {
  return (
    <Masonry
      breakpointCols={SKELETON_BREAKPOINTS}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 rounded-3xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </Masonry>
  );
}

export function DocBoard() {
  const {
    pinned,
    displayedOthers,
    loading,
    docs,
    searchQuery,
    hasMore,
    isLoadingMore,
    totalCount,
    sentinelRef,
  } = useDocs();
  const { preferences } = usePreferences();
  const { isSelected, isSelectMode, handleSelect } = useDocSelection();

  // Separate breakpoints for Focus and Library sections
  const focusBreakpoints = useMemo(() => ({
    default: preferences.focusColumns || 2,
    640: 1,
  }), [preferences.focusColumns]);

  const libraryBreakpoints = useMemo(() => ({
    default: preferences.libraryColumns || 2,
    640: 1,
  }), [preferences.libraryColumns]);

  // Helper to get time from Date or Firestore Timestamp
  const getTime = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return 0;
    if (date instanceof Date) return date.getTime();
    if (typeof date.toDate === 'function') return date.toDate().getTime();
    return 0;
  };

  // Sort both pinned and displayedOthers by latest updated
  const sortedPinned = useMemo(() => {
    return [...pinned].sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
  }, [pinned]);

  const sortedOthers = useMemo(() => {
    return [...displayedOthers].sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
  }, [displayedOthers]);

  const hasNotes = useMemo(() => sortedPinned.length + sortedOthers.length > 0, [sortedPinned, sortedOthers]);

  // Get all doc IDs for range selection
  const allNoteIds = useMemo(() => {
    return [...sortedPinned, ...sortedOthers].map(doc => doc.id);
  }, [sortedPinned, sortedOthers]);

  // Callback for handling selection
  const onSelect = useCallback((docId: string, event: React.MouseEvent) => {
    handleSelect(docId, event, allNoteIds);
  }, [handleSelect, allNoteIds]);

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {loading ? (
        <NotesSkeleton />
      ) : hasNotes ? (
        <div className="space-y-10">
          {sortedPinned.length ? (
            <ListSection
              title="Focus"
              count={sortedPinned.length}
              action={<ColumnSelector section="focus" />}
            >
              <Masonry
                breakpointCols={focusBreakpoints}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {sortedPinned.map(doc => (
                  <div key={doc.id} className="mb-4">
                    <DocCard
                      doc={doc}
                      isSelectMode={isSelectMode}
                      isSelected={isSelected(doc.id)}
                      onSelect={onSelect}
                    />
                  </div>
                ))}
              </Masonry>
            </ListSection>
          ) : null}

          {sortedOthers.length ? (
            <ListSection
              title="All Notes"
              count={sortedPinned.length ? totalCount : undefined}
              action={<ColumnSelector section="library" />}
            >
              <Masonry
                breakpointCols={libraryBreakpoints}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {sortedOthers.map(doc => (
                  <div key={doc.id} className="mb-4">
                    <DocCard
                      doc={doc}
                      isSelectMode={isSelectMode}
                      isSelected={isSelected(doc.id)}
                      onSelect={onSelect}
                    />
                  </div>
                ))}
              </Masonry>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" aria-hidden="true" />

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading more docs...</span>
                </div>
              )}

              {/* End of docs indicator */}
              {!loading && !isLoadingMore && !hasMore && totalCount > 0 && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-xs text-muted-foreground">
                    {totalCount} {totalCount === 1 ? 'doc' : 'docs'}
                  </span>
                </div>
              )}
            </ListSection>
          ) : null}
        </div>
      ) : docs.length === 0 && searchQuery.trim() ? (
        <EmptyState
          title="No docs found"
          description="Try a different keyword or remove filters to see more docs."
          icon={FileText}
          variant="default"
        />
      ) : (
        <EmptyState
          title="Notes you add will appear here"
          description="Create text docs, checklists, and attach images. Pin important items to keep them at the top."
          icon={FileText}
          variant="default"
        />
      )}
    </div>
  );
}
