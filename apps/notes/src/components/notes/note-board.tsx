"use client";

import { useMemo } from "react";
import { FileText } from "lucide-react";
import Masonry from "react-masonry-css";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { NoteCard } from "@/components/notes/note-card";
import { useNotes } from "@/components/providers/notes-provider";
import { usePreferences } from "@/components/providers/preferences-provider";

const masonryBreakpoints = {
  default: 2,
  640: 1,
};

function NotesSkeleton() {
  return (
    <Masonry
      breakpointCols={masonryBreakpoints}
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

export function NoteBoard() {
  const { pinned, others, loading, notes, searchQuery } = useNotes();
  const { preferences } = usePreferences();

  // Helper to get time from Date or Firestore Timestamp
  const getTime = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return 0;
    if (date instanceof Date) return date.getTime();
    if (typeof date.toDate === 'function') return date.toDate().getTime();
    return 0;
  };

  // Sort both pinned and others by latest updated
  const sortedPinned = useMemo(() => {
    return [...pinned].sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
  }, [pinned]);

  const sortedOthers = useMemo(() => {
    return [...others].sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
  }, [others]);

  const hasNotes = useMemo(() => sortedPinned.length + sortedOthers.length > 0, [sortedPinned, sortedOthers]);

  // Use preferences directly
  const viewMode = preferences.viewMode;

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {loading ? (
        <NotesSkeleton />
      ) : hasNotes ? (
        <div className="space-y-10">
          {sortedPinned.length ? (
            <ListSection title="Pinned" count={sortedPinned.length}>
              {viewMode === "list" ? (
                <div className="space-y-2">
                  {sortedPinned.map((note) => (
                    <NoteCard key={note.id} note={note} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="flex -ml-4 w-auto"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {sortedPinned.map((note) => (
                    <div key={note.id} className="mb-4">
                      <NoteCard note={note} viewMode={viewMode} />
                    </div>
                  ))}
                </Masonry>
              )}
            </ListSection>
          ) : null}

          {sortedOthers.length ? (
            <ListSection title="All Notes" count={sortedPinned.length ? sortedOthers.length : undefined}>
              {viewMode === "list" ? (
                <div className="space-y-2">
                  {sortedOthers.map((note) => (
                    <NoteCard key={note.id} note={note} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="flex -ml-4 w-auto"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {sortedOthers.map((note) => (
                    <div key={note.id} className="mb-4">
                      <NoteCard note={note} viewMode={viewMode} />
                    </div>
                  ))}
                </Masonry>
              )}
            </ListSection>
          ) : null}
        </div>
      ) : notes.length === 0 && searchQuery.trim() ? (
        <EmptyState
          title="No notes found"
          description="Try a different keyword or remove filters to see more notes."
          icon={FileText}
          variant="default"
        />
      ) : (
        <EmptyState
          title="Notes you add will appear here"
          description="Create text notes, checklists, and attach images. Pin important items to keep them at the top."
          icon={FileText}
          variant="default"
        />
      )}
    </div>
  );
}
