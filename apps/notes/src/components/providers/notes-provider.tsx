"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { Note, NoteAttachment, NoteDraft, NoteType, NoteColor } from "@/lib/types/note";
import {
  addAttachments,
  createNote as createNoteMutation,
  deleteAttachment,
  deleteNote as deleteNoteMutation,
  removeAttachments,
  subscribeToOwnedNotes,
  subscribeToSharedNotes,
  toggleArchive,
  togglePin,
  updateNote as updateNoteMutation,
  uploadNoteAttachment,
  restoreNote as restoreNoteMutation,
  permanentlyDeleteNote,
} from "@/lib/firebase/note-service";

type CreateNoteInput = {
  title?: string;
  body?: string;
  type?: NoteType;
  checklist?: Note["checklist"];
  color?: NoteColor;
  pinned?: boolean;
  archived?: boolean;
  labelIds?: string[];
  reminderAt?: Date | null;
  reminderId?: string | null;
  attachments?: File[];
};

type NotesContextValue = {
  notes: Note[];
  pinned: Note[];
  others: Note[];
  allNotes: Note[];
  trashed: Note[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeLabelIds: string[];
  setActiveLabelIds: (labels: string[]) => void;
  createNote: (input: CreateNoteInput) => Promise<string | null>;
  updateNote: (noteId: string, updates: NoteDraft) => Promise<void>;
  togglePin: (noteId: string, next: boolean) => Promise<void>;
  toggleArchive: (noteId: string, next: boolean) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  restoreNote: (noteId: string) => Promise<void>;
  destroyNote: (noteId: string) => Promise<void>;
  destroyAllNotes: () => Promise<void>;
  removeAttachment: (noteId: string, attachment: NoteAttachment) => Promise<void>;
  attachFiles: (noteId: string, files: File[]) => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

type NotesProviderProps = {
  children: React.ReactNode;
};

export function NotesProvider({ children }: NotesProviderProps) {
  const { status, user } = useAuth();
  const [ownedNotes, setOwnedNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownedLoaded, setOwnedLoaded] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const computedNotesRef = useRef<{
    merged: Note[];
    filtered: Note[];
    pinned: Note[];
    others: Note[];
    trashed: Note[];
  }>({ merged: [], filtered: [], pinned: [], others: [], trashed: [] });

  const userId = user?.id ?? null;

  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      setOwnedNotes([]);
      setSharedNotes([]);
      setPendingNotes([]);
      setLoading(false);
      setOwnedLoaded(false);
      setSharedLoaded(false);
      return;
    }

    setLoading(true);
    setOwnedLoaded(false);
    setSharedLoaded(false);

    const unsubscribeOwned = subscribeToOwnedNotes(userId, (incoming) => {
      setOwnedNotes(incoming);
      setOwnedLoaded(true);
    });

    const unsubscribeShared = subscribeToSharedNotes(userId, (incoming) => {
      setSharedNotes(incoming);
      setSharedLoaded(true);
    });

    return () => {
      unsubscribeOwned();
      unsubscribeShared();
    };
  }, [status, userId]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      return;
    }

    if (ownedLoaded && sharedLoaded) {
      setLoading(false);
    }
  }, [ownedLoaded, sharedLoaded, status, userId]);

  const handleCreate = useCallback(
    async (input: CreateNoteInput) => {
      if (!userId) {
        return null;
      }

      const now = new Date();
      const { attachments, ...noteInput } = input;
      const tempId = `optimistic-${crypto.randomUUID()}`;
      const localAttachments =
        attachments?.map<NoteAttachment>((file) => ({
          id: `temp-${crypto.randomUUID()}`,
          name: file.name,
          storagePath: "",
          downloadURL: URL.createObjectURL(file),
          contentType: file.type,
          size: file.size,
        })) ?? [];

      const optimisticNote: Note = {
        id: tempId,
        ownerId: userId,
        title: input.title ?? "",
        body: input.body ?? "",
        type:
          input.type ?? (noteInput.checklist && noteInput.checklist.length
            ? "checklist"
            : "text"),
        checklist: noteInput.checklist ?? [],
        color: noteInput.color ?? "default",
        pinned: Boolean(noteInput.pinned),
        archived: Boolean(noteInput.archived),
        labelIds: noteInput.labelIds ?? [],
        reminderAt: noteInput.reminderAt ?? null,
        reminderId: noteInput.reminderId ?? null,
        attachments: localAttachments,
        createdAt: now,
        updatedAt: now,
        sharedWith: [],
        sharedWithUserIds: [],
      };

      setPendingNotes((prev) => [optimisticNote, ...prev]);

      try {
        const noteId = await createNoteMutation(userId, noteInput);

        if (attachments?.length) {
          const uploads = await Promise.all(
            attachments.map((file) => uploadNoteAttachment(userId, noteId, file)),
          );

          await addAttachments(userId, noteId, uploads);
        }

        return noteId;
      } finally {
        setPendingNotes((prev) => {
          optimisticNote.attachments.forEach((attachment) => {
            URL.revokeObjectURL(attachment.downloadURL);
          });
          return prev.filter((note) => note.id !== optimisticNote.id);
        });
      }
    },
    [userId],
  );

  const handleUpdate = useCallback(
    async (noteId: string, updates: NoteDraft) => {
      if (!userId) {
        return;
      }

      await updateNoteMutation(userId, noteId, updates);
    },
    [userId],
  );

  const handleTogglePin = useCallback(
    async (noteId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      await togglePin(userId, noteId, next);
    },
    [userId],
  );

  const handleToggleArchive = useCallback(
    async (noteId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      await toggleArchive(userId, noteId, next);
    },
    [userId],
  );

  const handleDelete = useCallback(
    async (noteId: string) => {
      if (!userId) {
        return;
      }

      await deleteNoteMutation(userId, noteId);
    },
    [userId],
  );

  const handleRestore = useCallback(
    async (noteId: string) => {
      if (!userId) {
        return;
      }

      await restoreNoteMutation(userId, noteId);
    },
    [userId],
  );

  const handleDestroy = useCallback(
    async (noteId: string) => {
      if (!userId) {
        return;
      }

      await permanentlyDeleteNote(userId, noteId);
    },
    [userId],
  );

  const handleDestroyAll = useCallback(async () => {
    if (!userId) {
      return;
    }

    const trashedSnapshot = computedNotesRef.current?.trashed ?? [];
    if (!trashedSnapshot.length) {
      return;
    }

    await Promise.all(
      trashedSnapshot.map((note) => permanentlyDeleteNote(userId, note.id)),
    );
  }, [userId]);

  const handleRemoveAttachment = useCallback(
    async (noteId: string, attachment: NoteAttachment) => {
      if (!userId) {
        return;
      }

      if (attachment.storagePath) {
        await deleteAttachment(attachment.storagePath);
      }

      await removeAttachments(userId, noteId, [attachment]);
    },
    [userId],
  );

  const handleAttachFiles = useCallback(
    async (noteId: string, files: File[]) => {
      if (!userId || !files.length) {
        return;
      }

      const uploads = await Promise.all(
        files.map((file) => uploadNoteAttachment(userId, noteId, file)),
      );

      await addAttachments(userId, noteId, uploads);
    },
    [userId],
  );

  const computedNotes = useMemo(() => {
    const combined = [...ownedNotes, ...sharedNotes];
    const noteMap = new Map<string, Note>();

    combined.forEach((note) => {
      noteMap.set(note.id, note);
    });

    pendingNotes.forEach((note) => {
      noteMap.set(note.id, note);
    });

    const merged = Array.from(noteMap.values());

    const sortByNewest = (a: Note, b: Note) => {
      const aTime = a.updatedAt?.getTime() ?? a.createdAt.getTime();
      const bTime = b.updatedAt?.getTime() ?? b.createdAt.getTime();
      return bTime - aTime;
    };

    const trashed = merged
      .filter((note) => Boolean(note.deletedAt))
      .sort((a, b) => {
        const aDeleted = a.deletedAt?.getTime() ?? a.updatedAt?.getTime() ?? a.createdAt.getTime();
        const bDeleted = b.deletedAt?.getTime() ?? b.updatedAt?.getTime() ?? b.createdAt.getTime();
        return bDeleted - aDeleted;
      });

    const activeNotes = merged.filter((note) => !note.deletedAt);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 1;
    const hasLabelFilter = activeLabelIds.length > 0;

    const filtered = activeNotes.filter((note) => {
      // Exclude archived notes from workspace view
      if (note.archived) {
        return false;
      }

      const matchesLabels = !hasLabelFilter
        ? true
        : activeLabelIds.some((labelId) => note.labelIds.includes(labelId));

      if (!matchesLabels) {
        return false;
      }

      if (!hasQuery) {
        return true;
      }

      const haystack = [note.title, note.body, ...note.checklist.map((item) => item.text)]
        .join("\n")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    const pinned = filtered.filter((note) => note.pinned).sort(sortByNewest);
    const others = filtered.filter((note) => !note.pinned).sort(sortByNewest);

    return {
      merged: activeNotes,
      filtered,
      pinned,
      others,
      trashed,
    };
  }, [pendingNotes, ownedNotes, sharedNotes, searchQuery, activeLabelIds]);

  useEffect(() => {
    computedNotesRef.current = computedNotes;
  }, [computedNotes]);

  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const updateActiveLabelIds = useCallback((labels: string[]) => {
    setActiveLabelIds(labels);
  }, []);

  const value = useMemo<NotesContextValue>(
    () => ({
      allNotes: computedNotes.merged,
      notes: computedNotes.filtered,
      pinned: computedNotes.pinned,
      others: computedNotes.others,
      trashed: computedNotes.trashed,
      loading,
      searchQuery,
      setSearchQuery: updateSearchQuery,
      activeLabelIds,
      setActiveLabelIds: updateActiveLabelIds,
      createNote: handleCreate,
      updateNote: handleUpdate,
      togglePin: handleTogglePin,
      toggleArchive: handleToggleArchive,
      deleteNote: handleDelete,
      restoreNote: handleRestore,
      destroyNote: handleDestroy,
      destroyAllNotes: handleDestroyAll,
      removeAttachment: handleRemoveAttachment,
      attachFiles: handleAttachFiles,
    }),
    [
      computedNotes.merged,
      computedNotes.filtered,
      computedNotes.pinned,
      computedNotes.others,
      computedNotes.trashed,
      loading,
      searchQuery,
      activeLabelIds,
      handleCreate,
      handleUpdate,
      handleTogglePin,
      handleToggleArchive,
      handleDelete,
      handleRestore,
      handleDestroy,
      handleDestroyAll,
      handleRemoveAttachment,
      handleAttachFiles,
      updateSearchQuery,
      updateActiveLabelIds,
    ],
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider.");
  }

  return context;
}
