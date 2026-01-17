"use client";

import { useCallback, useState } from "react";
import { CheckSquare, StickyNote } from "lucide-react";
import { useNotes } from "@/components/providers/notes-provider";
import type { Note } from "@/lib/types/note";
import { NoteEditor } from "./note-editor";
import { useAuth } from "@ainexsuite/auth";
import { useSpaces } from "@/components/providers/spaces-provider";
import { Hint, HINTS } from "@/components/hints";
import { generateUUID } from "@ainexsuite/ui";

export function NoteComposer() {
  const { user } = useAuth();
  const { createNote } = useNotes();
  const { spaces, currentSpaceId } = useSpaces();

  // State for opening NoteEditor modal for new notes
  const [creatingNote, setCreatingNote] = useState<Note | null>(null);

  // Handler to create a new text note and open NoteEditor modal
  const handleCreateNote = useCallback(async () => {
    const now = new Date();
    const spaceId = currentSpaceId ?? "personal";

    const noteId = await createNote({
      title: "",
      body: "",
      type: "text",
      checklist: [],
      color: "default",
      pinned: false,
      priority: null,
      archived: false,
      labelIds: [],
      spaceId,
    });

    if (noteId) {
      // Construct Note object immediately (don't wait for Firestore listener)
      const tempNote: Note = {
        id: noteId,
        ownerId: user?.uid ?? "",
        spaceId,
        title: "",
        body: "",
        type: "text",
        checklist: [],
        color: "default",
        pinned: false,
        archived: false,
        labelIds: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
        sharedWith: [],
        sharedWithUserIds: [],
      };
      setCreatingNote(tempNote);
    }
  }, [createNote, user?.uid, currentSpaceId]);

  // Handler to create a new checklist note and open NoteEditor modal
  const handleCreateList = useCallback(async () => {
    const now = new Date();
    const spaceId = currentSpaceId ?? "personal";

    const noteId = await createNote({
      title: "",
      body: "",
      type: "checklist",
      checklist: [{ id: generateUUID(), text: "", completed: false }],
      color: "default",
      pinned: false,
      priority: null,
      archived: false,
      labelIds: [],
      spaceId,
    });

    if (noteId) {
      const tempNote: Note = {
        id: noteId,
        ownerId: user?.uid ?? "",
        spaceId,
        title: "",
        body: "",
        type: "checklist",
        checklist: [{ id: generateUUID(), text: "", completed: false }],
        color: "default",
        pinned: false,
        archived: false,
        labelIds: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
        sharedWith: [],
        sharedWithUserIds: [],
      };
      setCreatingNote(tempNote);
    }
  }, [createNote, user?.uid, currentSpaceId]);

  // Handler to close NoteEditor modal and delete empty notes
  const handleCloseCreator = useCallback(
    async (state?: { title: string; body: string; checklist: { text: string }[] }) => {
      if (!creatingNote) return;

      // Use passed state from editor (current values) instead of stale notes array
      const hasTitle = state ? state.title.trim().length > 0 : false;
      const hasBody = state ? state.body.trim().length > 0 : false;
      const hasChecklistContent = state
        ? state.checklist.some((item) => item.text.trim().length > 0)
        : false;

      const isEmpty = !hasTitle && !hasBody && !hasChecklistContent;

      if (isEmpty) {
        // Silently delete empty notes without showing "moved to trash" toast
        // by directly removing from Firestore instead of using handleDelete
        const { permanentlyDeleteNote } = await import("@/lib/firebase/note-service");
        await permanentlyDeleteNote(creatingNote.ownerId, creatingNote.id);
      }

      setCreatingNote(null);
    },
    [creatingNote],
  );

  // Check if user only has personal space (for hint display)
  const hasOnlyPersonalSpace =
    spaces.length === 1 && spaces[0]?.type === "personal";

  return (
    <section className="w-full">
      <Hint hint={HINTS.SHARED_NOTES} showWhen={hasOnlyPersonalSpace}>
        <div className="flex w-full items-center gap-3 rounded-2xl border px-5 py-4 shadow-sm transition dark:shadow-none bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          {/* Note option */}
          <button
            type="button"
            onClick={() => void handleCreateNote()}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 transition-all bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]"
          >
            <StickyNote className="h-5 w-5 text-zinc-400 group-hover:text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-[var(--color-primary)]">
              New Note
            </span>
          </button>
          {/* List option */}
          <button
            type="button"
            onClick={() => void handleCreateList()}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 transition-all bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]"
          >
            <CheckSquare className="h-5 w-5 text-zinc-400 group-hover:text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-[var(--color-primary)]">
              New List
            </span>
          </button>
        </div>
      </Hint>

      {creatingNote && (
        <NoteEditor
          note={creatingNote}
          onClose={(state) => void handleCloseCreator(state)}
        />
      )}
    </section>
  );
}
