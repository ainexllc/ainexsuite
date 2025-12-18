import type { Timestamp } from "firebase/firestore";

// ============ Space Types ============
export type SpaceType = "personal" | "family" | "couple";

export type SpaceMemberRole = "admin" | "member" | "viewer";

export type SpaceMember = {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: SpaceMemberRole;
  joinedAt: string;
};

export type JournalSpaceDoc = {
  name: string;
  type: SpaceType;
  members: SpaceMember[];
  memberUids: string[];
  createdAt: Timestamp;
  createdBy: string;
};

export type JournalSpace = Omit<JournalSpaceDoc, "createdAt"> & {
  id: string;
  createdAt: Date;
};

export type JournalSpaceDraft = {
  name?: string;
  type?: SpaceType;
};
