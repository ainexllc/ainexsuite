"use client";

import { useMemo } from "react";
import { Archive } from "lucide-react";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { NoteCard } from "@/components/notes/note-card";
import { useNotes } from "@/components/providers/notes-provider";
import { Container } from "@/components/layout/container";

function NotesSkeleton() {
  return (
    <div className="note-board-columns">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 break-inside-avoid rounded-3xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </div>
  );
}

export function ArchiveBoard() {
  const { allNotes, loading } = useNotes();

  const archivedNotes = useMemo(() => {
    const archived = allNotes.filter((note) => note.archived);

    const sortByNewest = (a: typeof archived[0], b: typeof archived[0]) => {
      const aTime = a.updatedAt?.getTime() ?? a.createdAt.getTime();
      const bTime = b.updatedAt?.getTime() ?? b.createdAt.getTime();
      return bTime - aTime;
    };

    const pinned = archived.filter((note) => note.pinned).sort(sortByNewest);
    const others = archived.filter((note) => !note.pinned).sort(sortByNewest);

    return { pinned, others, total: archived.length };
  }, [allNotes]);

  const hasNotes = archivedNotes.total > 0;

  return (
    <Container className="space-y-8 lg:px-0 cq-board" variant="narrow">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-600">
          <Archive className="h-3.5 w-3.5" /> Archive
        </div>
        <h1 className="text-2xl font-semibold text-ink-800">
          Shelf notes without losing context
        </h1>
        <p className="text-sm text-muted">
          Keep your workspace lean by archiving completed notes. Retrieve anything in seconds with global search.
        </p>
      </header>

      {loading ? (
        <NotesSkeleton />
      ) : hasNotes ? (
        <div className="space-y-10">
          {archivedNotes.pinned.length > 0 && (
            <ListSection title="Pinned" count={archivedNotes.pinned.length}>
              <div className="note-board-columns">
                {archivedNotes.pinned.map((note) => (
                  <div key={note.id} className="mb-4">
                    <NoteCard note={note} />
                  </div>
                ))}
              </div>
            </ListSection>
          )}

          {archivedNotes.others.length > 0 && (
            <ListSection
              title="All Notes"
              count={archivedNotes.pinned.length > 0 ? archivedNotes.others.length : undefined}
            >
              <div className="note-board-columns">
                {archivedNotes.others.map((note) => (
                  <div key={note.id} className="mb-4">
                    <NoteCard note={note} />
                  </div>
                ))}
              </div>
            </ListSection>
          )}
        </div>
      ) : (
        <EmptyState
          title="No archived notes yet"
          description="Archive notes from your workspace to keep them out of sight but easily recoverable."
          icon={Archive}
          variant="default"
        />
      )}
    </Container>
  );
}
