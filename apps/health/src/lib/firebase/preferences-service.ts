import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import type { UserPreference, StoredHealthFilterValue, SortConfig } from '@/lib/types/settings';
import type { HealthFilterValue } from '@/components/health-filter-content';

export const DEFAULT_PREFERENCES: Omit<UserPreference, 'id' | 'createdAt' | 'updatedAt'> = {
  viewMode: 'masonry',
};

/**
 * Get document reference for user preferences
 */
function getPreferenceDocRef(userId: string) {
  return doc(db, 'users', userId, 'health_preferences', 'settings');
}

/**
 * Convert runtime FilterValue to Firestore-safe format
 */
function toStoredFilters(filters: HealthFilterValue): StoredHealthFilterValue {
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
function toRuntimeFilters(stored: StoredHealthFilterValue): HealthFilterValue {
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
    viewMode: data.viewMode ?? DEFAULT_PREFERENCES.viewMode,
    calendarView: data.calendarView,
    savedFilters: data.savedFilters
      ? toRuntimeFilters(data.savedFilters as StoredHealthFilterValue)
      : undefined,
    savedSort: data.savedSort as SortConfig | undefined,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export type PreferenceSubscriptionHandler = (preferences: UserPreference) => void;

export function subscribeToPreferences(
  userId: string,
  handler: PreferenceSubscriptionHandler,
): Unsubscribe {
  const docRef = getPreferenceDocRef(userId);

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
  updates: Partial<Omit<UserPreference, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const docRef = getPreferenceDocRef(userId);

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
  filters: HealthFilterValue,
  sort?: SortConfig,
): Promise<void> {
  const docRef = getPreferenceDocRef(userId);

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
  const docRef = getPreferenceDocRef(userId);

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
