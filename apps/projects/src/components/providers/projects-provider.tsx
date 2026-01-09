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
import type {
  Project,
  ProjectDraft,
  ProjectAttachment,
  ProjectFilterValue,
  SortConfig,
  ProjectStatus,
  ProjectPriority,
} from "@/lib/types/project";
import { generateUUID } from "@ainexsuite/ui";
import {
  createProject as createProjectMutation,
  updateProject as updateProjectMutation,
  deleteProject as deleteProjectMutation,
  restoreProject as restoreProjectMutation,
  hardDeleteProject,
  duplicateProject as duplicateProjectMutation,
  subscribeToOwnedProjects,
  subscribeToSharedProjects,
  subscribeToSpaceProjects,
  togglePin,
  toggleArchive,
  uploadProjectAttachment,
  deleteAttachment,
  migrateSpaceProjectsSharing,
} from "@/lib/firebase/project-service";
import { useSpaces } from "@/components/providers/spaces-provider";

type CreateProjectInput = {
  title?: string;
  description?: string;
  type?: Project["type"];
  color?: Project["color"];
  pattern?: Project["pattern"];
  backgroundImage?: string | null;
  backgroundOverlay?: Project["backgroundOverlay"];
  coverImage?: string | null;
  icon?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  pinned?: boolean;
  startDate?: Date | null;
  dueDate?: Date | null;
  labelIds?: string[];
  tasks?: Project["tasks"];
  attachments?: File[];
  spaceId?: string;
};

