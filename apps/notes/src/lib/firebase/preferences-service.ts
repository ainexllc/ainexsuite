import {
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { clientPreferenceDoc } from "@/lib/firebase/client-collections";
import type { UserPreference, StoredFilterValue } from "@/lib/types/settings";
import type { FilterValue, SortConfig } from "@ainexsuite/ui";

export const DEFAULT_PREFERENCES: Omit<UserPreference, "id" | "createdAt" | "updatedAt"> = {
  reminderChannels: ["push", "email"],
  smsNumber: null,
  quietHoursStart: null,
  quietHoursEnd: null,
  digestEnabled: true,
  smartSuggestions: true,
  focusModePinned: true,
  viewMode: "masonry",
  workspaceBackground: null,
};

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

function mapPreferenceSnapshot(
  userId: string,
  data: DocumentData | undefined,
): UserPreference {
  if (!data) {
    return {
      id: userId,
      ...DEFAULT_PREFERENCES,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: userId,
    reminderChannels: data.reminderChannels ?? DEFAULT_PREFERENCES.reminderChannels,
    smsNumber: data.smsNumber ?? null,
    quietHoursStart: data.quietHoursStart ?? null,
    quietHoursEnd: data.quietHoursEnd ?? null,
    digestEnabled:
      typeof data.digestEnabled === "boolean"
        ? data.digestEnabled
        : DEFAULT_PREFERENCES.digestEnabled,
    smartSuggestions:
      typeof data.smartSuggestions === "boolean"
        ? data.smartSuggestions
        : DEFAULT_PREFERENCES.smartSuggestions,
    focusModePinned:
      typeof data.focusModePinned === "boolean"
        ? data.focusModePinned
        : DEFAULT_PREFERENCES.focusModePinned,
    viewMode: data.viewMode ?? DEFAULT_PREFERENCES.viewMode,
    calendarView: data.calendarView,
    savedFilters: data.savedFilters
      ? toRuntimeFilters(data.savedFilters as StoredFilterValue)
      : undefined,
    savedSort: data.savedSort as SortConfig | undefined,
    workspaceBackground: data.workspaceBackground ?? null,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export type PreferenceSubscriptionHandler = (preferences: UserPreference) => void;

export function subscribeToPreferences(
  userId: string,
  handler: PreferenceSubscriptionHandler,
): Unsubscribe {
  const docRef = clientPreferenceDoc(userId);

  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      void setDoc(
        docRef,
        {
          ...DEFAULT_PREFERENCES,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      handler({
        id: userId,
        ...DEFAULT_PREFERENCES,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }

    handler(mapPreferenceSnapshot(userId, snapshot.data()));
  });
}

export async function updatePreferences(
  userId: string,
  updates: Partial<Omit<UserPreference, "id" | "createdAt" | "updatedAt">>,
) {
  const docRef = clientPreferenceDoc(userId);

  await setDoc(
    docRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Save current filters to user preferences
 */
export async function saveFiltersToPreferences(
  userId: string,
  filters: FilterValue,
  sort?: SortConfig,
): Promise<void> {
  const docRef = clientPreferenceDoc(userId);

  await setDoc(
    docRef,
    {
      savedFilters: toStoredFilters(filters),
      ...(sort !== undefined && { savedSort: sort }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Clear saved filters from user preferences
 */
export async function clearSavedFilters(userId: string): Promise<void> {
  const docRef = clientPreferenceDoc(userId);

  await setDoc(
    docRef,
    {
      savedFilters: null,
      savedSort: null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
