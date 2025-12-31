import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import type { UserPreference, MasonryColumns } from "@/lib/types/settings";

export const DEFAULT_PREFERENCES: Omit<UserPreference, "id" | "createdAt" | "updatedAt"> = {
  pinnedColumns: 3,
  allEntriesColumns: 3,
};

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
    pinnedColumns: (data.pinnedColumns ?? DEFAULT_PREFERENCES.pinnedColumns) as MasonryColumns,
    allEntriesColumns: (data.allEntriesColumns ?? DEFAULT_PREFERENCES.allEntriesColumns) as MasonryColumns,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export type PreferenceSubscriptionHandler = (preferences: UserPreference) => void;

export function subscribeToPreferences(
  userId: string,
  handler: PreferenceSubscriptionHandler,
): Unsubscribe {
  const docRef = doc(db, "journal_preferences", userId);

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
  const docRef = doc(db, "journal_preferences", userId);

  await setDoc(
    docRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
