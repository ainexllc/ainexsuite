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
import type { Doc, DocAttachment, DocDraft, DocType, DocColor, DocPriority } from "@/lib/types/doc";
import { generateUUID, type FilterValue, type SortConfig } from "@ainexsuite/ui";
import {
  addAttachments,
  createDoc as createDocMutation,
  deleteAttachment,
  deleteDoc as deleteDocMutation,
  removeAttachments,
  subscribeToOwnedDocs,
  subscribeToSharedDocs,
  subscribeToSpaceDocs,
  toggleArchive,
  togglePin,
  updateDoc as updateDocMutation,
  uploadDocAttachment,
  restoreDoc as restoreDocMutation,
  permanentlyDeleteDoc,
  migrateSpaceDocsSharing,
} from "@/lib/firebase/doc-service";
import { saveFiltersToPreferences } from "@/lib/firebase/preferences-service";
import { useSpaces } from "@/components/providers/spaces-provider";
import { usePreferences } from "@/components/providers/preferences-provider";

type CreateDocInput = {
  title?: string;
  body?: string;
  type?: DocType;
  checklist?: Doc["checklist"];
  color?: DocColor;
  pinned?: boolean;
  priority?: DocPriority;
  archived?: boolean;
  labelIds?: string[];
  reminderAt?: Date | null;
  reminderId?: string | null;
  docDate?: Date | null;
  attachments?: File[];
  spaceId?: string;
};

