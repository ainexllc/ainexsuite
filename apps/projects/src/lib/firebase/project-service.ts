import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
  type FirestoreDataConverter,
  type QueryConstraint,
  type Unsubscribe,
  limit,
  startAfter,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "@ainexsuite/firebase";
import { generateUUID } from "@ainexsuite/ui";
import type {
  Project,
  ProjectDoc,
  ProjectDraft,
  ProjectCollaboratorDoc,
  ProjectAttachment,
  ProjectTask,
  ProjectSpace,
  ProjectSpaceDoc,
} from "@/lib/types/project";

// ============ Path Helpers ============

export function userDocPath(userId: string): string {
  return `users/${userId}`;
}

export function projectCollectionPath(userId: string): string {
  return `${userDocPath(userId)}/projects`;
}

export function projectDocPath(userId: string, projectId: string): string {
  return `${projectCollectionPath(userId)}/${projectId}`;
}

// ============ Collection References ============

function projectCollection(userId: string) {
  return collection(db, projectCollectionPath(userId));
}

function projectDoc(userId: string, projectId: string) {
  return doc(db, projectDocPath(userId, projectId));
}

// ============ Converter Utilities ============

function toDate(value?: Timestamp | null): Date {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

function toOptionalDate(value?: Timestamp | null): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

// ============ Firestore Converter ============

export const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore(project: Project) {
    const {
      id: _id,
      createdAt,
      updatedAt,
      startDate,
      dueDate,
      completedAt,
      reminderAt,
      sharedWith,
      deletedAt,
      ...rest
    } = project;
    void _id;

    const collaboratorDocs: ProjectCollaboratorDoc[] =
      sharedWith?.map((collaborator) => ({
        email: collaborator.email,
        role: collaborator.role,
        userId: collaborator.userId,
        invitedAt: Timestamp.fromDate(collaborator.invitedAt),
      })) ?? [];

    return {
      ...rest,
      startDate: startDate ? Timestamp.fromDate(startDate) : null,
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      completedAt: completedAt ? Timestamp.fromDate(completedAt) : null,
      reminderAt: reminderAt ? Timestamp.fromDate(reminderAt) : null,
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
      updatedAt: updatedAt ? Timestamp.fromDate(updatedAt) : serverTimestamp(),
      sharedWith: collaboratorDocs,
      deletedAt: deletedAt ? Timestamp.fromDate(deletedAt) : null,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as ProjectDoc;

    return {
      id: snapshot.id,
      ownerId: data.ownerId,
      spaceId: data.spaceId,
      title: data.title,
      description: data.description,
      type: data.type,
      color: data.color ?? "default",
      pattern: data.pattern ?? "none",
      backgroundImage: data.backgroundImage ?? null,
      backgroundOverlay: data.backgroundOverlay ?? "auto",
      coverImage: data.coverImage ?? null,
      icon: data.icon ?? null,
      status: data.status,
      priority: data.priority ?? null,
      pinned: Boolean(data.pinned),
      startDate: toOptionalDate(data.startDate),
      dueDate: toOptionalDate(data.dueDate),
      completedAt: toOptionalDate(data.completedAt),
      labelIds: data.labelIds ?? [],
      whiteboardId: data.whiteboardId ?? null,
      sharedWith:
        data.sharedWith?.map((collaborator) => ({
          email: collaborator.email,
          role: collaborator.role,
          userId: collaborator.userId ?? "",
          invitedAt: toDate(collaborator.invitedAt),
        })) ?? [],
      sharedWithUserIds: data.sharedWithUserIds ?? [],
      archived: Boolean(data.archived),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      deletedAt: toOptionalDate(data.deletedAt),
      attachments: data.attachments ?? [],
      tasks: data.tasks ?? [],
      reminderAt: toOptionalDate(data.reminderAt),
      reminderId: data.reminderId ?? null,
      width: data.width,
      height: data.height,
    };
  },
};

// ============ Payload Creator ============

export function createProjectPayload(
  ownerId: string,
  spaceId: string,
  overrides: ProjectDraft & {
    sharedWithUserIds?: string[];
  } = {},
): Omit<ProjectDoc, "createdAt" | "updatedAt"> & {
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
} {
  const now = serverTimestamp();

  const collaboratorDocs: ProjectCollaboratorDoc[] =
    overrides.sharedWith?.map((collaborator) => ({
      email: collaborator.email,
      role: collaborator.role,
      userId: collaborator.userId,
      invitedAt: Timestamp.fromDate(collaborator.invitedAt),
    })) ?? [];

  return {
    ownerId,
    spaceId: spaceId || "personal",
    title: overrides.title ?? "",
    description: overrides.description ?? "",
    type: overrides.type ?? "other",
    color: overrides.color ?? "default",
    pattern: overrides.pattern ?? "none",
    backgroundImage: overrides.backgroundImage ?? null,
    backgroundOverlay: overrides.backgroundOverlay ?? "auto",
    coverImage: overrides.coverImage ?? null,
    icon: overrides.icon ?? null,
    status: overrides.status ?? "planning",
    priority: overrides.priority ?? null,
    pinned: overrides.pinned ?? false,
    startDate: overrides.startDate ? Timestamp.fromDate(overrides.startDate) : null,
    dueDate: overrides.dueDate ? Timestamp.fromDate(overrides.dueDate) : null,
    completedAt: overrides.completedAt ? Timestamp.fromDate(overrides.completedAt) : null,
    labelIds: overrides.labelIds ?? [],
    whiteboardId: overrides.whiteboardId ?? null,
    sharedWith: collaboratorDocs,
    sharedWithUserIds: overrides.sharedWithUserIds ?? [],
    archived: overrides.archived ?? false,
    deletedAt: overrides.deletedAt ? Timestamp.fromDate(overrides.deletedAt) : null,
    attachments: overrides.attachments ?? [],
    tasks: overrides.tasks ?? [],
    reminderAt: overrides.reminderAt ? Timestamp.fromDate(overrides.reminderAt) : null,
    reminderId: overrides.reminderId ?? null,
    // Only include width/height if explicitly set (Firestore doesn't accept undefined)
    ...(overrides.width !== undefined && { width: overrides.width }),
    ...(overrides.height !== undefined && { height: overrides.height }),
    createdAt: now,
    updatedAt: now,
  };
}

// ============ Space Service ============

const SPACES_COLLECTION = "spaces";

function convertToProjectSpace(id: string, data: ProjectSpaceDoc): ProjectSpace {
  return {
    id,
    name: data.name,
    type: data.type,
    members: data.members,
    memberUids: data.memberUids,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    createdBy: data.createdBy,
  };
}

export async function getSpace(spaceId: string): Promise<ProjectSpace | null> {
  const spaceRef = doc(db, SPACES_COLLECTION, spaceId);
  const snapshot = await getDoc(spaceRef);
  if (!snapshot.exists()) {
    return null;
  }
  return convertToProjectSpace(snapshot.id, snapshot.data() as ProjectSpaceDoc);
}

// ============ Subscription Handlers ============

export type ProjectsSubscriptionHandler = (projects: Project[]) => void;

/**
 * Subscribe to all projects owned by the user.
 * Returns non-deleted projects sorted by pinned status and update time.
 */
export function subscribeToOwnedProjects(
  userId: string,
  handler: ProjectsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const projectsRef = query(
    projectCollection(userId).withConverter(projectConverter),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    projectsRef,
    (snapshot) => {
      const projects = snapshot.docs.map((docSnapshot) => docSnapshot.data());
      handler(projects);
    },
    (error) => {
      console.error("[Projects] Error subscribing to owned projects:", error);
      if (onError) onError(error);
    },
  );
}

/**
 * Subscribe to projects shared with the user (from other owners).
 * Uses collectionGroup query to find projects across all users.
 */
export function subscribeToSharedProjects(
  userId: string,
  handler: ProjectsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  const sharedRef = query(
    collectionGroup(db, "projects").withConverter(projectConverter),
    where("sharedWithUserIds", "array-contains", userId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    sharedRef,
    (snapshot) => {
      const projects = snapshot.docs.map((docSnapshot) => docSnapshot.data());
      handler(projects);
    },
    (error) => {
      console.error("[Projects] Error subscribing to shared projects:", error);
      if (onError) onError(error);
    },
  );
}

/**
 * Subscribe to all projects in a specific space (from any user).
 * Uses collectionGroup query with spaceId filter.
 * Firestore rules must allow access based on space membership.
 */
export function subscribeToSpaceProjects(
  spaceId: string,
  userId: string,
  handler: ProjectsSubscriptionHandler,
  onError?: (error: Error) => void,
): Unsubscribe {
  // Skip for personal space
  if (!spaceId || spaceId === "personal") {
    handler([]);
    return () => {};
  }

  const spaceProjectsRef = query(
    collectionGroup(db, "projects").withConverter(projectConverter),
    where("spaceId", "==", spaceId),
    orderBy("pinned", "desc"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    spaceProjectsRef,
    (snapshot) => {
      // Filter out current user's projects (they come from subscribeToOwnedProjects)
      const projects = snapshot.docs
        .map((docSnapshot) => docSnapshot.data())
        .filter((project) => project.ownerId !== userId);
      handler(projects);
    },
    (error) => {
      console.error("[Projects] Error subscribing to space projects:", error);
      if (onError) onError(error);
    },
  );
}

// ============ CRUD Operations ============

/**
 * Create a new project.
 * For shared spaces, automatically adds all space members to sharedWithUserIds.
 */
export async function createProject(
  userId: string,
  spaceId: string,
  draft: ProjectDraft = {},
): Promise<string> {
  // For shared spaces, add all space members to sharedWithUserIds
  let sharedWithUserIds: string[] = [];
  if (spaceId && spaceId !== "personal") {
    const space = await getSpace(spaceId);
    if (space?.memberUids) {
      // Include all members except the project owner
      sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
    }
  }

  const projectData = createProjectPayload(userId, spaceId, {
    ...draft,
    sharedWithUserIds,
  });

  const docRef = await addDoc(projectCollection(userId), projectData);
  return docRef.id;
}

/**
 * Update an existing project.
 * Handles all field types including dates, collaborators, and space changes.
 */
export async function updateProject(
  userId: string,
  projectId: string,
  updates: ProjectDraft,
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof updates.title === "string") {
    payload.title = updates.title;
  }

  if (typeof updates.description === "string") {
    payload.description = updates.description;
  }

  if (updates.type !== undefined) {
    payload.type = updates.type;
  }

  if (updates.color !== undefined) {
    payload.color = updates.color;
  }

  if (updates.pattern !== undefined) {
    payload.pattern = updates.pattern;
  }

  if (updates.backgroundImage !== undefined) {
    payload.backgroundImage = updates.backgroundImage;
  }

  if (updates.backgroundOverlay !== undefined) {
    payload.backgroundOverlay = updates.backgroundOverlay;
  }

  if (updates.coverImage !== undefined) {
    payload.coverImage = updates.coverImage;
  }

  if (updates.icon !== undefined) {
    payload.icon = updates.icon;
  }

  if (updates.status !== undefined) {
    payload.status = updates.status;
    // Auto-set completedAt when status changes to completed
    if (updates.status === "completed" && updates.completedAt === undefined) {
      payload.completedAt = serverTimestamp();
    } else if (updates.status !== "completed") {
      payload.completedAt = null;
    }
  }

  if (updates.priority !== undefined) {
    payload.priority = updates.priority;
  }

  if (updates.pinned !== undefined) {
    payload.pinned = updates.pinned;
  }

  if (updates.startDate !== undefined) {
    payload.startDate = updates.startDate
      ? Timestamp.fromDate(updates.startDate)
      : null;
  }

  if (updates.dueDate !== undefined) {
    payload.dueDate = updates.dueDate
      ? Timestamp.fromDate(updates.dueDate)
      : null;
  }

  if (updates.completedAt !== undefined) {
    payload.completedAt = updates.completedAt
      ? Timestamp.fromDate(updates.completedAt)
      : null;
  }

  if (updates.labelIds !== undefined) {
    payload.labelIds = updates.labelIds;
  }

  if (updates.whiteboardId !== undefined) {
    payload.whiteboardId = updates.whiteboardId;
  }

  if (updates.tasks !== undefined) {
    payload.tasks = updates.tasks;
  }

  if (updates.attachments !== undefined) {
    payload.attachments = updates.attachments;
  }

  if (updates.reminderAt !== undefined) {
    payload.reminderAt = updates.reminderAt
      ? Timestamp.fromDate(updates.reminderAt)
      : null;
  }

  if (updates.reminderId !== undefined) {
    payload.reminderId = updates.reminderId ?? null;
  }

  if (updates.archived !== undefined) {
    payload.archived = updates.archived;
  }

  if (updates.width !== undefined) {
    payload.width = updates.width;
  }

  if (updates.height !== undefined) {
    payload.height = updates.height;
  }

  if (updates.sharedWith !== undefined) {
    payload.sharedWith = updates.sharedWith.map((collaborator) => ({
      email: collaborator.email,
      role: collaborator.role,
      userId: collaborator.userId,
      invitedAt: Timestamp.fromDate(collaborator.invitedAt),
    }));
  }

  if (updates.sharedWithUserIds !== undefined) {
    payload.sharedWithUserIds = updates.sharedWithUserIds;
  }

  if (updates.spaceId !== undefined) {
    payload.spaceId = updates.spaceId || "personal";

    // When moving to a shared space, update sharedWithUserIds with space members
    if (updates.spaceId && updates.spaceId !== "personal") {
      const space = await getSpace(updates.spaceId);
      if (space?.memberUids) {
        payload.sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
      }
    } else {
      // Moving to personal space - clear sharedWithUserIds (unless explicitly set)
      if (updates.sharedWithUserIds === undefined) {
        payload.sharedWithUserIds = [];
      }
    }
  }

  if (updates.deletedAt !== undefined) {
    payload.deletedAt = updates.deletedAt
      ? Timestamp.fromDate(updates.deletedAt)
      : null;
  }

  await updateDoc(projectDoc(userId, projectId), payload);
}

/**
 * Soft delete a project by setting deletedAt timestamp.
 * Project can be restored later with restoreProject.
 */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await updateDoc(projectDoc(userId, projectId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Permanently delete a project and its attachments from storage.
 * This action cannot be undone.
 */
export async function hardDeleteProject(userId: string, projectId: string): Promise<void> {
  const projectRef = projectDoc(userId, projectId).withConverter(projectConverter);
  const snapshot = await getDoc(projectRef);

  if (snapshot.exists()) {
    const project = snapshot.data();
    // Delete all attachments from storage
    if (project.attachments?.length) {
      await Promise.all(
        project.attachments
          .filter((attachment) => attachment.storagePath)
          .map((attachment) => deleteObject(ref(storage, attachment.storagePath))),
      );
    }
  }

  await deleteDoc(projectDoc(userId, projectId));
}

/**
 * Restore a soft-deleted project.
 */
export async function restoreProject(userId: string, projectId: string): Promise<void> {
  await updateDoc(projectDoc(userId, projectId), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get a single project by ID.
 */
export async function getProject(userId: string, projectId: string): Promise<Project | null> {
  const projectRef = projectDoc(userId, projectId).withConverter(projectConverter);
  const snapshot = await getDoc(projectRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

/**
 * Duplicate an existing project with a new ID.
 * Copies all fields except timestamps and resets status.
 */
export async function duplicateProject(userId: string, projectId: string): Promise<string> {
  const original = await getProject(userId, projectId);

  if (!original) {
    throw new Error(`Project ${projectId} not found`);
  }

  const duplicatedDraft: ProjectDraft = {
    title: `${original.title} (Copy)`,
    description: original.description,
    type: original.type,
    color: original.color,
    pattern: original.pattern,
    backgroundImage: original.backgroundImage,
    backgroundOverlay: original.backgroundOverlay,
    coverImage: original.coverImage,
    icon: original.icon,
    status: "planning", // Reset status for duplicate
    priority: original.priority,
    pinned: false, // Don't pin duplicates
    startDate: null, // Reset dates
    dueDate: null,
    completedAt: null,
    labelIds: original.labelIds,
    whiteboardId: null, // Don't duplicate whiteboard association
    tasks: original.tasks.map((task) => ({
      ...task,
      id: generateUUID(), // Generate new IDs for tasks
      completed: false, // Reset task completion
    })),
    attachments: [], // Don't duplicate attachments (storage references)
    reminderAt: null,
    reminderId: null,
    archived: false,
  };

  return createProject(userId, original.spaceId, duplicatedDraft);
}

// ============ Toggle Operations ============

/**
 * Toggle the pinned status of a project.
 */
export async function togglePin(userId: string, projectId: string, pinned: boolean): Promise<void> {
  await updateDoc(projectDoc(userId, projectId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle the archived status of a project.
 */
export async function toggleArchive(
  userId: string,
  projectId: string,
  archived: boolean,
): Promise<void> {
  await updateDoc(projectDoc(userId, projectId), {
    archived,
    updatedAt: serverTimestamp(),
  });
}

// ============ Task Operations ============

/**
 * Update tasks within a project.
 */
export async function updateProjectTasks(
  userId: string,
  projectId: string,
  tasks: ProjectTask[],
): Promise<void> {
  await updateDoc(projectDoc(userId, projectId), {
    tasks,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle a single task's completion status.
 */
export async function toggleTaskCompletion(
  userId: string,
  projectId: string,
  taskId: string,
): Promise<void> {
  const project = await getProject(userId, projectId);
  if (!project) return;

  const updatedTasks = project.tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  );

  await updateProjectTasks(userId, projectId, updatedTasks);
}

// ============ Attachment Operations ============

/**
 * Upload an attachment to a project.
 */
export async function uploadProjectAttachment(
  userId: string,
  projectId: string,
  file: File,
): Promise<ProjectAttachment> {
  const attachmentId = generateUUID();
  const sanitizedName = file.name.replace(/\s+/g, "-");
  const storagePath = `${projectDocPath(userId, projectId)}/attachments/${attachmentId}-${sanitizedName}`;
  const fileRef = ref(storage, storagePath);

  const uploadResult = await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
    },
  });

  const downloadURL = await getDownloadURL(uploadResult.ref);

  return {
    id: attachmentId,
    name: file.name,
    storagePath,
    downloadURL,
    contentType: file.type,
    size: file.size,
  };
}

/**
 * Delete an attachment from storage.
 */
export async function deleteAttachment(storagePath: string): Promise<void> {
  const fileRef = ref(storage, storagePath);
  await deleteObject(fileRef);
}

// ============ Batch Operations ============

/**
 * Batch update multiple projects.
 */
export async function batchUpdateProjects(
  userId: string,
  projectIds: string[],
  updates: Partial<ProjectDraft>,
): Promise<void> {
  const batch = writeBatch(db);

  for (const projectId of projectIds) {
    const projectRef = projectDoc(userId, projectId);
    batch.update(projectRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

/**
 * Batch soft-delete multiple projects.
 */
export async function batchDeleteProjects(userId: string, projectIds: string[]): Promise<void> {
  const batch = writeBatch(db);

  for (const projectId of projectIds) {
    const projectRef = projectDoc(userId, projectId);
    batch.update(projectRef, {
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// ============ Paginated Query ============

export interface GetProjectsOptions {
  limit?: number;
  startAfter?: DocumentSnapshot;
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "startDate";
  sortOrder?: "asc" | "desc";
  spaceId?: string;
  status?: string[];
  includeArchived?: boolean;
  includeDeleted?: boolean;
}

export interface GetProjectsResult {
  projects: Project[];
  lastDoc: DocumentSnapshot | null;
}

/**
 * Get paginated projects with filtering options.
 */
export async function getUserProjects(
  userId: string,
  options: GetProjectsOptions = {},
): Promise<GetProjectsResult> {
  const {
    limit: limitCount = 20,
    startAfter: startAfterDoc,
    sortBy = "updatedAt",
    sortOrder = "desc",
    spaceId,
    status,
    includeArchived = false,
    includeDeleted = false,
  } = options;

  // Build query constraints
  const constraints: QueryConstraint[] = [
    orderBy("pinned", "desc"),
    orderBy(sortBy, sortOrder),
    limit(limitCount),
  ];

  // Add cursor pagination
  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc));
  }

  const projectsRef = query(
    projectCollection(userId).withConverter(projectConverter),
    ...constraints,
  );

  const snapshot = await getDocs(projectsRef);

  let projects = snapshot.docs.map((doc) => doc.data());

  // Filter by space (client-side)
  if (spaceId && spaceId !== "personal") {
    projects = projects.filter((project) => project.spaceId === spaceId);
  } else if (spaceId === "personal") {
    // Personal space: projects without spaceId or with "personal"
    projects = projects.filter(
      (project) => !project.spaceId || project.spaceId === "personal",
    );
  }

  // Filter by status
  if (status && status.length > 0) {
    projects = projects.filter((project) => status.includes(project.status));
  }

  // Filter out deleted and archived unless requested
  if (!includeDeleted) {
    projects = projects.filter((project) => !project.deletedAt);
  }
  if (!includeArchived) {
    projects = projects.filter((project) => !project.archived);
  }

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { projects, lastDoc };
}

// ============ Space Migration ============

/**
 * Migrate projects in a shared space to populate sharedWithUserIds.
 * Call this when a space is selected to fix any projects that were created before the sharing fix.
 */
export async function migrateSpaceProjectsSharing(
  userId: string,
  spaceId: string,
): Promise<number> {
  if (!spaceId || spaceId === "personal") {
    return 0;
  }

  const space = await getSpace(spaceId);
  if (!space?.memberUids || space.memberUids.length < 2) {
    return 0; // No other members to share with
  }

  const sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
  if (sharedWithUserIds.length === 0) {
    return 0;
  }

  // Query owned projects in this space that don't have proper sharedWithUserIds
  const projectsRef = query(
    projectCollection(userId).withConverter(projectConverter),
    where("spaceId", "==", spaceId),
  );

  const snapshot = await getDocs(projectsRef);
  const batch = writeBatch(db);
  let updateCount = 0;

  snapshot.docs.forEach((docSnapshot) => {
    const project = docSnapshot.data();
    const existingSharedWith = project.sharedWithUserIds || [];

    // Check if all space members are already in sharedWithUserIds
    const missingMembers = sharedWithUserIds.filter(
      (uid) => !existingSharedWith.includes(uid),
    );

    if (missingMembers.length > 0) {
      const projectRef = projectDoc(userId, docSnapshot.id);
      batch.update(projectRef, {
        sharedWithUserIds: [...new Set([...existingSharedWith, ...sharedWithUserIds])],
      });
      updateCount++;
    }
  });

  if (updateCount > 0) {
    await batch.commit();
  }

  return updateCount;
}
