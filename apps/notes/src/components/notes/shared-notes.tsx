"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { EmptyState, ListSection } from "@ainexsuite/ui";
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
      <EmptyState
        title="No shared notes yet"
        description="Invite collaborators from any note to see them here."
        icon={Users}
        variant="default"
      />
    );
  }

  return (
    <div className="space-y-8">
      {sharedWithMe.length ? (
        <ListSection title="Shared with me" count={sharedWithMe.length}>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {sharedWithMe.map((note) => (
              <div key={note.id} className="mb-4">
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        </ListSection>
      ) : null}

      {sharedByMe.length ? (
        <ListSection title="Shared by me" count={sharedByMe.length}>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {sharedByMe.map((note) => (
              <div key={note.id} className="mb-4">
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        </ListSection>
      ) : null}
    </div>
  );
}
