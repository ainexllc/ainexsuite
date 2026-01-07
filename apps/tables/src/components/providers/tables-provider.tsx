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
import type { Table, TableAttachment, TableDraft, TableType, TableColor, TablePriority } from "@/lib/types/table";
import { generateUUID, type FilterValue, type SortConfig } from "@ainexsuite/ui";
import {
  addAttachments,
  createTable as createTableMutation,
  deleteAttachment,
  deleteTable as deleteTableMutation,
  removeAttachments,
  subscribeToOwnedTables,
  subscribeToSharedTables,
  subscribeToSpaceTables,
  toggleArchive,
  togglePin,
  updateDoc as updateDocMutation,
  uploadTableAttachment,
  restoreTable as restoreTableMutation,
  permanentlyDeleteTable,
  migrateSpaceTablesSharing,
} from "@/lib/firebase/table-service";
import { saveFiltersToPreferences } from "@/lib/firebase/preferences-service";
import { useSpaces } from "@/components/providers/spaces-provider";
import { usePreferences } from "@/components/providers/preferences-provider";

type CreateTableInput = {
  title?: string;
  body?: string;
  type?: TableType;
  checklist?: Table["checklist"];
  spreadsheet?: Table["spreadsheet"];
  color?: TableColor;
  pinned?: boolean;
  priority?: TablePriority;
  archived?: boolean;
  labelIds?: string[];
  reminderAt?: Date | null;
  reminderId?: string | null;
  tableDate?: Date | null;
  attachments?: File[];
  spaceId?: string;
};