type ProjectsContextValue = {
  // All projects (merged)
  projects: Project[];
  allProjects: Project[];

  // Computed views
  focusProjects: Project[];
  activeProjects: Project[];
  libraryProjects: Project[];
  displayedLibraryProjects: Project[];
  archivedProjects: Project[];
  trashedProjects: Project[];

  // State
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeLabelIds: string[];
  setActiveLabelIds: (labels: string[]) => void;
  filters: ProjectFilterValue;
  setFilters: (filters: ProjectFilterValue) => void;
  sort: SortConfig;
  setSort: (sort: SortConfig) => void;

  // CRUD operations
  createProject: (input: CreateProjectInput) => Promise<string | null>;
  updateProject: (projectId: string, updates: ProjectDraft) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<string | null>;
  togglePin: (projectId: string, next: boolean) => Promise<void>;
  toggleArchive: (projectId: string, next: boolean) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  restoreProject: (projectId: string) => Promise<void>;
  destroyProject: (projectId: string) => Promise<void>;
  destroyAllProjects: () => Promise<void>;

  // Batch operations
  batchUpdateProjects: (projectIds: string[], updates: ProjectDraft) => Promise<void>;
  batchDeleteProjects: (projectIds: string[]) => Promise<void>;

  // Attachment operations
  removeAttachment: (projectId: string, attachment: ProjectAttachment) => Promise<void>;
  attachFiles: (projectId: string, files: File[]) => Promise<void>;

  // Infinite scroll
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  totalCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

type ProjectsProviderProps = {
  children: React.ReactNode;
};

export function ProjectsProvider({ children }: ProjectsProviderProps) {
  const { user } = useAuth();
  const { currentSpaceId } = useSpaces();
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [spaceProjects, setSpaceProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownedLoaded, setOwnedLoaded] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const [spaceLoaded, setSpaceLoaded] = useState(false);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const [deletedProjectIds, setDeletedProjectIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ProjectFilterValue>({
    labels: [],
    colors: [],
    status: [],
    priority: [],
    type: [],
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
  const computedProjectsRef = useRef<{
    merged: Project[];
    filtered: Project[];
    focusProjects: Project[];
    activeProjects: Project[];
    libraryProjects: Project[];
    displayedLibraryProjects: Project[];
    archivedProjects: Project[];
    trashedProjects: Project[];
    hasMore: boolean;
    totalCount: number;
  }>({
    merged: [],
    filtered: [],
    focusProjects: [],
    activeProjects: [],
    libraryProjects: [],
    displayedLibraryProjects: [],
    archivedProjects: [],
    trashedProjects: [],
    hasMore: false,
    totalCount: 0,
  });

  const userId = user?.uid ?? null;

  // Subscribe to owned projects
  useEffect(() => {
    if (!user || !userId) {
      setOwnedProjects([]);
      setSharedProjects([]);
      setSpaceProjects([]);
      setPendingProjects([]);
      setLoading(false);
      setOwnedLoaded(false);
      setSharedLoaded(false);
      setSpaceLoaded(true);
      return;
    }

    setLoading(true);
    setOwnedLoaded(false);
    setSharedLoaded(false);

    const unsubscribeOwned = subscribeToOwnedProjects(
      userId,
      (incoming) => {
        setOwnedProjects(incoming);
        setOwnedLoaded(true);
      },
      (error) => {
        console.error("[Projects] Owned projects subscription error:", error);
        setOwnedLoaded(true); // Unblock UI
      },
    );

    const unsubscribeShared = subscribeToSharedProjects(
      userId,
      (incoming) => {
        setSharedProjects(incoming);
        setSharedLoaded(true);
      },
      (error) => {
        console.error("[Projects] Shared projects subscription error:", error);
        setSharedLoaded(true); // Unblock UI
      },
    );

    return () => {
      unsubscribeOwned();
      unsubscribeShared();
    };
  }, [user, userId]);

  // Subscribe to space projects (projects from other users in the current space)
  useEffect(() => {
    if (!userId || !currentSpaceId || currentSpaceId === "personal") {
      setSpaceProjects([]);
      setSpaceLoaded(true);
      return;
    }

    setSpaceLoaded(false);

    const unsubscribeSpace = subscribeToSpaceProjects(
      currentSpaceId,
      userId,
      (incoming) => {
        setSpaceProjects(incoming);
        setSpaceLoaded(true);
      },
      (error) => {
        console.error("[Projects] Space projects subscription error:", error);
        setSpaceLoaded(true); // Unblock UI
      },
    );

    return () => {
      unsubscribeSpace();
    };
  }, [userId, currentSpaceId]);

  // Update loading state when all subscriptions are loaded
  useEffect(() => {
    if (!user || !userId) {
      return;
    }

    if (ownedLoaded && sharedLoaded && spaceLoaded) {
      setLoading(false);
    }
  }, [ownedLoaded, sharedLoaded, spaceLoaded, user, userId]);

  // Migrate projects in shared spaces to populate sharedWithUserIds
  useEffect(() => {
    if (!userId || !currentSpaceId || currentSpaceId === "personal") {
      return;
    }

    migrateSpaceProjectsSharing(userId, currentSpaceId).catch((error) => {
      console.error("[Projects] Migration failed:", error);
    });
  }, [userId, currentSpaceId]);

  const handleCreate = useCallback(
    async (input: CreateProjectInput) => {
      if (!userId) {
        return null;
      }

      const now = new Date();
      const { attachments, ...projectInput } = input;
      const tempId = `optimistic-${generateUUID()}`;

      // Use the provided spaceId or fall back to current space ('personal' for personal projects)
      const effectiveSpaceId = input.spaceId ?? currentSpaceId ?? "personal";

      const optimisticProject: Project = {
        id: tempId,
        ownerId: userId,
        spaceId: effectiveSpaceId,
        title: input.title ?? "",
        description: input.description ?? "",
        type: input.type ?? "other",
        color: input.color ?? "default",
        pattern: input.pattern ?? "none",
        backgroundImage: input.backgroundImage ?? null,
        backgroundOverlay: input.backgroundOverlay ?? "auto",
        coverImage: input.coverImage ?? null,
        icon: input.icon ?? null,
        status: input.status ?? "planning",
        priority: input.priority ?? null,
        pinned: Boolean(input.pinned),
        startDate: input.startDate ?? null,
        dueDate: input.dueDate ?? null,
        completedAt: null,
        labelIds: input.labelIds ?? [],
        whiteboardId: null,
        sharedWith: [],
        sharedWithUserIds: [],
        archived: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        attachments: [],
        tasks: input.tasks ?? [],
        reminderAt: null,
        reminderId: null,
      };

      setPendingProjects((prev) => [optimisticProject, ...prev]);

      try {
        const projectId = await createProjectMutation(userId, effectiveSpaceId, projectInput);

        if (attachments?.length) {
          const uploads = await Promise.all(
            attachments.map((file) => uploadProjectAttachment(userId, projectId, file)),
          );

          await updateProjectMutation(userId, projectId, { attachments: uploads });
        }

        return projectId;
      } finally {
        setPendingProjects((prev) => prev.filter((project) => project.id !== optimisticProject.id));
      }
    },
    [userId, currentSpaceId],
  );

  const handleUpdate = useCallback(
    async (projectId: string, updates: ProjectDraft) => {
      if (!userId) {
        return;
      }

      // Find the project to get the owner's ID (for shared space projects)
      const allProjects = [...ownedProjects, ...sharedProjects, ...spaceProjects];
      const project = allProjects.find((p) => p.id === projectId);
      const projectOwnerId = project?.ownerId ?? userId;

      await updateProjectMutation(projectOwnerId, projectId, updates);
    },
    [userId, ownedProjects, sharedProjects, spaceProjects],
  );

  const handleDuplicate = useCallback(
    async (projectId: string) => {
      if (!userId) {
        return null;
      }

      // Find the project to duplicate
      const allProjects = [...ownedProjects, ...sharedProjects, ...spaceProjects];
      const project = allProjects.find((p) => p.id === projectId);
      if (!project) {
        return null;
      }

      try {
        return await duplicateProjectMutation(userId, projectId);
      } catch (error) {
        console.error("[Projects] Failed to duplicate project:", error);
        return null;
      }
    },
    [userId, ownedProjects, sharedProjects, spaceProjects],
  );

  const handleTogglePin = useCallback(
    async (projectId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      // Find the project to get the owner's ID (for shared space projects)
      const allProjects = [...ownedProjects, ...sharedProjects, ...spaceProjects];
      const project = allProjects.find((p) => p.id === projectId);
      const projectOwnerId = project?.ownerId ?? userId;

      await togglePin(projectOwnerId, projectId, next);
    },
    [userId, ownedProjects, sharedProjects, spaceProjects],
  );

  const handleToggleArchive = useCallback(
    async (projectId: string, next: boolean) => {
      if (!userId) {
        return;
      }

      // Find the project to get the owner's ID (for shared space projects)
      const allProjects = [...ownedProjects, ...sharedProjects, ...spaceProjects];
      const project = allProjects.find((p) => p.id === projectId);
      const projectOwnerId = project?.ownerId ?? userId;

      await toggleArchive(projectOwnerId, projectId, next);
    },
    [userId, ownedProjects, sharedProjects, spaceProjects],
  );

  const handleDelete = useCallback(
    async (projectId: string) => {
      if (!userId) {
        return;
      }

      // Optimistic update
      setDeletedProjectIds((prev) => {
        const next = new Set(prev);
        next.add(projectId);
        return next;
      });

      try {
        await deleteProjectMutation(userId, projectId);
      } catch (error) {
        // Revert on error
        console.error("[Projects] Failed to delete project:", error);
        setDeletedProjectIds((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      }
    },
    [userId],
  );

  const handleRestore = useCallback(
    async (projectId: string) => {
      if (!userId) {
        return;
      }

      await restoreProjectMutation(userId, projectId);
    },
    [userId],
  );

  const handleDestroy = useCallback(
    async (projectId: string) => {
      if (!userId) {
        return;
      }

      await hardDeleteProject(userId, projectId);
    },
    [userId],
  );

  const handleDestroyAll = useCallback(async () => {
    if (!userId) {
      return;
    }

    const trashedSnapshot = computedProjectsRef.current?.trashedProjects ?? [];
    if (!trashedSnapshot.length) {
      return;
    }

    await Promise.all(trashedSnapshot.map((project) => hardDeleteProject(userId, project.id)));
  }, [userId]);

  const handleBatchUpdate = useCallback(
    async (projectIds: string[], updates: ProjectDraft) => {
      if (!userId || !projectIds.length) {
        return;
      }

      // Find each project to get the owner's ID (for shared space projects)
      const allProjects = [...ownedProjects, ...sharedProjects, ...spaceProjects];

      await Promise.all(
        projectIds.map((projectId) => {
          const project = allProjects.find((p) => p.id === projectId);
          const projectOwnerId = project?.ownerId ?? userId;
          return updateProjectMutation(projectOwnerId, projectId, updates);
        }),
      );
    },
    [userId, ownedProjects, sharedProjects, spaceProjects],
  );

  const handleBatchDelete = useCallback(
    async (projectIds: string[]) => {
      if (!userId || !projectIds.length) {
        return;
      }

      // Optimistic update
      setDeletedProjectIds((prev) => {
        const next = new Set(prev);
        projectIds.forEach((id) => next.add(id));
        return next;
      });

      try {
        await Promise.all(projectIds.map((projectId) => deleteProjectMutation(userId, projectId)));
      } catch (error) {
        // Revert on error
        console.error("[Projects] Failed to batch delete projects:", error);
        setDeletedProjectIds((prev) => {
          const next = new Set(prev);
          projectIds.forEach((id) => next.delete(id));
          return next;
        });
      }
    },
    [userId],
  );

  const handleRemoveAttachment = useCallback(
    async (projectId: string, attachment: ProjectAttachment) => {
      if (!userId) {
        return;
      }

      // Find the project to get the owner's ID (for shared space projects)
      const allProjects = [...ownedProjects, ...sharedProjects, ...spaceProjects];
      const project = allProjects.find((p) => p.id === projectId);
      const projectOwnerId = project?.ownerId ?? userId;

      if (attachment.storagePath) {
        await deleteAttachment(attachment.storagePath);
      }

      // Update the project to remove the attachment from the array
      const currentAttachments = project?.attachments ?? [];
      const updatedAttachments = currentAttachments.filter((a) => a.id !== attachment.id);
      await updateProjectMutation(projectOwnerId, projectId, { attachments: updatedAttachments });
    },
    [userId, ownedProjects, sharedProjects, spaceProjects],
  );

  const handleAttachFiles = useCallback(
    async (projectId: string, files: File[]) => {
      if (!userId || !files.length) {
        return;
      }

      // Find the project to get the owner's ID (for shared space projects)
      const allProjects = [...ownedProjects, ...sharedProjects, ...spaceProjects];
      const project = allProjects.find((p) => p.id === projectId);
      const projectOwnerId = project?.ownerId ?? userId;

      const uploads = await Promise.all(
        files.map((file) => uploadProjectAttachment(projectOwnerId, projectId, file)),
      );

      // Update the project with new attachments
      const currentAttachments = project?.attachments ?? [];
      await updateProjectMutation(projectOwnerId, projectId, {
        attachments: [...currentAttachments, ...uploads],
      });
    },
    [userId, ownedProjects, sharedProjects, spaceProjects],
  );

  // Load more projects for progressive rendering
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

  const computedProjects = useMemo(() => {
    // Combine owned, shared, and space projects (deduplicating by id)
    const combined = [...ownedProjects, ...sharedProjects, ...spaceProjects];
    const projectMap = new Map<string, Project>();

    combined.forEach((project) => {
      projectMap.set(project.id, project);
    });

    pendingProjects.forEach((project) => {
      projectMap.set(project.id, project);
    });

    const merged = Array.from(projectMap.values());

    // Dynamic sort function based on sort config
    const sortProjects = (a: Project, b: Project) => {
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
        case "dueDate":
          aValue = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
          bValue = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
          break;
        case "startDate":
          aValue = a.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
          bValue = b.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
          break;
        case "priority": {
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          aValue = a.priority ? priorityOrder[a.priority] : 4;
          bValue = b.priority ? priorityOrder[b.priority] : 4;
          break;
        }
        case "status": {
          const statusOrder = { active: 1, planning: 2, on_hold: 3, completed: 4, archived: 5 };
          aValue = statusOrder[a.status] ?? 6;
          bValue = statusOrder[b.status] ?? 6;
          break;
        }
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

    // Priority sort function for Focus projects
    // Sort by: priority (high > medium > low > null), then updatedAt desc
    const sortFocusProjects = (a: Project, b: Project) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 4;
      const bPriority = b.priority ? priorityOrder[b.priority] : 4;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bUpdated - aUpdated;
    };

    // Trashed projects
    const trashedProjects = merged
      .filter((project) => Boolean(project.deletedAt))
      .sort((a, b) => {
        const aDeleted =
          a.deletedAt?.getTime() ?? a.updatedAt?.getTime() ?? a.createdAt.getTime();
        const bDeleted =
          b.deletedAt?.getTime() ?? b.updatedAt?.getTime() ?? b.createdAt.getTime();
        return bDeleted - aDeleted;
      });

    // Active (non-deleted) projects
    const activeNotes = merged.filter(
      (project) => !project.deletedAt && !deletedProjectIds.has(project.id),
    );

    // Archived projects
    const archivedProjects = activeNotes
      .filter((project) => project.archived)
      .sort(sortProjects);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const hasQuery = normalizedQuery.length > 1;
    const hasColorFilter = filters.colors && filters.colors.length > 0;
    const hasStatusFilter = filters.status && filters.status.length > 0;
    const hasPriorityFilter = filters.priority && filters.priority.length > 0;
    const hasTypeFilter = filters.type && filters.type.length > 0;
    const hasDateFilter = filters.dateRange?.start || filters.dateRange?.end;

    const filtered = activeNotes.filter((project) => {
      // Exclude archived projects from main views
      if (project.archived) {
        return false;
      }

      // Filter by current space
      if (currentSpaceId === "personal") {
        if (project.spaceId && project.spaceId !== "personal") {
          return false;
        }
      } else {
        if (project.spaceId !== currentSpaceId) {
          return false;
        }
      }

      // Filter by status
      if (hasStatusFilter && filters.status) {
        if (!filters.status.includes(project.status)) {
          return false;
        }
      }

      // Filter by priority
      if (hasPriorityFilter && filters.priority && project.priority) {
        if (!filters.priority.includes(project.priority)) {
          return false;
        }
      }

      // Filter by type
      if (hasTypeFilter && filters.type) {
        if (!filters.type.includes(project.type)) {
          return false;
        }
      }

      // Filter by labels (combine activeLabelIds and filters.labels)
      const allLabelFilters = [...activeLabelIds, ...(filters.labels || [])];
      if (allLabelFilters.length > 0) {
        const matchesLabels = allLabelFilters.some((labelId) =>
          project.labelIds.includes(labelId),
        );
        if (!matchesLabels) {
          return false;
        }
      }

      // Filter by colors
      if (hasColorFilter && filters.colors) {
        if (!filters.colors.includes(project.color)) {
          return false;
        }
      }

      // Filter by date range using the specified dateField
      if (hasDateFilter && filters.dateRange) {
        const dateField = filters.dateField || "createdAt";
        let targetDate: Date | null = null;

        switch (dateField) {
          case "updatedAt":
            targetDate = project.updatedAt ?? project.createdAt;
            break;
          case "dueDate":
            targetDate = project.dueDate ?? null;
            break;
          case "startDate":
            targetDate = project.startDate ?? null;
            break;
          case "createdAt":
          default:
            targetDate = project.createdAt;
            break;
        }

        if (targetDate) {
          if (filters.dateRange.start && targetDate < filters.dateRange.start) {
            return false;
          }
          if (filters.dateRange.end && targetDate > filters.dateRange.end) {
            return false;
          }
        } else if (filters.dateRange.start || filters.dateRange.end) {
          // If filtering by a date field but the project doesn't have that date, exclude it
          return false;
        }
      }

      // Filter by whiteboard
      if (filters.hasWhiteboard !== undefined) {
        const hasWhiteboard = Boolean(project.whiteboardId);
        if (filters.hasWhiteboard !== hasWhiteboard) {
          return false;
        }
      }

      if (!hasQuery) {
        return true;
      }

      // Search in title, description, and tasks
      const haystack = [
        project.title,
        project.description,
        ...project.tasks.map((task) => task.text),
      ]
        .join("\n")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    // Focus projects: pinned, sorted by priority then updatedAt
    const focusProjects = filtered.filter((project) => project.pinned).sort(sortFocusProjects);

    // Active projects: status === 'active', not pinned
    const activeProjects = filtered
      .filter((project) => !project.pinned && project.status === "active")
      .sort(sortProjects);

    // Library projects: all others (not pinned, not active status, not archived/deleted)
    const libraryProjects = filtered
      .filter((project) => !project.pinned && project.status !== "active")
      .sort(sortProjects);

    // Progressive rendering: only display up to displayLimit projects in Library
    const displayedLibraryProjects = libraryProjects.slice(0, displayLimit);
    const hasMore = libraryProjects.length > displayLimit;

    return {
      merged: activeNotes,
      filtered,
      focusProjects,
      activeProjects,
      libraryProjects,
      displayedLibraryProjects,
      archivedProjects,
      trashedProjects,
      hasMore,
      totalCount: libraryProjects.length,
    };
  }, [
    pendingProjects,
    ownedProjects,
    sharedProjects,
    spaceProjects,
    searchQuery,
    activeLabelIds,
    currentSpaceId,
    filters,
    sort,
    displayLimit,
    deletedProjectIds,
  ]);

  useEffect(() => {
    computedProjectsRef.current = computedProjects;
  }, [computedProjects]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && computedProjects.hasMore && !isLoadingMore && !loading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [computedProjects.hasMore, isLoadingMore, loading, loadMore]);

  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const updateActiveLabelIds = useCallback((labels: string[]) => {
    setActiveLabelIds(labels);
  }, []);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      allProjects: computedProjects.merged,
      projects: computedProjects.filtered,
      focusProjects: computedProjects.focusProjects,
      activeProjects: computedProjects.activeProjects,
      libraryProjects: computedProjects.libraryProjects,
      displayedLibraryProjects: computedProjects.displayedLibraryProjects,
      archivedProjects: computedProjects.archivedProjects,
      trashedProjects: computedProjects.trashedProjects,
      loading,
      searchQuery,
      setSearchQuery: updateSearchQuery,
      activeLabelIds,
      setActiveLabelIds: updateActiveLabelIds,
      filters,
      setFilters,
      sort,
      setSort,
      createProject: handleCreate,
      updateProject: handleUpdate,
      duplicateProject: handleDuplicate,
      togglePin: handleTogglePin,
      toggleArchive: handleToggleArchive,
      deleteProject: handleDelete,
      restoreProject: handleRestore,
      destroyProject: handleDestroy,
      destroyAllProjects: handleDestroyAll,
      batchUpdateProjects: handleBatchUpdate,
      batchDeleteProjects: handleBatchDelete,
      removeAttachment: handleRemoveAttachment,
      attachFiles: handleAttachFiles,
      // Infinite scroll
      hasMore: computedProjects.hasMore,
      isLoadingMore,
      loadMore,
      totalCount: computedProjects.totalCount,
      sentinelRef,
    }),
    [
      computedProjects.merged,
      computedProjects.filtered,
      computedProjects.focusProjects,
      computedProjects.activeProjects,
      computedProjects.libraryProjects,
      computedProjects.displayedLibraryProjects,
      computedProjects.archivedProjects,
      computedProjects.trashedProjects,
      computedProjects.hasMore,
      computedProjects.totalCount,
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
      handleBatchUpdate,
      handleBatchDelete,
      handleRemoveAttachment,
      handleAttachFiles,
      updateSearchQuery,
      updateActiveLabelIds,
    ],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider.");
  }

  return context;
}
