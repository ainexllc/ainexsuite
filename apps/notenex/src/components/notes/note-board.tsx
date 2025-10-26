"use client";

import { useMemo } from "react";
import { NoteComposer } from "@/components/notes/note-composer";
import { NoteCard } from "@/components/notes/note-card";
import { ViewToggle } from "@/components/notes/view-toggle";
import { useNotes } from "@/components/providers/notes-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-surface-muted/60 px-10 py-16 text-center shadow-inner">
      <p className="text-base font-semibold text-ink-700">
        Notes you add will appear here
      </p>
      <p className="text-sm text-muted">
        Create text notes, checklists, and attach images. Pin important items to
        keep them at the top.
      </p>
    </div>
  );
}

export function NoteBoard() {
  const { pinned, others, loading, notes, searchQuery } = useNotes();
  const { preferences, updatePreferences } = usePreferences();

  const hasNotes = useMemo(() => pinned.length + others.length > 0, [pinned, others]);

  const handleViewModeChange = async (mode: "masonry" | "list") => {
    await updatePreferences({ viewMode: mode });
  };

  return (
    <Container className="space-y-8 lg:px-0 cq-board" variant="narrow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <NoteComposer />
        </div>
        <ViewToggle viewMode={preferences.viewMode} onViewModeChange={handleViewModeChange} />
      </div>

      {loading ? (
        <NotesSkeleton />
      ) : hasNotes ? (
        <div className="space-y-10">
          {pinned.length ? (
            <section className="space-y-4">
              <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
                <span>Pinned</span>
                <span>{pinned.length}</span>
              </header>
              <div className={preferences.viewMode === "list" ? "space-y-2" : "note-board-columns"}>
                {pinned.map((note) => (
                  <div key={note.id} className={preferences.viewMode === "list" ? "" : "mb-4"}>
                    <NoteCard note={note} viewMode={preferences.viewMode} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {others.length ? (
            <section className="space-y-4">
              {pinned.length ? (
                <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <span>All Notes</span>
                  <span>{others.length}</span>
                </header>
              ) : null}
              <div className={preferences.viewMode === "list" ? "space-y-2" : "note-board-columns"}>
                {others.map((note) => (
                  <div key={note.id} className={preferences.viewMode === "list" ? "" : "mb-4"}>
                    <NoteCard note={note} viewMode={preferences.viewMode} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : notes.length === 0 && searchQuery.trim() ? (
        <div className="rounded-3xl bg-surface-muted/60 px-8 py-12 text-center shadow-inner">
          <p className="text-base font-semibold text-ink-700">
            No notes found
          </p>
          <p className="mt-2 text-sm text-muted">
            Try a different keyword or remove filters to see more notes.
          </p>
        </div>
      ) : (
        <EmptyState />
      )}
    </Container>
  );
}
