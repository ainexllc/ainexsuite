import type { Timestamp } from "firebase/firestore";
import type { Node, Edge } from "@xyflow/react";
import type { SpaceType } from "@ainexsuite/types";

// Re-export SpaceType for convenience
export type { SpaceType };

// ============ Space Types ============
export type SpaceMemberRole = "admin" | "member" | "viewer";

export type SpaceMember = {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: SpaceMemberRole;
  joinedAt: string;
};

export type WorkflowSpaceDoc = {
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: Timestamp;
  createdBy: string;
};

export type WorkflowSpace = Omit<WorkflowSpaceDoc, "createdAt"> & {
  id: string;
  createdAt: Date;
};

export type WorkflowSpaceDraft = {
  name?: string;
  type?: SpaceType;
};

// ============ Workflow Types ============
export type WorkflowColor =
  | "default"
  | "workflow-blue"
  | "workflow-green"
  | "workflow-amber"
  | "workflow-purple"
  | "workflow-pink"
  | "workflow-cyan"
  | "workflow-slate"
  | "workflow-rose"
  | "workflow-emerald";

export type WorkflowPriority = "high" | "medium" | "low" | null;

export type EdgeStyleType = "smoothstep" | "straight" | "step" | "default";
export type ArrowType = "none" | "start" | "end" | "both";
export type LineStyleType =
  | "solid"
  | "dashed"
  | "dotted"
  | "animated-solid"
  | "animated-dashed"
  | "animated-dotted";

export type WorkflowViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type CollaboratorRole = "viewer" | "editor";

export type WorkflowCollaboratorDoc = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Timestamp;
  userId: string;
};

export type WorkflowCollaborator = {
  email: string;
  role: CollaboratorRole;
  invitedAt: Date;
  userId: string;
};

export type WorkflowDoc = {
  ownerId: string;
  spaceId?: string; // Optional - null/undefined means personal default space
  title: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport: WorkflowViewport;
  edgeType: EdgeStyleType;
  arrowType: ArrowType;
  lineStyle: LineStyleType;
  thumbnail?: string | null; // Base64 or URL of canvas preview
  nodeCount: number;
  color: WorkflowColor;
  pinned: boolean;
  priority?: WorkflowPriority;
  archived: boolean;
  labelIds: string[];
  reminderAt?: Timestamp | null;
  reminderId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
  sharedWith: WorkflowCollaboratorDoc[];
  sharedWithUserIds: string[];
};

export type Workflow = Omit<
  WorkflowDoc,
  "createdAt" | "updatedAt" | "reminderAt" | "sharedWith" | "deletedAt"
> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  reminderAt?: Date | null;
  reminderId?: string | null;
  deletedAt?: Date | null;
  sharedWith: WorkflowCollaborator[];
  priority?: WorkflowPriority;
};

export type WorkflowDraft = {
  title?: string;
  description?: string;
  spaceId?: string;
  nodes?: Node[];
  edges?: Edge[];
  viewport?: WorkflowViewport;
  edgeType?: EdgeStyleType;
  arrowType?: ArrowType;
  lineStyle?: LineStyleType;
  thumbnail?: string | null;
  nodeCount?: number;
  color?: WorkflowColor;
  pinned?: boolean;
  priority?: WorkflowPriority;
  archived?: boolean;
  labelIds?: string[];
  reminderAt?: Date | null;
  reminderId?: string | null;
  sharedWith?: WorkflowCollaborator[];
  sharedWithUserIds?: string[];
  deletedAt?: Date | null;
};

// ============ Label Types ============
export type LabelDoc = {
  ownerId: string;
  name: string;
  color: WorkflowColor;
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
  color?: WorkflowColor;
  parentId?: string | null;
};
