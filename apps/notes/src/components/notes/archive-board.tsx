"use client";

import { useMemo } from "react";
import { NoteCard } from "@/components/notes/note-card";
import { useNotes } from "@/components/providers/notes-provider";
import { Container } from "@/components/layout/container";
import { Archive } from "lucide-react";

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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-surface-muted/60 px-10 py-16 text-center shadow-inner">
      <Archive className="h-12 w-12 text-accent-500" aria-hidden />
      <p className="text-base font-semibold text-ink-700">
        No archived notes yet
      </p>
      <p className="text-sm text-muted">
        Archive notes from your workspace to keep them out of sight but easily recoverable.
      </p>
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
            <section className="space-y-4">
              <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
                <span>Pinned</span>
                <span>{archivedNotes.pinned.length}</span>
              </header>
              <div className="note-board-columns">
                {archivedNotes.pinned.map((note) => (
                  <div key={note.id} className="mb-4">
                    <NoteCard note={note} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {archivedNotes.others.length > 0 && (
            <section className="space-y-4">
              {archivedNotes.pinned.length > 0 && (
                <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <span>All Notes</span>
                  <span>{archivedNotes.others.length}</span>
                </header>
              )}
              <div className="note-board-columns">
                {archivedNotes.others.map((note) => (
                  <div key={note.id} className="mb-4">
                    <NoteCard note={note} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <EmptyState />
      )}
    </Container>
  );
}
