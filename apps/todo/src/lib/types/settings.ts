import type { Timestamp } from "firebase/firestore";

export type MasonryColumns = 1 | 2 | 3 | 4;

export type UserPreferenceDoc = {
  pinnedColumns?: MasonryColumns;
  allTasksColumns?: MasonryColumns;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserPreference = {
  id: string;
  pinnedColumns: MasonryColumns;
  allTasksColumns: MasonryColumns;
  createdAt: Date;
  updatedAt: Date;
};
