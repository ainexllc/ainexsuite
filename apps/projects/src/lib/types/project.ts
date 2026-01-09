import type { Timestamp } from "firebase/firestore";

// ============ Space Types ============
export type SpaceType = "personal" | "family" | "work" | "couple" | "buddy" | "squad" | "project";

export type SpaceMemberRole = "admin" | "member" | "viewer";

export type SpaceMember = {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: SpaceMemberRole;
  joinedAt: string;
};

export type ProjectSpaceDoc = {
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: Timestamp;
  createdBy: string;
};

export type ProjectSpace = Omit<ProjectSpaceDoc, "createdAt"> & {
  id: string;
  createdAt: Date;
};

export type ProjectSpaceDraft = {
  name?: string;
  type?: SpaceType;
};

// ============ Project Types ============
export type ProjectType = "app" | "video" | "design" | "marketing" | "research" | "other";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived";

export type ProjectColor =
  | "default"
  | "project-white"
  | "project-lemon"
  | "project-peach"
  | "project-tangerine"
  | "project-mint"
  | "project-fog"
  | "project-lavender"
  | "project-blush"
  | "project-sky"
  | "project-moss"
  | "project-coal";

export type ProjectPattern =
  | "none"
  | "dots"
  | "grid"
  | "diagonal"
  | "waves"
  | "circles";

export type BackgroundOverlay =
  | "none"
  | "auto"
  | "dim"
  | "dimmer"
  | "dimmest"
  | "glass"
  | "frost"
  | "gradient";

export type ProjectPriority = "high" | "medium" | "low" | null;

export type ProjectTask = {
  id: string;
  text: string;
  completed: boolean;
  indent?: number; // 0-3 levels of indentation (default 0)
  dueDate?: string | null;
  assigneeId?: string | null;
};

export type ProjectAttachment = {
  id: string;
  name: string;
  downloadURL: string;
  storagePath: string;
  contentType: string;
  size: number;
};

export type CollaboratorRole = "viewer" | "editor" | "admin";

export type ProjectCollaboratorDoc = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Timestamp;
  userId: string;
};

export type ProjectCollaborator = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Date;
  userId: string;
};

export type ProjectDoc = {
  ownerId: string;
  spaceId: string; // 'personal' for personal content, or actual space ID

  // Core fields
  title: string;
  description: string; // Rich text description
  type: ProjectType;

  // Visual
  color: ProjectColor;
  pattern?: ProjectPattern;
  backgroundImage?: string | null;
  backgroundOverlay?: BackgroundOverlay;
  coverImage?: string | null;
  icon?: string | null; // Emoji or icon identifier

  // Status & Priority
  status: ProjectStatus;
  priority?: ProjectPriority;
  pinned: boolean;

  // Dates
  startDate?: Timestamp | null;
  dueDate?: Timestamp | null;
  completedAt?: Timestamp | null;

  // Organization
  labelIds: string[];

  // Whiteboard association
  whiteboardId?: string | null;

  // Collaboration
  sharedWith: ProjectCollaboratorDoc[];
  sharedWithUserIds: string[];

  // Metadata
  archived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;

  // Attachments
  attachments: ProjectAttachment[];

  // Tasks (like checklist)
  tasks: ProjectTask[];

  // Reminders
  reminderAt?: Timestamp | null;
  reminderId?: string | null;

  // Sizing
  width?: number;
  height?: number;
};

export type Project = Omit<
  ProjectDoc,
  | "createdAt"
  | "updatedAt"
  | "startDate"
  | "dueDate"
  | "completedAt"
  | "reminderAt"
  | "sharedWith"
  | "deletedAt"
> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  reminderAt?: Date | null;
  reminderId?: string | null;
  deletedAt?: Date | null;
  sharedWith: ProjectCollaborator[];
  priority?: ProjectPriority;
};

export type ProjectDraft = {
  title?: string;
  description?: string;
  type?: ProjectType;
  spaceId?: string;
  color?: ProjectColor;
  pattern?: ProjectPattern;
  backgroundImage?: string | null;
  backgroundOverlay?: BackgroundOverlay;
  coverImage?: string | null;
  icon?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  pinned?: boolean;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  labelIds?: string[];
  whiteboardId?: string | null;
  tasks?: ProjectTask[];
  attachments?: ProjectAttachment[];
  sharedWith?: ProjectCollaborator[];
  sharedWithUserIds?: string[];
  reminderAt?: Date | null;
  reminderId?: string | null;
  deletedAt?: Date | null;
  archived?: boolean;
  width?: number;
  height?: number;
};

// ============ Label Types ============
export type LabelDoc = {
  ownerId: string;
  name: string;
  color: ProjectColor;
  parentId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Label = Omit<LabelDoc, "createdAt" | "updatedAt"> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LabelDraft = {
  name?: string;
  color?: ProjectColor;
  parentId?: string | null;
};

// ============ Filter Types ============
export type QuickDatePreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear";

export type DateRangeField = "createdAt" | "updatedAt" | "dueDate" | "startDate";

export type ProjectFilterValue = {
  labels?: string[];
  colors?: ProjectColor[];
  status?: ProjectStatus[];
  priority?: ("high" | "medium" | "low")[];
  type?: ProjectType[];
  dateRange?: { start: Date | null; end: Date | null };
  datePreset?: QuickDatePreset;
  dateField?: DateRangeField;
  hasWhiteboard?: boolean;
  search?: string;
};

export type SortField = "title" | "createdAt" | "updatedAt" | "dueDate" | "startDate" | "priority" | "status";
export type SortDirection = "asc" | "desc";

export type SortConfig = {
  field: SortField;
  direction: SortDirection;
};

// ============ View Types ============
export type ViewMode = "board" | "list" | "timeline" | "whiteboard";

// ============ Preferences Types ============
export type ProjectsPreferences = {
  viewMode: ViewMode;
  focusColumns: number;
  libraryColumns: number;
  sortConfig: SortConfig;
  filter: ProjectFilterValue;
  showArchived: boolean;
  showCompleted: boolean;
};
