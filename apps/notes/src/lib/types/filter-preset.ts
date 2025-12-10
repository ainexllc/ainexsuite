import type { Timestamp } from "firebase/firestore";
import type { FilterValue, SortConfig } from "@ainexsuite/ui";
import type { StoredFilterValue } from "./settings";

/**
 * Firestore document structure for a saved filter preset
 */
export interface FilterPresetDoc {
  name: string;
  filters: StoredFilterValue;
  sort?: SortConfig;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Runtime representation of a saved filter preset
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterValue;
  sort?: SortConfig;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new filter preset
 */
export interface CreateFilterPresetInput {
  name: string;
  filters: FilterValue;
  sort?: SortConfig;
}
