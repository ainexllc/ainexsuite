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
import type { Node, Edge } from "@xyflow/react";
import { useAuth } from "@ainexsuite/auth";
import { generateUUID, type FilterValue, type SortConfig } from "@ainexsuite/ui";
import type {
  Workflow,
  WorkflowDraft,
  WorkflowColor,
  WorkflowPriority,
  EdgeStyleType,
  ArrowType,
  LineStyleType,
  WorkflowViewport,
} from "@/lib/types/workflow";
import {
  createWorkflow as createWorkflowMutation,
  deleteWorkflow as deleteWorkflowMutation,
  subscribeToOwnedWorkflows,
  subscribeToSharedWorkflows,
  toggleArchive,
  togglePin,
  updateWorkflow as updateWorkflowMutation,
  restoreWorkflow as restoreWorkflowMutation,
  permanentlyDeleteWorkflow,
  checkAndMigrateLegacyWorkflow,
} from "@/lib/firebase/workflow-service";
import { useSpaces } from "@/components/providers/spaces-provider";

const DISPLAY_BATCH_SIZE = 20;

type CreateWorkflowInput = {
  title?: string;
  description?: string;
  nodes?: Node[];
  edges?: Edge[];
  viewport?: WorkflowViewport;
  edgeType?: EdgeStyleType;
  arrowType?: ArrowType;
  lineStyle?: LineStyleType;
  color?: WorkflowColor;
  pinned?: boolean;
  priority?: WorkflowPriority;
  archived?: boolean;
  labelIds?: string[];
  reminderAt?: Date | null;
  reminderId?: string | null;
  spaceId?: string;
};