type DocsContextValue = {
  docs: Doc[];
  pinned: Doc[];
  others: Doc[];
  displayedOthers: Doc[];
  allDocs: Doc[];
  trashed: Doc[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeLabelIds: string[];
  setActiveLabelIds: (labels: string[]) => void;
  filters: FilterValue;
  setFilters: (filters: FilterValue) => void;
  sort: SortConfig;
  setSort: (sort: SortConfig) => void;
  createDoc: (input: CreateDocInput) => Promise<string | null>;
  updateDoc: (docId: string, updates: DocDraft) => Promise<void>;
  duplicateDoc: (docId: string) => Promise<string | null>;
  togglePin: (docId: string, next: boolean) => Promise<void>;
  toggleArchive: (docId: string, next: boolean) => Promise<void>;
  deleteDoc: (docId: string) => Promise<void>;
  restoreDoc: (docId: string) => Promise<void>;
  destroyDoc: (docId: string) => Promise<void>;
  destroyAllDocs: () => Promise<void>;
  removeAttachment: (docId: string, attachment: DocAttachment) => Promise<void>;
  attachFiles: (docId: string, files: File[]) => Promise<void>;
  // Infinite scroll
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  totalCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

const DocsContext = createContext<DocsContextValue | null>(null);

type DocsProviderProps = {
  children: React.ReactNode;
};

export function DocsProvider({ children }: DocsProviderProps) {
  const { user, firebaseUser } = useAuth();
  const { currentSpaceId } = useSpaces();
  const { preferences, loading: preferencesLoading } = usePreferences();
  const [ownedDocs, setOwnedDocs] = useState<Doc[]>([]);
  const [sharedDocs, setSharedDocs] = useState<Doc[]>([]);
  const [spaceDocs, setSpaceDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownedLoaded, setOwnedLoaded] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [spaceLoaded, setSpaceLoaded] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<Doc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const [deletedDocIds, setDeletedDocIds] = useState<Set<string>>(new Set());
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
  const computedDocsRef = useRef<{
    merged: Doc[];
    filtered: Doc[];
    pinned: Doc[];
    others: Doc[];
    displayedOthers: Doc[];
    hasMore: boolean;
    trashed: Doc[];
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
    // Wait for Firebase Auth to be signed in before subscribing to Firestore
    if (!user || !userId || !firebaseUser) {
      setOwnedDocs([]);
      setSharedDocs([]);
      setSpaceDocs([]);
      setPendingDocs([]);
      setLoading(false);
      setOwnedLoaded(false);
      setSharedLoaded(false);
      setSpaceLoaded(true);
      return;
    }

    setLoading(true);
    setOwnedLoaded(false);
    setSharedLoaded(false);

    const unsubscribeOwned = subscribeToOwnedDocs(
      userId,
      (incoming) => {
        setOwnedDocs(incoming);
        setOwnedLoaded(true);
      },
      (error) => {
        console.error('[Docs] Owned docs subscription error:', error);
        setOwnedLoaded(true); // Unblock UI
      },
    );

    const unsubscribeShared = subscribeToSharedDocs(
      userId,
      (incoming) => {
        setSharedDocs(incoming);
        setSharedLoaded(true);
      },
      (error) => {
        console.error('[Docs] Shared docs subscription error:', error);
        setSharedLoaded(true); // Unblock UI
      },
    );

    return () => {
      unsubscribeOwned();
      unsubscribeShared();
    };
  }, [user, userId, firebaseUser]);

  // Subscribe to space docs (docs from other users in the current space)
  useEffect(() => {
    if (!userId || !firebaseUser || !currentSpaceId || currentSpaceId === "personal") {
      setSpaceDocs([]);
      setSpaceLoaded(true);
      return;
    }

    setSpaceLoaded(false);

    const unsubscribeSpace = subscribeToSpaceDocs(
      currentSpaceId,
      userId,
      (incoming) => {
        setSpaceDocs(incoming);
        setSpaceLoaded(true);
      },
      (error) => {
        console.error('[Docs] Space docs subscription error:', error);
        setSpaceLoaded(true); // Unblock UI
      },
    );

    return () => {
      unsubscribeSpace();
    };
  }, [userId, firebaseUser, currentSpaceId]);

  useEffect(() => {
    if (!user || !userId) {
      return;
    }

    if (ownedLoaded && sharedLoaded && spaceLoaded) {
      setLoading(false);
    }
  }, [ownedLoaded, sharedLoaded, spaceLoaded, user, userId]);

  const handleCreate = useCallback(
    async (input: CreateDocInput) => {
      if (!userId) {
        return null;
      }

      const now = new Date();
      const { attachments, ...docInput } = input;
      const tempId = `optimistic-${generateUUID()}`;
      const localAttachments =
        attachments?.map<DocAttachment>((file) => ({
          id: `temp-${generateUUID()}`,
          name: file.name,
          storagePath: "",
          downloadURL: URL.createObjectURL(file),
          contentType: file.type,
          size: file.size,
        })) ?? [];

      // Use the provided spaceId or fall back to current space (default to "personal" if not set)
      const effectiveSpaceId = input.spaceId ?? currentSpaceId ?? "personal";

      const optimisticDoc: Doc = {
        id: tempId,
        ownerId: userId,
        spaceId: effectiveSpaceId,
        title: input.title ?? "",
        body: input.body ?? "",
        type:
          input.type ?? (docInput.checklist && docInput.checklist.length
            ? "checklist"
            : "text"),
        checklist: docInput.checklist ?? [],
        color: docInput.color ?? "default",
        pinned: Boolean(docInput.pinned),
        archived: Boolean(docInput.archived),
        labelIds: docInput.labelIds ?? [],
        reminderAt: docInput.reminderAt ?? null,
        reminderId: docInput.reminderId ?? null,
        attachments: localAttachments,
        createdAt: now,
        updatedAt: now,
        sharedWith: [],
        sharedWithUserIds: [],
      };

      setPendingDocs((prev) => [optimisticDoc, ...prev]);

      try {
        const docId = await createDocMutation(userId, { ...docInput, spaceId: effectiveSpaceId });

        if (attachments?.length) {
          const uploads = await Promise.all(
            attachments.map((file) => uploadDocAttachment(userId, docId, file)),
          );

          await addAttachments(userId, docId, uploads);
        }

        return docId;
      } finally {
        setPendingDocs((prev) => {
          optimisticDoc.attachments.forEach((attachment) => {
            URL.revokeObjectURL(attachment.downloadURL);
          });
          return prev.filter(doc => doc.id !== optimisticDoc.id);
        });
      }
    },
    [userId, currentSpaceId],
  );

  const handleUpdate = useCallback(
    async (docId: string, updates: DocDraft) => {
      if (!userId) {
        return;
      }

      // Find the doc to get the owner's ID (for shared space docs)
      const allDocs = [...ownedDocs, ...sharedDocs, ...spaceDocs];
      const doc = allDocs.find((n) => n.id === docId);
      const docOwnerId = doc?.ownerId ?? userId;

      await updateDocMutation(docOwnerId, docId, updates);
    },
    [userId, ownedDocs, sharedDocs, spaceDocs],
  );

  const handleDuplicate = useCallback(
    async (docId: string) => {
      if (!userId) {
        return null;
      }

      // Find the doc to duplicate
      const allDocs = [...ownedDocs, ...sharedDocs, ...spaceDocs];
      const doc = allDocs.find((n) => n.id === docId);
      if (!doc) {
        return null;
      }

      // Create a copy with updated title
      const duplicateInput: CreateDocInput = {
        title: doc.title ? `${doc.title} (Copy)` : "Copy",
        body: doc.body,
        type: doc.type,
        checklist: doc.checklist.map((item) => ({
          ...item,
          id: generateUUID(), // New IDs for checklist items
        })),
        color: doc.color,
        labelIds: doc.labelIds,
        priority: doc.priority,
      };

      return handleCreate(duplicateInput);
    },
    [userId, ownedDocs, sharedDocs, spaceDocs, handleCreate],
  );

  const handleTogglePin = useCallback(
    async (docId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      // Find the doc to get the owner's ID (for shared space docs)
      const allDocs = [...ownedDocs, ...sharedDocs, ...spaceDocs];
      const doc = allDocs.find((n) => n.id === docId);
      const docOwnerId = doc?.ownerId ?? userId;

      await togglePin(docOwnerId, docId, next);
    },
    [userId, ownedDocs, sharedDocs, spaceDocs],
  );

  const handleToggleArchive = useCallback(
    async (docId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      // Find the doc to get the owner's ID (for shared space docs)
      const allDocs = [...ownedDocs, ...sharedDocs, ...spaceDocs];
      const doc = allDocs.find((n) => n.id === docId);
      const docOwnerId = doc?.ownerId ?? userId;

      await toggleArchive(docOwnerId, docId, next);
    },
    [userId, ownedDocs, sharedDocs, spaceDocs],
  );

  const handleDelete = useCallback(
    async (docId: string) => {
      if (!userId) {
        return;
      }

      // Optimistic update
      setDeletedDocIds((prev) => {
        const next = new Set(prev);
        next.add(docId);
        return next;
      });

      try {
        await deleteDocMutation(userId, docId);
      } catch (error) {
        // Revert on error
        console.error("Failed to delete doc:", error);
        setDeletedDocIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      }
    },
    [userId],
  );

  const handleRestore = useCallback(
    async (docId: string) => {
      if (!userId) {
        return;
      }

      await restoreDocMutation(userId, docId);
    },
    [userId],
  );

  const handleDestroy = useCallback(
    async (docId: string) => {
      if (!userId) {
        return;
      }

      await permanentlyDeleteDoc(userId, docId);
    },
    [userId],
  );

  const handleDestroyAll = useCallback(async () => {
    if (!userId) {
      return;
    }

    const trashedSnapshot = computedDocsRef.current?.trashed ?? [];
    if (!trashedSnapshot.length) {
      return;
    }

    await Promise.all(
      trashedSnapshot.map(doc => permanentlyDeleteDoc(userId, doc.id)),
    );
  }, [userId]);

  const handleRemoveAttachment = useCallback(
    async (docId: string, attachment: DocAttachment) => {
      if (!userId) {
        return;
      }

      // Find the doc to get the owner's ID (for shared space docs)
      const allDocs = [...ownedDocs, ...sharedDocs, ...spaceDocs];
      const doc = allDocs.find((n) => n.id === docId);
      const docOwnerId = doc?.ownerId ?? userId;

      if (attachment.storagePath) {
        await deleteAttachment(attachment.storagePath);
      }

      await removeAttachments(docOwnerId, docId, [attachment]);
    },
    [userId, ownedDocs, sharedDocs, spaceDocs],
  );

  const handleAttachFiles = useCallback(
    async (docId: string, files: File[]) => {
      if (!userId || !files.length) {
        return;
      }

      // Find the doc to get the owner's ID (for shared space docs)
      const allDocs = [...ownedDocs, ...sharedDocs, ...spaceDocs];
      const doc = allDocs.find((n) => n.id === docId);
      const docOwnerId = doc?.ownerId ?? userId;

      const uploads = await Promise.all(
        files.map((file) => uploadDocAttachment(docOwnerId, docId, file)),
      );

      await addAttachments(docOwnerId, docId, uploads);
    },
    [userId, ownedDocs, sharedDocs, spaceDocs],
  );

  // Load more docs for progressive rendering
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

  // Migrate docs in shared spaces to populate sharedWithUserIds for docs created before the fix
  useEffect(() => {
    if (!userId || !currentSpaceId || currentSpaceId === "personal") {
      return;
    }

    // Run migration for the current shared space (only updates docs that need it)
    migrateSpaceDocsSharing(userId, currentSpaceId)
      .catch((error) => {
        console.error('[Docs] Migration failed:', error);
      });
  }, [userId, currentSpaceId]);

  const computedDocs = useMemo(() => {
    // Combine owned, shared, and space docs (deduplicating by id)
    const combined = [...ownedDocs, ...sharedDocs, ...spaceDocs];
    const docMap = new Map<string, Doc>();

    combined.forEach(doc => {
      docMap.set(doc.id, doc);
    });

    pendingDocs.forEach(doc => {
      docMap.set(doc.id, doc);
    });

    const merged = Array.from(docMap.values());

    // Dynamic sort function based on sort config
    const sortDocs = (a: Doc, b: Doc) => {
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
          // Sort by associated date (docDate field), fallback to createdAt
          aValue = a.docDate?.getTime() ?? a.createdAt.getTime();
          bValue = b.docDate?.getTime() ?? b.createdAt.getTime();
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

    // Priority sort function for Focus docs
    // Sort by: priority (high > medium > low > null), then updatedAt desc, then createdAt desc
    const sortPinnedDocs = (a: Doc, b: Doc) => {
      // Priority order: high=1, medium=2, low=3, null/undefined=4
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 4;
      const bPriority = b.priority ? priorityOrder[b.priority] : 4;

      // First sort by priority (ascending - lower number = higher priority)
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then by updatedAt desc (newest first)
      const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      if (aUpdated !== bUpdated) {
        return bUpdated - aUpdated;
      }

      // Finally by createdAt desc (newest first)
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bCreated - aCreated;
    };

    const trashed = merged
      .filter(doc => Boolean(doc.deletedAt))
      .sort((a, b) => {
        const aDeleted = a.deletedAt?.getTime() ?? a.updatedAt?.getTime() ?? a.createdAt.getTime();
        const bDeleted = b.deletedAt?.getTime() ?? b.updatedAt?.getTime() ?? b.createdAt.getTime();
        return bDeleted - aDeleted;
      });

    const activeDocs = merged.filter(doc => !doc.deletedAt && !deletedDocIds.has(doc.id));

    // Count archived docs for badge display
    const archivedCount = activeDocs.filter(doc => doc.archived).length;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 1;
    const hasColorFilter = filters.colors && filters.colors.length > 0;
    const hasDateFilter = filters.dateRange?.start || filters.dateRange?.end;
    const hasDocTypeFilter = filters.noteType && filters.noteType !== 'all';

    const filtered = activeDocs.filter(doc => {
      // Always exclude archived docs
      if (doc.archived) {
        return false;
      }

      // Filter by current space
      // "personal" space shows docs with spaceId "personal" or no spaceId (legacy docs)
      // Other spaces show docs with matching spaceId
      if (currentSpaceId === "personal") {
        if (doc.spaceId && doc.spaceId !== "personal") {
          return false; // Personal view only shows docs with "personal" spaceId or no spaceId
        }
      } else {
        if (doc.spaceId !== currentSpaceId) {
          return false; // Space view only shows docs matching the space
        }
      }

      // Filter by doc type (text vs checklist)
      if (hasDocTypeFilter) {
        if (doc.type !== filters.noteType) {
          return false;
        }
      }

      // Filter by labels (combine activeLabelIds and filters.labels)
      const allLabelFilters = [...activeLabelIds, ...(filters.labels || [])];
      if (allLabelFilters.length > 0) {
        const matchesLabels = allLabelFilters.some((labelId) => doc.labelIds.includes(labelId));
        if (!matchesLabels) {
          return false;
        }
      }

      // Filter by colors
      if (hasColorFilter && filters.colors) {
        if (!filters.colors.includes(doc.color)) {
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
            targetDate = doc.updatedAt ?? doc.createdAt;
            break;
          case 'noteDate':
            targetDate = doc.docDate ?? doc.createdAt;
            break;
          case 'createdAt':
          default:
            targetDate = doc.createdAt;
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

      const haystack = [doc.title, doc.body, ...doc.checklist.map((item) => item.text)]
        .join("\n")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    const pinned = filtered.filter(doc => doc.pinned).sort(sortPinnedDocs);
    const others = filtered.filter(doc => !doc.pinned).sort(sortDocs);

    // Progressive rendering: only display up to displayLimit docs in Library
    const displayedOthers = others.slice(0, displayLimit);
    const hasMore = others.length > displayLimit;

    return {
      merged: activeDocs,
      filtered,
      pinned,
      others,
      displayedOthers,
      hasMore,
      trashed,
      archivedCount,
      totalCount: others.length,
    };
  }, [pendingDocs, ownedDocs, sharedDocs, spaceDocs, searchQuery, activeLabelIds, currentSpaceId, filters, sort, displayLimit, deletedDocIds]);

  useEffect(() => {
    computedDocsRef.current = computedDocs;
  }, [computedDocs]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && computedDocs.hasMore && !isLoadingMore && !loading) {
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
  }, [computedDocs.hasMore, isLoadingMore, loading, loadMore]);

  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const updateActiveLabelIds = useCallback((labels: string[]) => {
    setActiveLabelIds(labels);
  }, []);

  const value = useMemo<DocsContextValue>(
    () => ({
      allDocs: computedDocs.merged,
      docs: computedDocs.filtered,
      pinned: computedDocs.pinned,
      others: computedDocs.others,
      displayedOthers: computedDocs.displayedOthers,
      trashed: computedDocs.trashed,
      loading,
      searchQuery,
      setSearchQuery: updateSearchQuery,
      activeLabelIds,
      setActiveLabelIds: updateActiveLabelIds,
      filters,
      setFilters,
      sort,
      setSort,
      createDoc: handleCreate,
      updateDoc: handleUpdate,
      duplicateDoc: handleDuplicate,
      togglePin: handleTogglePin,
      toggleArchive: handleToggleArchive,
      deleteDoc: handleDelete,
      restoreDoc: handleRestore,
      destroyDoc: handleDestroy,
      destroyAllDocs: handleDestroyAll,
      removeAttachment: handleRemoveAttachment,
      attachFiles: handleAttachFiles,
      // Infinite scroll
      hasMore: computedDocs.hasMore,
      isLoadingMore,
      loadMore,
      totalCount: computedDocs.totalCount,
      sentinelRef,
    }),
    [
      computedDocs.merged,
      computedDocs.filtered,
      computedDocs.pinned,
      computedDocs.others,
      computedDocs.displayedOthers,
      computedDocs.trashed,
      computedDocs.hasMore,
      computedDocs.totalCount,
      loading,
      isLoadingMore,
      loadMore,
      searchQuery,
      activeLabelIds,
      filters,
      sort,
      handleCreate,
      handleUpdate,
      handleDuplicate,
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
    <DocsContext.Provider value={value}>{children}</DocsContext.Provider>
  );
}

export function useDocs() {
  const context = useContext(DocsContext);

  if (!context) {
    throw new Error("useDocs must be used within a DocsProvider.");
  }

  return context;
}
