"use client";

import { useMemo } from "react";
import { FileText } from "lucide-react";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { NoteCard } from "@/components/notes/note-card";
import { useNotes } from "@/components/providers/notes-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { Container } from "@/components/layout/container";

function NotesSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 break-inside-avoid rounded-3xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </div>
  );
}

export function NoteBoard() {
  const { pinned, others, loading, notes, searchQuery } = useNotes();
  const { preferences } = usePreferences();

  const hasNotes = useMemo(() => pinned.length + others.length > 0, [pinned, others]);

  // Use preferences directly
  const viewMode = preferences.viewMode;

  const masonryClasses = "columns-1 sm:columns-2 gap-4";

  return (
    <Container className="space-y-1 lg:px-0 cq-board" variant="narrow">


      {loading ? (
        <NotesSkeleton />
      ) : hasNotes ? (
        <div className="space-y-10">
          {pinned.length ? (
            <ListSection title="Pinned" count={pinned.length}>
              <div className={viewMode === "list" ? "space-y-2" : masonryClasses}>
                {pinned.map((note) => (
                  <div key={note.id} className={viewMode === "list" ? "" : "mb-4 break-inside-avoid"}>
                    <NoteCard note={note} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            </ListSection>
          ) : null}

          {others.length ? (
            <ListSection title="All Notes" count={pinned.length ? others.length : undefined}>
              <div className={viewMode === "list" ? "space-y-2" : masonryClasses}>
                {others.map((note) => (
                  <div key={note.id} className={viewMode === "list" ? "" : "mb-4 break-inside-avoid"}>
                    <NoteCard note={note} viewMode={viewMode} />
                  </div>
                ))}
              </div>
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
    </Container>
  );
}
