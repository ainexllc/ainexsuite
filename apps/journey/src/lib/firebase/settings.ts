import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

const SETTINGS_COLLECTION = 'user_settings';

export interface UserSettings {
  userId: string;
  privacyPasscode?: string;
  privacyPasscodeCreatedAt?: Date;
  theme?: {
    mode: 'light' | 'dark' | 'auto';
    accentColor: string;
  };
  privacy?: {
    personalizedWelcome: boolean;
  };
  lastUpdated: Date;
}

// Default settings for new users
const DEFAULT_SETTINGS: Omit<UserSettings, 'userId' | 'lastUpdated'> = {
  theme: {
    mode: 'auto',
    accentColor: 'orange',
  },
  privacy: {
    personalizedWelcome: false,
  },
};

// Get user settings
export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        userId,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        privacyPasscodeCreatedAt: data.privacyPasscodeCreatedAt?.toDate(),
      } as UserSettings;
    }

    // Create default settings if they don't exist
    const newSettings: UserSettings = {
      userId,
      ...DEFAULT_SETTINGS,
      lastUpdated: new Date(),
    };

    await setDoc(docRef, {
      ...newSettings,
      lastUpdated: Timestamp.fromDate(newSettings.lastUpdated),
    });

    return newSettings;
  } catch (error) {
    // Return defaults on error
    return {
      userId,
      ...DEFAULT_SETTINGS,
      lastUpdated: new Date(),
    };
  }
}

// Update settings
export async function updateUserSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, 'userId' | 'lastUpdated'>>
): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, userId);

    const updateData: any = {
      ...updates,
      lastUpdated: Timestamp.now(),
    };

    // Convert Date to Timestamp for Firestore
    if (updates.privacyPasscodeCreatedAt instanceof Date) {
      updateData.privacyPasscodeCreatedAt = Timestamp.fromDate(updates.privacyPasscodeCreatedAt);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    throw error;
  }
}

// Update privacy settings
export async function updatePrivacySettings(
  userId: string,
  privacy: UserSettings['privacy']
): Promise<void> {
  return updateUserSettings(userId, { privacy });
}
