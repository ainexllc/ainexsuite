"use client";

import { useMemo } from "react";
import { useNotes } from "@/components/providers/notes-provider";
import { useAuth } from "@/lib/auth/auth-context";
import { NoteCard } from "@/components/notes/note-card";

function NotesSkeleton() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 break-inside-avoid rounded-3xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </div>
  );
}

export function SharedNotesBoard() {
  const { allNotes, loading } = useNotes();
  const { user } = useAuth();

  const [sharedWithMe, sharedByMe] = useMemo(() => {
    if (!user) {
      return [[], []];
    }

    const mine: typeof allNotes = [];
    const incoming: typeof allNotes = [];

    allNotes.forEach((note) => {
      if (note.ownerId === user.id) {
        if (note.sharedWithUserIds?.length) {
          mine.push(note);
        }
      } else if (note.sharedWithUserIds?.includes(user.id)) {
        incoming.push(note);
      }
    });

    return [incoming, mine];
  }, [allNotes, user]);

  if (loading) {
    return <NotesSkeleton />;
  }

  const hasSharedContent = sharedWithMe.length || sharedByMe.length;

  if (!hasSharedContent) {
    return (
      <div className="rounded-3xl border border-dashed border-outline-subtle/80 bg-surface-elevated/60 px-10 py-16 text-center">
        <p className="text-base font-semibold text-ink-700">
          No shared notes yet
        </p>
        <p className="mt-2 text-sm text-muted">
          Invite collaborators from any note to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sharedWithMe.length ? (
        <section className="space-y-4">
          <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
            <span>Shared with me</span>
            <span>{sharedWithMe.length}</span>
          </header>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {sharedWithMe.map((note) => (
              <div key={note.id} className="mb-4">
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {sharedByMe.length ? (
        <section className="space-y-4">
          <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
            <span>Shared by me</span>
            <span>{sharedByMe.length}</span>
          </header>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {sharedByMe.map((note) => (
              <div key={note.id} className="mb-4">
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
