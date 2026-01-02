"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  type RefObject,
} from "react";

const DISPLAY_BATCH_SIZE = 20;
import { useAuth } from "@ainexsuite/auth";
import type { Note, NoteAttachment, NoteDraft, NoteType, NoteColor, NotePriority } from "@/lib/types/note";
import { generateUUID, type FilterValue, type SortConfig } from "@ainexsuite/ui";
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
import { saveFiltersToPreferences } from "@/lib/firebase/preferences-service";
import { useSpaces } from "@/components/providers/spaces-provider";
import { usePreferences } from "@/components/providers/preferences-provider";

type CreateNoteInput = {
  title?: string;
  body?: string;
  type?: NoteType;
  checklist?: Note["checklist"];
  color?: NoteColor;
  pinned?: boolean;
  priority?: NotePriority;
  archived?: boolean;
  labelIds?: string[];
  reminderAt?: Date | null;
  reminderId?: string | null;
  noteDate?: Date | null;
  attachments?: File[];
  spaceId?: string;
};

type NotesContextValue = {
  notes: Note[];
  pinned: Note[];
  others: Note[];
  displayedOthers: Note[];
  allNotes: Note[];
  trashed: Note[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeLabelIds: string[];
  setActiveLabelIds: (labels: string[]) => void;
  filters: FilterValue;
  setFilters: (filters: FilterValue) => void;
  sort: SortConfig;
  setSort: (sort: SortConfig) => void;
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
  // Infinite scroll
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  totalCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

type NotesProviderProps = {
  children: React.ReactNode;
};

export function NotesProvider({ children }: NotesProviderProps) {
  const { user } = useAuth();
  const { currentSpaceId } = useSpaces();
  const { preferences, loading: preferencesLoading } = usePreferences();
  const [ownedNotes, setOwnedNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownedLoaded, setOwnedLoaded] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const [deletedNoteIds, setDeletedNoteIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterValue>({
    labels: [],
    colors: [],
    dateRange: { start: null, end: null },
  });
  const [sort, setSort] = useState<SortConfig>({
    field: 'updatedAt',
    direction: 'desc',
  });
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Infinite scroll state
  const [displayLimit, setDisplayLimit] = useState(DISPLAY_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const computedNotesRef = useRef<{
    merged: Note[];
    filtered: Note[];
    pinned: Note[];
    others: Note[];
    displayedOthers: Note[];
    hasMore: boolean;
    trashed: Note[];
    archivedCount: number;
    totalCount: number;
  }>({ merged: [], filtered: [], pinned: [], others: [], displayedOthers: [], hasMore: false, trashed: [], archivedCount: 0, totalCount: 0 });

  const userId = user?.uid ?? null;

  // Load saved filters from preferences on mount
  useEffect(() => {
    if (!preferencesLoading && !filtersInitialized) {
      if (preferences.savedFilters) {
        setFilters(preferences.savedFilters);
      }
      if (preferences.savedSort) {
        setSort(preferences.savedSort);
      }
      setFiltersInitialized(true);
    }
  }, [preferencesLoading, filtersInitialized, preferences.savedFilters, preferences.savedSort]);

  // Debounced save filters to preferences (500ms delay)
  useEffect(() => {
    if (!filtersInitialized || !userId) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save after 500ms of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      void saveFiltersToPreferences(userId, filters, sort);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [filters, sort, filtersInitialized, userId]);

  useEffect(() => {
    if (!user || !userId) {
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

    const unsubscribeOwned = subscribeToOwnedNotes(
      userId,
      (incoming) => {
        setOwnedNotes(incoming);
        setOwnedLoaded(true);
      },
      (_error) => {
        setOwnedLoaded(true); // Unblock UI
      },
    );

    const unsubscribeShared = subscribeToSharedNotes(
      userId,
      (incoming) => {
        setSharedNotes(incoming);
        setSharedLoaded(true);
      },
      (_error) => {
        setSharedLoaded(true); // Unblock UI
      },
    );

    return () => {
      unsubscribeOwned();
      unsubscribeShared();
    };
  }, [user, userId]);

  useEffect(() => {
    if (!user || !userId) {
      return;
    }

    if (ownedLoaded && sharedLoaded) {
      setLoading(false);
    }
  }, [ownedLoaded, sharedLoaded, user, userId]);

  const handleCreate = useCallback(
    async (input: CreateNoteInput) => {
      if (!userId) {
        return null;
      }

      const now = new Date();
      const { attachments, ...noteInput } = input;
      const tempId = `optimistic-${generateUUID()}`;
      const localAttachments =
        attachments?.map<NoteAttachment>((file) => ({
          id: `temp-${generateUUID()}`,
          name: file.name,
          storagePath: "",
          downloadURL: URL.createObjectURL(file),
          contentType: file.type,
          size: file.size,
        })) ?? [];

      // Use the provided spaceId or fall back to current space (unless it's "personal" which means no spaceId)
      const effectiveSpaceId = input.spaceId ?? (currentSpaceId === "personal" ? undefined : currentSpaceId);

      const optimisticNote: Note = {
        id: tempId,
        ownerId: userId,
        spaceId: effectiveSpaceId,
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
        const noteId = await createNoteMutation(userId, { ...noteInput, spaceId: effectiveSpaceId });

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
    [userId, currentSpaceId],
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

      // Optimistic update
      setDeletedNoteIds((prev) => {
        const next = new Set(prev);
        next.add(noteId);
        return next;
      });

      try {
        await deleteNoteMutation(userId, noteId);
      } catch (error) {
        // Revert on error
        console.error("Failed to delete note:", error);
        setDeletedNoteIds((prev) => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });
      }
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

  // Load more notes for progressive rendering
  const loadMore = useCallback(() => {
    setIsLoadingMore(true);
    // Simulate a brief loading state for smooth UX
    setTimeout(() => {
      setDisplayLimit((prev) => prev + DISPLAY_BATCH_SIZE);
      setIsLoadingMore(false);
    }, 100);
  }, []);

  // Reset display limit when filters or search changes
  useEffect(() => {
    setDisplayLimit(DISPLAY_BATCH_SIZE);
  }, [searchQuery, activeLabelIds, filters, currentSpaceId]);

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

    // Dynamic sort function based on sort config
    const sortNotes = (a: Note, b: Note) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sort.field) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'noteDate':
          // Sort by associated date (noteDate), fallback to createdAt
          aValue = a.noteDate?.getTime() ?? a.createdAt.getTime();
          bValue = b.noteDate?.getTime() ?? b.createdAt.getTime();
          break;
        case 'updatedAt':
        default:
          aValue = a.updatedAt?.getTime() ?? a.createdAt.getTime();
          bValue = b.updatedAt?.getTime() ?? b.createdAt.getTime();
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sort.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    };

    // Priority sort function for Focus notes
    // Sort by: priority (high > medium > low > null), then createdAt desc, then updatedAt desc
    const sortPinnedNotes = (a: Note, b: Note) => {
      // Priority order: high=1, medium=2, low=3, null/undefined=4
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 4;
      const bPriority = b.priority ? priorityOrder[b.priority] : 4;

      // First sort by priority (ascending - lower number = higher priority)
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then by createdAt desc (newest first)
      const aCreated = a.createdAt.getTime();
      const bCreated = b.createdAt.getTime();
      if (aCreated !== bCreated) {
        return bCreated - aCreated;
      }

      // Finally by updatedAt desc (newest first)
      const aUpdated = a.updatedAt?.getTime() ?? aCreated;
      const bUpdated = b.updatedAt?.getTime() ?? bCreated;
      return bUpdated - aUpdated;
    };

    const trashed = merged
      .filter((note) => Boolean(note.deletedAt))
      .sort((a, b) => {
        const aDeleted = a.deletedAt?.getTime() ?? a.updatedAt?.getTime() ?? a.createdAt.getTime();
        const bDeleted = b.deletedAt?.getTime() ?? b.updatedAt?.getTime() ?? b.createdAt.getTime();
        return bDeleted - aDeleted;
      });

    const activeNotes = merged.filter((note) => !note.deletedAt && !deletedNoteIds.has(note.id));

    // Count archived notes for badge display
    const archivedCount = activeNotes.filter((note) => note.archived).length;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 1;
    const hasColorFilter = filters.colors && filters.colors.length > 0;
    const hasDateFilter = filters.dateRange?.start || filters.dateRange?.end;
    const hasNoteTypeFilter = filters.noteType && filters.noteType !== 'all';

    const filtered = activeNotes.filter((note) => {
      // Always exclude archived notes
      if (note.archived) {
        return false;
      }

      // Filter by current space
      // "personal" space shows notes with no spaceId (personal notes)
      // Other spaces show notes with matching spaceId
      if (currentSpaceId === "personal") {
        if (note.spaceId) {
          return false; // Personal view only shows notes without a spaceId
        }
      } else {
        if (note.spaceId !== currentSpaceId) {
          return false; // Space view only shows notes matching the space
        }
      }

      // Filter by note type (text vs checklist)
      if (hasNoteTypeFilter) {
        if (note.type !== filters.noteType) {
          return false;
        }
      }

      // Filter by labels (combine activeLabelIds and filters.labels)
      const allLabelFilters = [...activeLabelIds, ...(filters.labels || [])];
      if (allLabelFilters.length > 0) {
        const matchesLabels = allLabelFilters.some((labelId) => note.labelIds.includes(labelId));
        if (!matchesLabels) {
          return false;
        }
      }

      // Filter by colors
      if (hasColorFilter && filters.colors) {
        if (!filters.colors.includes(note.color)) {
          return false;
        }
      }

      // Filter by date range using the specified dateField
      if (hasDateFilter && filters.dateRange) {
        // Determine which date field to use (default: createdAt)
        const dateField = filters.dateField || 'createdAt';
        let targetDate: Date | null = null;

        switch (dateField) {
          case 'updatedAt':
            targetDate = note.updatedAt ?? note.createdAt;
            break;
          case 'noteDate':
            targetDate = note.noteDate ?? note.createdAt;
            break;
          case 'createdAt':
          default:
            targetDate = note.createdAt;
            break;
        }

        if (filters.dateRange.start && targetDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && targetDate > filters.dateRange.end) {
          return false;
        }
      }

      if (!hasQuery) {
        return true;
      }

      const haystack = [note.title, note.body, ...note.checklist.map((item) => item.text)]
        .join("\n")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    const pinned = filtered.filter((note) => note.pinned).sort(sortPinnedNotes);
    const others = filtered.filter((note) => !note.pinned).sort(sortNotes);

    // Progressive rendering: only display up to displayLimit notes in Library
    const displayedOthers = others.slice(0, displayLimit);
    const hasMore = others.length > displayLimit;

    return {
      merged: activeNotes,
      filtered,
      pinned,
      others,
      displayedOthers,
      hasMore,
      trashed,
      archivedCount,
      totalCount: others.length,
    };
  }, [pendingNotes, ownedNotes, sharedNotes, searchQuery, activeLabelIds, currentSpaceId, filters, sort, displayLimit, deletedNoteIds]);

  useEffect(() => {
    computedNotesRef.current = computedNotes;
  }, [computedNotes]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && computedNotes.hasMore && !isLoadingMore && !loading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading before sentinel is visible
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [computedNotes.hasMore, isLoadingMore, loading, loadMore]);

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
      displayedOthers: computedNotes.displayedOthers,
      trashed: computedNotes.trashed,
      loading,
      searchQuery,
      setSearchQuery: updateSearchQuery,
      activeLabelIds,
      setActiveLabelIds: updateActiveLabelIds,
      filters,
      setFilters,
      sort,
      setSort,
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
      // Infinite scroll
      hasMore: computedNotes.hasMore,
      isLoadingMore,
      loadMore,
      totalCount: computedNotes.totalCount,
      sentinelRef,
    }),
    [
      computedNotes.merged,
      computedNotes.filtered,
      computedNotes.pinned,
      computedNotes.others,
      computedNotes.displayedOthers,
      computedNotes.trashed,
      computedNotes.hasMore,
      computedNotes.totalCount,
      loading,
      isLoadingMore,
      loadMore,
      searchQuery,
      activeLabelIds,
      filters,
      sort,
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