type TablesContextValue = {
  tables: Table[];
  pinned: Table[];
  others: Table[];
  displayedOthers: Table[];
  allTables: Table[];
  trashed: Table[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeLabelIds: string[];
  setActiveLabelIds: (labels: string[]) => void;
  filters: FilterValue;
  setFilters: (filters: FilterValue) => void;
  sort: SortConfig;
  setSort: (sort: SortConfig) => void;
  createTable: (input: CreateTableInput) => Promise<string | null>;
  updateDoc: (tableId: string, updates: TableDraft) => Promise<void>;
  duplicateTable: (tableId: string) => Promise<string | null>;
  togglePin: (tableId: string, next: boolean) => Promise<void>;
  toggleArchive: (tableId: string, next: boolean) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  restoreTable: (tableId: string) => Promise<void>;
  destroyTable: (tableId: string) => Promise<void>;
  destroyAllTables: () => Promise<void>;
  removeAttachment: (tableId: string, attachment: TableAttachment) => Promise<void>;
  attachFiles: (tableId: string, files: File[]) => Promise<void>;
  // Infinite scroll
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  totalCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

const TablesContext = createContext<TablesContextValue | null>(null);

type TablesProviderProps = {
  children: React.ReactNode;
};

export function TablesProvider({ children }: TablesProviderProps) {
  const { user } = useAuth();
  const { currentSpaceId } = useSpaces();
  const { preferences, loading: preferencesLoading } = usePreferences();
  const [ownedTables, setOwnedTables] = useState<Table[]>([]);
  const [sharedTables, setSharedTables] = useState<Table[]>([]);
  const [spaceTables, setSpaceTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownedLoaded, setOwnedLoaded] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [spaceLoaded, setSpaceLoaded] = useState(false);
  const [pendingTables, setPendingTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const [deletedTableIds, setDeletedTableIds] = useState<Set<string>>(new Set());
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
  const computedTablesRef = useRef<{
    merged: Table[];
    filtered: Table[];
    pinned: Table[];
    others: Table[];
    displayedOthers: Table[];
    hasMore: boolean;
    trashed: Table[];
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
      setOwnedTables([]);
      setSharedTables([]);
      setSpaceTables([]);
      setPendingTables([]);
      setLoading(false);
      setOwnedLoaded(false);
      setSharedLoaded(false);
      setSpaceLoaded(true);
      return;
    }

    setLoading(true);
    setOwnedLoaded(false);
    setSharedLoaded(false);

    const unsubscribeOwned = subscribeToOwnedTables(
      userId,
      (incoming) => {
        setOwnedTables(incoming);
        setOwnedLoaded(true);
      },
      (error) => {
        console.error('[Tables] Owned tables subscription error:', error);
        setOwnedLoaded(true); // Unblock UI
      },
    );

    const unsubscribeShared = subscribeToSharedTables(
      userId,
      (incoming) => {
        setSharedTables(incoming);
        setSharedLoaded(true);
      },
      (error) => {
        console.error('[Tables] Shared tables subscription error:', error);
        setSharedLoaded(true); // Unblock UI
      },
    );

    return () => {
      unsubscribeOwned();
      unsubscribeShared();
    };
  }, [user, userId]);

  // Subscribe to space tables (tables from other users in the current space)
  useEffect(() => {
    if (!userId || !currentSpaceId || currentSpaceId === "personal") {
      setSpaceTables([]);
      setSpaceLoaded(true);
      return;
    }

    setSpaceLoaded(false);

    const unsubscribeSpace = subscribeToSpaceTables(
      currentSpaceId,
      userId,
      (incoming) => {
        setSpaceTables(incoming);
        setSpaceLoaded(true);
      },
      (error) => {
        console.error('[Tables] Space tables subscription error:', error);
        setSpaceLoaded(true); // Unblock UI
      },
    );

    return () => {
      unsubscribeSpace();
    };
  }, [userId, currentSpaceId]);

  useEffect(() => {
    if (!user || !userId) {
      return;
    }

    if (ownedLoaded && sharedLoaded && spaceLoaded) {
      setLoading(false);
    }
  }, [ownedLoaded, sharedLoaded, spaceLoaded, user, userId]);

  const handleCreate = useCallback(
    async (input: CreateTableInput) => {
      if (!userId) {
        return null;
      }

      const now = new Date();
      const { attachments, ...tableInput } = input;
      const tempId = `optimistic-${generateUUID()}`;
      const localAttachments =
        attachments?.map<TableAttachment>((file) => ({
          id: `temp-${generateUUID()}`,
          name: file.name,
          storagePath: "",
          downloadURL: URL.createObjectURL(file),
          contentType: file.type,
          size: file.size,
        })) ?? [];

      // Use the provided spaceId or fall back to current space (unless it's "personal" which means no spaceId)
      const effectiveSpaceId = input.spaceId ?? (currentSpaceId === "personal" ? undefined : currentSpaceId);

      const optimisticTable: Table = {
        id: tempId,
        ownerId: userId,
        spaceId: effectiveSpaceId,
        title: input.title ?? "",
        body: input.body ?? "",
        type:
          input.type ?? (tableInput.checklist && tableInput.checklist.length
            ? "checklist"
            : "text"),
        checklist: tableInput.checklist ?? [],
        spreadsheet: tableInput.spreadsheet,
        color: tableInput.color ?? "default",
        pinned: Boolean(tableInput.pinned),
        archived: Boolean(tableInput.archived),
        labelIds: tableInput.labelIds ?? [],
        reminderAt: tableInput.reminderAt ?? null,
        reminderId: tableInput.reminderId ?? null,
        attachments: localAttachments,
        createdAt: now,
        updatedAt: now,
        sharedWith: [],
        sharedWithUserIds: [],
      };

      setPendingTables((prev) => [optimisticTable, ...prev]);

      try {
        const tableId = await createTableMutation(userId, { ...tableInput, spaceId: effectiveSpaceId });

        if (attachments?.length) {
          const uploads = await Promise.all(
            attachments.map((file) => uploadTableAttachment(userId, tableId, file)),
          );

          await addAttachments(userId, tableId, uploads);
        }

        return tableId;
      } finally {
        setPendingTables((prev) => {
          optimisticTable.attachments.forEach((attachment) => {
            URL.revokeObjectURL(attachment.downloadURL);
          });
          return prev.filter(table => table.id !== optimisticTable.id);
        });
      }
    },
    [userId, currentSpaceId],
  );

  const handleUpdate = useCallback(
    async (tableId: string, updates: TableDraft) => {
      if (!userId) {
        return;
      }

      // Find the table to get the owner's ID (for shared space tables)
      const allTables = [...ownedTables, ...sharedTables, ...spaceTables];
      const table = allTables.find((n) => n.id === tableId);
      const tableOwnerId = table?.ownerId ?? userId;

      await updateDocMutation(tableOwnerId, tableId, updates);
    },
    [userId, ownedTables, sharedTables, spaceTables],
  );

  const handleDuplicate = useCallback(
    async (tableId: string) => {
      if (!userId) {
        return null;
      }

      // Find the table to duplicate
      const allTables = [...ownedTables, ...sharedTables, ...spaceTables];
      const table = allTables.find((n) => n.id === tableId);
      if (!table) {
        return null;
      }

      // Create a copy with updated title
      const duplicateInput: CreateTableInput = {
        title: table.title ? `${table.title} (Copy)` : "Copy",
        body: table.body,
        type: table.type,
        checklist: table.checklist.map((item) => ({
          ...item,
          id: generateUUID(), // New IDs for checklist items
        })),
        color: table.color,
        labelIds: table.labelIds,
        priority: table.priority,
      };

      return handleCreate(duplicateInput);
    },
    [userId, ownedTables, sharedTables, spaceTables, handleCreate],
  );

  const handleTogglePin = useCallback(
    async (tableId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      // Find the table to get the owner's ID (for shared space tables)
      const allTables = [...ownedTables, ...sharedTables, ...spaceTables];
      const table = allTables.find((n) => n.id === tableId);
      const tableOwnerId = table?.ownerId ?? userId;

      await togglePin(tableOwnerId, tableId, next);
    },
    [userId, ownedTables, sharedTables, spaceTables],
  );

  const handleToggleArchive = useCallback(
    async (tableId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      // Find the table to get the owner's ID (for shared space tables)
      const allTables = [...ownedTables, ...sharedTables, ...spaceTables];
      const table = allTables.find((n) => n.id === tableId);
      const tableOwnerId = table?.ownerId ?? userId;

      await toggleArchive(tableOwnerId, tableId, next);
    },
    [userId, ownedTables, sharedTables, spaceTables],
  );

  const handleDelete = useCallback(
    async (tableId: string) => {
      if (!userId) {
        return;
      }

      // Optimistic update
      setDeletedTableIds((prev) => {
        const next = new Set(prev);
        next.add(tableId);
        return next;
      });

      try {
        await deleteTableMutation(userId, tableId);
      } catch (error) {
        // Revert on error
        console.error("Failed to delete table:", error);
        setDeletedTableIds((prev) => {
          const next = new Set(prev);
          next.delete(tableId);
          return next;
        });
      }
    },
    [userId],
  );

  const handleRestore = useCallback(
    async (tableId: string) => {
      if (!userId) {
        return;
      }

      await restoreTableMutation(userId, tableId);
    },
    [userId],
  );

  const handleDestroy = useCallback(
    async (tableId: string) => {
      if (!userId) {
        return;
      }

      await permanentlyDeleteTable(userId, tableId);
    },
    [userId],
  );

  const handleDestroyAll = useCallback(async () => {
    if (!userId) {
      return;
    }

    const trashedSnapshot = computedTablesRef.current?.trashed ?? [];
    if (!trashedSnapshot.length) {
      return;
    }

    await Promise.all(
      trashedSnapshot.map(table => permanentlyDeleteTable(userId, table.id)),
    );
  }, [userId]);

  const handleRemoveAttachment = useCallback(
    async (tableId: string, attachment: TableAttachment) => {
      if (!userId) {
        return;
      }

      // Find the table to get the owner's ID (for shared space tables)
      const allTables = [...ownedTables, ...sharedTables, ...spaceTables];
      const table = allTables.find((n) => n.id === tableId);
      const tableOwnerId = table?.ownerId ?? userId;

      if (attachment.storagePath) {
        await deleteAttachment(attachment.storagePath);
      }

      await removeAttachments(tableOwnerId, tableId, [attachment]);
    },
    [userId, ownedTables, sharedTables, spaceTables],
  );

  const handleAttachFiles = useCallback(
    async (tableId: string, files: File[]) => {
      if (!userId || !files.length) {
        return;
      }

      // Find the table to get the owner's ID (for shared space tables)
      const allTables = [...ownedTables, ...sharedTables, ...spaceTables];
      const table = allTables.find((n) => n.id === tableId);
      const tableOwnerId = table?.ownerId ?? userId;

      const uploads = await Promise.all(
        files.map((file) => uploadTableAttachment(tableOwnerId, tableId, file)),
      );

      await addAttachments(tableOwnerId, tableId, uploads);
    },
    [userId, ownedTables, sharedTables, spaceTables],
  );

  // Load more tables for progressive rendering
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

  // Migrate tables in shared spaces to populate sharedWithUserIds for tables created before the fix
  useEffect(() => {
    if (!userId || !currentSpaceId || currentSpaceId === "personal") {
      return;
    }

    // Run migration for the current shared space (only updates tables that need it)
    migrateSpaceTablesSharing(userId, currentSpaceId)
      .catch((error) => {
        console.error('[Tables] Migration failed:', error);
      });
  }, [userId, currentSpaceId]);

  const computedTables = useMemo(() => {
    // Combine owned, shared, and space tables (deduplicating by id)
    const combined = [...ownedTables, ...sharedTables, ...spaceTables];
    const tableMap = new Map<string, Table>();

    combined.forEach(table => {
      tableMap.set(table.id, table);
    });

    pendingTables.forEach(table => {
      tableMap.set(table.id, table);
    });

    const merged = Array.from(tableMap.values());

    // Dynamic sort function based on sort config
    const sortTables = (a: Table, b: Table) => {
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
          // Sort by associated date (tableDate field), fallback to createdAt
          aValue = a.tableDate?.getTime() ?? a.createdAt.getTime();
          bValue = b.tableDate?.getTime() ?? b.createdAt.getTime();
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

    // Priority sort function for Focus tables
    // Sort by: priority (high > medium > low > null), then createdAt desc, then updatedAt desc
    const sortPinnedTables = (a: Table, b: Table) => {
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
      .filter(table => Boolean(table.deletedAt))
      .sort((a, b) => {
        const aDeleted = a.deletedAt?.getTime() ?? a.updatedAt?.getTime() ?? a.createdAt.getTime();
        const bDeleted = b.deletedAt?.getTime() ?? b.updatedAt?.getTime() ?? b.createdAt.getTime();
        return bDeleted - aDeleted;
      });

    const activeTables = merged.filter(table => !table.deletedAt && !deletedTableIds.has(table.id));

    // Count archived tables for badge display
    const archivedCount = activeTables.filter(table => table.archived).length;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 1;
    const hasColorFilter = filters.colors && filters.colors.length > 0;
    const hasDateFilter = filters.dateRange?.start || filters.dateRange?.end;
    const hasTableTypeFilter = filters.noteType && filters.noteType !== 'all';

    const filtered = activeTables.filter(table => {
      // Always exclude archived tables
      if (table.archived) {
        return false;
      }

      // Filter by current space
      // "personal" space shows tables with no spaceId (personal tables)
      // Other spaces show tables with matching spaceId
      if (currentSpaceId === "personal") {
        if (table.spaceId) {
          return false; // Personal view only shows tables without a spaceId
        }
      } else {
        if (table.spaceId !== currentSpaceId) {
          return false; // Space view only shows tables matching the space
        }
      }

      // Filter by table type (text vs checklist)
      if (hasTableTypeFilter) {
        if (table.type !== filters.noteType) {
          return false;
        }
      }

      // Filter by labels (combine activeLabelIds and filters.labels)
      const allLabelFilters = [...activeLabelIds, ...(filters.labels || [])];
      if (allLabelFilters.length > 0) {
        const matchesLabels = allLabelFilters.some((labelId) => table.labelIds.includes(labelId));
        if (!matchesLabels) {
          return false;
        }
      }

      // Filter by colors
      if (hasColorFilter && filters.colors) {
        if (!filters.colors.includes(table.color)) {
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
            targetDate = table.updatedAt ?? table.createdAt;
            break;
          case 'noteDate':
            targetDate = table.tableDate ?? table.createdAt;
            break;
          case 'createdAt':
          default:
            targetDate = table.createdAt;
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

      const haystack = [table.title, table.body, ...table.checklist.map((item) => item.text)]
        .join("\n")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    const pinned = filtered.filter(table => table.pinned).sort(sortPinnedTables);
    const others = filtered.filter(table => !table.pinned).sort(sortTables);

    // Progressive rendering: only display up to displayLimit tables in Library
    const displayedOthers = others.slice(0, displayLimit);
    const hasMore = others.length > displayLimit;

    return {
      merged: activeTables,
      filtered,
      pinned,
      others,
      displayedOthers,
      hasMore,
      trashed,
      archivedCount,
      totalCount: others.length,
    };
  }, [pendingTables, ownedTables, sharedTables, spaceTables, searchQuery, activeLabelIds, currentSpaceId, filters, sort, displayLimit, deletedTableIds]);

  useEffect(() => {
    computedTablesRef.current = computedTables;
  }, [computedTables]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && computedTables.hasMore && !isLoadingMore && !loading) {
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
  }, [computedTables.hasMore, isLoadingMore, loading, loadMore]);

  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const updateActiveLabelIds = useCallback((labels: string[]) => {
    setActiveLabelIds(labels);
  }, []);

  const value = useMemo<TablesContextValue>(
    () => ({
      allTables: computedTables.merged,
      tables: computedTables.filtered,
      pinned: computedTables.pinned,
      others: computedTables.others,
      displayedOthers: computedTables.displayedOthers,
      trashed: computedTables.trashed,
      loading,
      searchQuery,
      setSearchQuery: updateSearchQuery,
      activeLabelIds,
      setActiveLabelIds: updateActiveLabelIds,
      filters,
      setFilters,
      sort,
      setSort,
      createTable: handleCreate,
      updateDoc: handleUpdate,
      duplicateTable: handleDuplicate,
      togglePin: handleTogglePin,
      toggleArchive: handleToggleArchive,
      deleteTable: handleDelete,
      restoreTable: handleRestore,
      destroyTable: handleDestroy,
      destroyAllTables: handleDestroyAll,
      removeAttachment: handleRemoveAttachment,
      attachFiles: handleAttachFiles,
      // Infinite scroll
      hasMore: computedTables.hasMore,
      isLoadingMore,
      loadMore,
      totalCount: computedTables.totalCount,
      sentinelRef,
    }),
    [
      computedTables.merged,
      computedTables.filtered,
      computedTables.pinned,
      computedTables.others,
      computedTables.displayedOthers,
      computedTables.trashed,
      computedTables.hasMore,
      computedTables.totalCount,
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
    <TablesContext.Provider value={value}>{children}</TablesContext.Provider>
  );
}

export function useTables() {
  const context = useContext(TablesContext);

  if (!context) {
    throw new Error("useTables must be used within a TablesProvider.");
  }

  return context;
}
