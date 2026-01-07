import {
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import {
  clientFilterPresetsCollection,
  clientFilterPresetDoc,
} from "@/lib/firebase/client-collections";
import type { FilterValue } from "@ainexsuite/ui";
import type {
  FilterPreset,
  FilterPresetDoc,
  CreateFilterPresetInput,
} from "@/lib/types/filter-preset";
import type { StoredFilterValue } from "@/lib/types/settings";

export type FilterPresetsSubscriptionHandler = (presets: FilterPreset[]) => void;

/**
 * Convert runtime FilterValue to Firestore-safe format
 */
function toStoredFilters(filters: FilterValue): StoredFilterValue {
  return {
    ...filters,
    dateRange: filters.dateRange
      ? {
          start: filters.dateRange.start
            ? Timestamp.fromDate(filters.dateRange.start)
            : null,
          end: filters.dateRange.end
            ? Timestamp.fromDate(filters.dateRange.end)
            : null,
        }
      : undefined,
  };
}

/**
 * Convert Firestore format to runtime FilterValue
 */
function toRuntimeFilters(stored: StoredFilterValue): FilterValue {
  return {
    ...stored,
    dateRange: stored.dateRange
      ? {
          start: stored.dateRange.start?.toDate() ?? null,
          end: stored.dateRange.end?.toDate() ?? null,
        }
      : undefined,
  };
}

/**
 * Convert Firestore document to runtime FilterPreset
 */
function toFilterPreset(id: string, doc: FilterPresetDoc): FilterPreset {
  return {
    id,
    name: doc.name,
    filters: toRuntimeFilters(doc.filters),
    sort: doc.sort,
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

/**
 * Subscribe to user's saved filter presets
 */
export function subscribeToFilterPresets(
  userId: string,
  handler: FilterPresetsSubscriptionHandler
): Unsubscribe {
  const presetsQuery = query(
    clientFilterPresetsCollection(userId),
    orderBy("name", "asc")
  );

  return onSnapshot(presetsQuery, (snapshot) => {
    const presets = snapshot.docs.map(doc =>
      toFilterPreset(doc.id, doc.data() as FilterPresetDoc)
    );
    handler(presets);
  });
}

/**
 * Create a new saved filter preset
 */
export async function createFilterPreset(
  userId: string,
  input: CreateFilterPresetInput
): Promise<string> {
  const payload: Omit<FilterPresetDoc, "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    name: input.name,
    filters: toStoredFilters(input.filters),
    sort: input.sort,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(clientFilterPresetsCollection(userId), payload);
  return docRef.id;
}

/**
 * Delete a saved filter preset
 */
export async function deleteFilterPreset(
  userId: string,
  presetId: string
): Promise<void> {
  await deleteDoc(clientFilterPresetDoc(userId, presetId));
}
