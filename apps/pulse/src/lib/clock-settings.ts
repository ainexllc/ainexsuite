import { db, storage } from '@ainexsuite/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const SETTINGS_COLLECTION = 'user_settings';
const CLOCK_SETTINGS_DOC = 'pulse_clock';

export type ClockStyle = 'digital' | 'analog' | 'neon' | 'flip' | 'particles';

export interface ClockSettings {
  tiles: Record<string, string | null>;
  backgroundImage: string | null;
  timeFormat?: '12h' | '24h'; // Time format preference
  weatherZipcode?: string; // User's preferred zipcode for weather tile
  layoutId?: string; // ID of the selected layout configuration
  backgroundEffect?: string; // Selected background effect
  backgroundDim?: number; // Overlay opacity 0-100
  clockStyle?: string; // 'digital', 'analog', etc.
}

export const ClockService = {
  async saveSettings(userId: string, settings: Partial<ClockSettings>) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, CLOCK_SETTINGS_DOC);

    let settingsToSave: Partial<ClockSettings> = { ...settings };

    // Handle large base64 images by uploading to Storage
    if (settings.backgroundImage && settings.backgroundImage.startsWith('data:')) {
      try {
        // Upload base64 image to Storage
        const storageRef = ref(storage, `users/${userId}/backgrounds/generated-${Date.now()}.png`);
        await uploadString(storageRef, settings.backgroundImage, 'data_url');
        // Get the download URL and store that instead of the base64
        const downloadUrl = await getDownloadURL(storageRef);
        settingsToSave = { ...settingsToSave, backgroundImage: downloadUrl };
      } catch (error) {
        console.error('Failed to upload background image to Storage:', error);
        // If upload fails, don't save the base64 data which would exceed Firestore limits
        settingsToSave = { ...settingsToSave, backgroundImage: undefined };
      }
    }

    await setDoc(docRef, settingsToSave, { merge: true });
  },

  async getSettings(userId: string): Promise<ClockSettings | null> {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, CLOCK_SETTINGS_DOC);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as ClockSettings) : null;
  },

  subscribeToSettings(userId: string, callback: (settings: ClockSettings | null) => void) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, CLOCK_SETTINGS_DOC);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as ClockSettings);
      } else {
        callback(null);
      }
    });
  }
};