type WorkflowsContextValue = {
  workflows: Workflow[];
  pinned: Workflow[];
  others: Workflow[];
  displayedOthers: Workflow[];
  allWorkflows: Workflow[];
  trashed: Workflow[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeLabelIds: string[];
  setActiveLabelIds: (labels: string[]) => void;
  filters: FilterValue;
  setFilters: (filters: FilterValue) => void;
  sort: SortConfig;
  setSort: (sort: SortConfig) => void;
  createWorkflow: (input: CreateWorkflowInput) => Promise<string | null>;
  updateWorkflow: (workflowId: string, updates: WorkflowDraft) => Promise<void>;
  togglePin: (workflowId: string, next: boolean) => Promise<void>;
  toggleArchive: (workflowId: string, next: boolean) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  restoreWorkflow: (workflowId: string) => Promise<void>;
  destroyWorkflow: (workflowId: string) => Promise<void>;
  destroyAllWorkflows: () => Promise<void>;
  // Infinite scroll
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  totalCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

const WorkflowsContext = createContext<WorkflowsContextValue | null>(null);

type WorkflowsProviderProps = {
  children: React.ReactNode;
};

export function WorkflowsProvider({ children }: WorkflowsProviderProps) {
  const { user } = useAuth();
  const { currentSpaceId } = useSpaces();
  const [ownedWorkflows, setOwnedWorkflows] = useState<Workflow[]>([]);
  const [sharedWorkflows, setSharedWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownedLoaded, setOwnedLoaded] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [pendingWorkflows, setPendingWorkflows] = useState<Workflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const [deletedWorkflowIds, setDeletedWorkflowIds] = useState<Set<string>>(new Set());
  const [migrationChecked, setMigrationChecked] = useState(false);
  const [filters, setFilters] = useState<FilterValue>({
    labels: [],
    colors: [],
    dateRange: { start: null, end: null },
  });
  const [sort, setSort] = useState<SortConfig>({
    field: "updatedAt",
    direction: "desc",
  });

  // Infinite scroll state
  const [displayLimit, setDisplayLimit] = useState(DISPLAY_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const computedWorkflowsRef = useRef<{
    merged: Workflow[];
    filtered: Workflow[];
    pinned: Workflow[];
    others: Workflow[];
    displayedOthers: Workflow[];
    hasMore: boolean;
    trashed: Workflow[];
    totalCount: number;
  }>({
    merged: [],
    filtered: [],
    pinned: [],
    others: [],
    displayedOthers: [],
    hasMore: false,
    trashed: [],
    totalCount: 0,
  });

  const userId = user?.uid ?? null;

  // Check and migrate legacy workflow on first load
  useEffect(() => {
    if (!userId || migrationChecked) return;

    const checkMigration = async () => {
      try {
        await checkAndMigrateLegacyWorkflow(userId);
      } catch (error) {
        console.error("Migration check failed:", error);
      } finally {
        setMigrationChecked(true);
      }
    };

    checkMigration();
  }, [userId, migrationChecked]);

  // Subscribe to workflows
  useEffect(() => {
    if (!user || !userId) {
      setOwnedWorkflows([]);
      setSharedWorkflows([]);
      setPendingWorkflows([]);
      setLoading(false);
      setOwnedLoaded(false);
      setSharedLoaded(false);
      return;
    }

    setLoading(true);
    setOwnedLoaded(false);
    setSharedLoaded(false);

    const unsubscribeOwned = subscribeToOwnedWorkflows(
      userId,
      (incoming) => {
        setOwnedWorkflows(incoming);
        setOwnedLoaded(true);
      },
      (_error) => {
        setOwnedLoaded(true); // Unblock UI
      }
    );

    const unsubscribeShared = subscribeToSharedWorkflows(
      userId,
      (incoming) => {
        setSharedWorkflows(incoming);
        setSharedLoaded(true);
      },
      (_error) => {
        setSharedLoaded(true); // Unblock UI
      }
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
    async (input: CreateWorkflowInput) => {
      if (!userId) {
        return null;
      }

      const now = new Date();
      const tempId = `optimistic-${generateUUID()}`;

      // Use the provided spaceId or fall back to current space
      const effectiveSpaceId =
        input.spaceId ?? (currentSpaceId === "personal" ? undefined : currentSpaceId);

      const optimisticWorkflow: Workflow = {
        id: tempId,
        ownerId: userId,
        spaceId: effectiveSpaceId,
        title: input.title ?? "Untitled Workflow",
        description: input.description ?? "",
        nodes: input.nodes ?? [],
        edges: input.edges ?? [],
        viewport: input.viewport ?? { x: 0, y: 0, zoom: 1 },
        edgeType: input.edgeType ?? "smoothstep",
        arrowType: input.arrowType ?? "end",
        lineStyle: input.lineStyle ?? "solid",
        thumbnail: null,
        nodeCount: input.nodes?.length ?? 0,
        color: input.color ?? "default",
        pinned: Boolean(input.pinned),
        priority: input.priority ?? null,
        archived: Boolean(input.archived),
        labelIds: input.labelIds ?? [],
        reminderAt: input.reminderAt ?? null,
        reminderId: input.reminderId ?? null,
        createdAt: now,
        updatedAt: now,
        sharedWith: [],
        sharedWithUserIds: [],
      };

      setPendingWorkflows((prev) => [optimisticWorkflow, ...prev]);

      try {
        const workflowId = await createWorkflowMutation(userId, {
          ...input,
          spaceId: effectiveSpaceId,
        });

        return workflowId;
      } finally {
        setPendingWorkflows((prev) =>
          prev.filter((workflow) => workflow.id !== optimisticWorkflow.id)
        );
      }
    },
    [userId, currentSpaceId]
  );

  const handleUpdate = useCallback(
    async (workflowId: string, updates: WorkflowDraft) => {
      if (!userId) {
        return;
      }

      await updateWorkflowMutation(userId, workflowId, updates);
    },
    [userId]
  );

  const handleTogglePin = useCallback(
    async (workflowId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      await togglePin(userId, workflowId, next);
    },
    [userId]
  );

  const handleToggleArchive = useCallback(
    async (workflowId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      await toggleArchive(userId, workflowId, next);
    },
    [userId]
  );

  const handleDelete = useCallback(
    async (workflowId: string) => {
      if (!userId) {
        return;
      }

      // Optimistic update
      setDeletedWorkflowIds((prev) => {
        const next = new Set(prev);
        next.add(workflowId);
        return next;
      });

      try {
        await deleteWorkflowMutation(userId, workflowId);
      } catch (error) {
        // Revert on error
        console.error("Failed to delete workflow:", error);
        setDeletedWorkflowIds((prev) => {
          const next = new Set(prev);
          next.delete(workflowId);
          return next;
        });
      }
    },
    [userId]
  );

  const handleRestore = useCallback(
    async (workflowId: string) => {
      if (!userId) {
        return;
      }

      await restoreWorkflowMutation(userId, workflowId);
    },
    [userId]
  );

  const handleDestroy = useCallback(
    async (workflowId: string) => {
      if (!userId) {
        return;
      }

      await permanentlyDeleteWorkflow(userId, workflowId);
    },
    [userId]
  );

  const handleDestroyAll = useCallback(async () => {
    if (!userId) {
      return;
    }

    const trashedSnapshot = computedWorkflowsRef.current?.trashed ?? [];
    if (!trashedSnapshot.length) {
      return;
    }

    await Promise.all(
      trashedSnapshot.map((workflow) => permanentlyDeleteWorkflow(userId, workflow.id))
    );
  }, [userId]);

  // Load more workflows for progressive rendering
  const loadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayLimit((prev) => prev + DISPLAY_BATCH_SIZE);
      setIsLoadingMore(false);
    }, 100);
  }, []);

  // Reset display limit when filters or search changes
  useEffect(() => {
    setDisplayLimit(DISPLAY_BATCH_SIZE);
  }, [searchQuery, activeLabelIds, filters, currentSpaceId]);

  const computedWorkflows = useMemo(() => {
    const combined = [...ownedWorkflows, ...sharedWorkflows];
    const workflowMap = new Map<string, Workflow>();

    combined.forEach((workflow) => {
      workflowMap.set(workflow.id, workflow);
    });

    pendingWorkflows.forEach((workflow) => {
      workflowMap.set(workflow.id, workflow);
    });

    const merged = Array.from(workflowMap.values());

    // Dynamic sort function
    const sortWorkflows = (a: Workflow, b: Workflow) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sort.field) {
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "createdAt":
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case "updatedAt":
        default:
          aValue = a.updatedAt?.getTime() ?? a.createdAt.getTime();
          bValue = b.updatedAt?.getTime() ?? b.createdAt.getTime();
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sort.direction === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    };

    // Priority sort for pinned workflows
    const sortPinnedWorkflows = (a: Workflow, b: Workflow) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 4;
      const bPriority = b.priority ? priorityOrder[b.priority] : 4;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      const aCreated = a.createdAt.getTime();
      const bCreated = b.createdAt.getTime();
      if (aCreated !== bCreated) {
        return bCreated - aCreated;
      }

      const aUpdated = a.updatedAt?.getTime() ?? aCreated;
      const bUpdated = b.updatedAt?.getTime() ?? bCreated;
      return bUpdated - aUpdated;
    };

    const trashed = merged
      .filter((workflow) => Boolean(workflow.deletedAt))
      .sort((a, b) => {
        const aDeleted =
          a.deletedAt?.getTime() ?? a.updatedAt?.getTime() ?? a.createdAt.getTime();
        const bDeleted =
          b.deletedAt?.getTime() ?? b.updatedAt?.getTime() ?? b.createdAt.getTime();
        return bDeleted - aDeleted;
      });

    const activeWorkflows = merged.filter(
      (workflow) => !workflow.deletedAt && !deletedWorkflowIds.has(workflow.id)
    );

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 1;
    const hasColorFilter = filters.colors && filters.colors.length > 0;
    const hasDateFilter = filters.dateRange?.start || filters.dateRange?.end;

    const filtered = activeWorkflows.filter((workflow) => {
      // Always exclude archived workflows
      if (workflow.archived) {
        return false;
      }

      // Filter by current space
      if (currentSpaceId === "personal") {
        if (workflow.spaceId) {
          return false;
        }
      } else {
        if (workflow.spaceId !== currentSpaceId) {
          return false;
        }
      }

      // Filter by labels
      const allLabelFilters = [...activeLabelIds, ...(filters.labels || [])];
      if (allLabelFilters.length > 0) {
        const matchesLabels = allLabelFilters.some((labelId) =>
          workflow.labelIds.includes(labelId)
        );
        if (!matchesLabels) {
          return false;
        }
      }

      // Filter by colors
      if (hasColorFilter && filters.colors) {
        if (!filters.colors.includes(workflow.color)) {
          return false;
        }
      }

      // Filter by date range
      if (hasDateFilter && filters.dateRange) {
        const dateField = filters.dateField || "createdAt";
        let targetDate: Date | null = null;

        switch (dateField) {
          case "updatedAt":
            targetDate = workflow.updatedAt ?? workflow.createdAt;
            break;
          case "createdAt":
          default:
            targetDate = workflow.createdAt;
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

      const haystack = [workflow.title, workflow.description ?? ""]
        .join("\n")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    const pinned = filtered.filter((workflow) => workflow.pinned).sort(sortPinnedWorkflows);
    const others = filtered.filter((workflow) => !workflow.pinned).sort(sortWorkflows);

    const displayedOthers = others.slice(0, displayLimit);
    const hasMore = others.length > displayLimit;

    return {
      merged: activeWorkflows,
      filtered,
      pinned,
      others,
      displayedOthers,
      hasMore,
      trashed,
      totalCount: others.length,
    };
  }, [
    pendingWorkflows,
    ownedWorkflows,
    sharedWorkflows,
    searchQuery,
    activeLabelIds,
    currentSpaceId,
    filters,
    sort,
    displayLimit,
    deletedWorkflowIds,
  ]);

  useEffect(() => {
    computedWorkflowsRef.current = computedWorkflows;
  }, [computedWorkflows]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && computedWorkflows.hasMore && !isLoadingMore && !loading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [computedWorkflows.hasMore, isLoadingMore, loading, loadMore]);

  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const updateActiveLabelIds = useCallback((labels: string[]) => {
    setActiveLabelIds(labels);
  }, []);

  const value = useMemo<WorkflowsContextValue>(
    () => ({
      allWorkflows: computedWorkflows.merged,
      workflows: computedWorkflows.filtered,
      pinned: computedWorkflows.pinned,
      others: computedWorkflows.others,
      displayedOthers: computedWorkflows.displayedOthers,
      trashed: computedWorkflows.trashed,
      loading,
      searchQuery,
      setSearchQuery: updateSearchQuery,
      activeLabelIds,
      setActiveLabelIds: updateActiveLabelIds,
      filters,
      setFilters,
      sort,
      setSort,
      createWorkflow: handleCreate,
      updateWorkflow: handleUpdate,
      togglePin: handleTogglePin,
      toggleArchive: handleToggleArchive,
      deleteWorkflow: handleDelete,
      restoreWorkflow: handleRestore,
      destroyWorkflow: handleDestroy,
      destroyAllWorkflows: handleDestroyAll,
      hasMore: computedWorkflows.hasMore,
      isLoadingMore,
      loadMore,
      totalCount: computedWorkflows.totalCount,
      sentinelRef,
    }),
    [
      computedWorkflows.merged,
      computedWorkflows.filtered,
      computedWorkflows.pinned,
      computedWorkflows.others,
      computedWorkflows.displayedOthers,
      computedWorkflows.trashed,
      computedWorkflows.hasMore,
      computedWorkflows.totalCount,
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
      updateSearchQuery,
      updateActiveLabelIds,
    ]
  );

  return (
    <WorkflowsContext.Provider value={value}>{children}</WorkflowsContext.Provider>
  );
}

export function useWorkflows() {
  const context = useContext(WorkflowsContext);

  if (!context) {
    throw new Error("useWorkflows must be used within a WorkflowsProvider.");
  }

  return context;
}
