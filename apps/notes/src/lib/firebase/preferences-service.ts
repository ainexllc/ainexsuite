import {
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { clientPreferenceDoc } from "@/lib/firebase/client-collections";
import type { UserPreference } from "@/lib/types/settings";

export const DEFAULT_PREFERENCES: Omit<UserPreference, "id" | "createdAt" | "updatedAt"> = {
  reminderChannels: ["push", "email"],
  smsNumber: null,
  quietHoursStart: null,
  quietHoursEnd: null,
  digestEnabled: true,
  smartSuggestions: true,
  focusModePinned: true,
  viewMode: "masonry",
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
