import type { Timestamp } from "firebase/firestore";

export type MasonryColumns = 1 | 2 | 3 | 4;

export type UserPreferenceDoc = {
  pinnedColumns?: MasonryColumns;
  allEntriesColumns?: MasonryColumns;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserPreference = {
  id: string;
  pinnedColumns: MasonryColumns;
  allEntriesColumns: MasonryColumns;
  createdAt: Date;
  updatedAt: Date;
};
