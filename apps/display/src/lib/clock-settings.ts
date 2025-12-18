import { db } from '@ainexsuite/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'user_settings';

export type ClockStyle = 'digital' | 'neon' | 'flip' | 'analog' | 'retro-digital' | 'christmas-analog' | 'minimal' | 'binary';

export interface ClockSettings {
  tiles: Record<string, string | null>;
  backgroundImage: string | null;
  timeFormat?: '12h' | '24h'; // Time format preference
  weatherZipcode?: string; // User's preferred zipcode for weather tile
  layoutId?: string; // ID of the selected layout configuration
  backgroundEffect?: string; // Selected background effect
  backgroundDim?: number; // Dim level for background (0-100)
  clockStyle?: ClockStyle; // Clock style preference
  showClock?: boolean; // Whether to show/hide the clock
  showTiles?: boolean; // Whether to show/hide the tiles
}

// Generate doc ID based on space (or default if no space)
const getDocId = (spaceId?: string) => spaceId ? `pulse_clock_${spaceId}` : 'pulse_clock';

export const ClockService = {
  async saveSettings(userId: string, settings: Partial<ClockSettings>, spaceId?: string) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, getDocId(spaceId));
    await setDoc(docRef, settings, { merge: true });
  },

  async getSettings(userId: string, spaceId?: string): Promise<ClockSettings | null> {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, getDocId(spaceId));
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as ClockSettings) : null;
  },

  subscribeToSettings(userId: string, spaceId: string | undefined, callback: (settings: ClockSettings | null) => void) {
    const docRef = doc(db, 'users', userId, SETTINGS_COLLECTION, getDocId(spaceId));
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as ClockSettings);
      } else {
        callback(null);
      }
    });
  }
};
