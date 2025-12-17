/**
 * Backgrounds service for managing shared background images
 * Used by admin app for CRUD and consumer apps for fetching
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './client';
import type {
  BackgroundDoc,
  BackgroundCreateInput,
  BackgroundUpdateInput,
  BackgroundFilters,
  BackgroundOption,
} from '@ainexsuite/types';

const COLLECTION_NAME = 'backgrounds';

/**
 * Convert Firestore document to BackgroundDoc
 */
function docToBackground(id: string, data: Record<string, unknown>): BackgroundDoc {
  return {
    id,
    name: data.name as string,
    brightness: data.brightness as BackgroundDoc['brightness'],
    storagePath: data.storagePath as string,
    downloadURL: data.downloadURL as string,
    thumbnailURL: data.thumbnailURL as string | undefined,
    accessLevel: data.accessLevel as BackgroundDoc['accessLevel'],
    tags: (data.tags as string[]) || [],
    category: data.category as BackgroundDoc['category'],
    seasonal: data.seasonal as BackgroundDoc['seasonal'],
    uploadedBy: data.uploadedBy as string,
    uploadedAt: data.uploadedAt instanceof Timestamp
      ? data.uploadedAt.toDate()
      : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : new Date(),
    active: data.active as boolean ?? true,
  };
}

/**
 * Convert BackgroundDoc to simplified BackgroundOption for UI
 */
export function toBackgroundOption(bg: BackgroundDoc): BackgroundOption {
  return {
    id: bg.id,
    name: bg.name,
    thumbnail: bg.thumbnailURL || bg.downloadURL,
    fullImage: bg.downloadURL,
    brightness: bg.brightness,
    category: bg.category,
    tags: bg.tags,
  };
}

/**
 * Upload a new background image
 */
export async function uploadBackground(
  file: File,
  metadata: BackgroundCreateInput,
  uploadedBy: string
): Promise<BackgroundDoc> {
  const backgroundId = crypto.randomUUID();
  const extension = file.name.split('.').pop() || 'jpg';
  const storagePath = `backgrounds/${backgroundId}.${extension}`;

  // Upload to Storage
  const storageRef = ref(storage, storagePath);
  const uploadResult = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      brightness: metadata.brightness,
    },
  });

  // Get download URL
  const downloadURL = await getDownloadURL(uploadResult.ref);

  // Create Firestore document
  const backgroundDoc = {
    name: metadata.name,
    brightness: metadata.brightness,
    storagePath,
    downloadURL,
    accessLevel: metadata.accessLevel,
    tags: metadata.tags,
    category: metadata.category,
    seasonal: metadata.seasonal || null,
    uploadedBy,
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    active: true,
  };

  await setDoc(doc(db, COLLECTION_NAME, backgroundId), backgroundDoc);

  return {
    id: backgroundId,
    ...backgroundDoc,
    uploadedAt: new Date(),
    updatedAt: new Date(),
    active: true,
  } as BackgroundDoc;
}

/**
 * Update background metadata
 */
export async function updateBackground(
  backgroundId: string,
  updates: BackgroundUpdateInput
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, backgroundId);

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a background (removes from both Storage and Firestore)
 */
export async function deleteBackground(backgroundId: string): Promise<void> {
  // Get the document first to get the storage path
  const docRef = doc(db, COLLECTION_NAME, backgroundId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Background not found');
  }

  const data = docSnap.data();
  const storagePath = data.storagePath as string;

  // Delete from Storage
  if (storagePath) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn('Failed to delete storage file:', error);
      // Continue with Firestore deletion even if storage fails
    }
  }

  // Delete from Firestore
  await deleteDoc(docRef);
}

/**
 * Get all backgrounds with optional filters
 */
export async function getBackgrounds(
  filters?: BackgroundFilters
): Promise<BackgroundDoc[]> {
  let q = query(collection(db, COLLECTION_NAME), orderBy('uploadedAt', 'desc'));

  // Apply filters
  if (filters?.active !== undefined) {
    q = query(q, where('active', '==', filters.active));
  }
  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters?.accessLevel) {
    q = query(q, where('accessLevel', '==', filters.accessLevel));
  }
  if (filters?.brightness) {
    q = query(q, where('brightness', '==', filters.brightness));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToBackground(doc.id, doc.data()));
}

/**
 * Get a single background by ID
 */
export async function getBackgroundById(
  backgroundId: string
): Promise<BackgroundDoc | null> {
  const docRef = doc(db, COLLECTION_NAME, backgroundId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToBackground(docSnap.id, docSnap.data());
}

/**
 * Subscribe to backgrounds with real-time updates
 */
export function subscribeToBackgrounds(
  callback: (backgrounds: BackgroundDoc[]) => void,
  filters?: BackgroundFilters
): Unsubscribe {
  let q = query(collection(db, COLLECTION_NAME), orderBy('uploadedAt', 'desc'));

  // Apply filters
  if (filters?.active !== undefined) {
    q = query(q, where('active', '==', filters.active));
  }

  return onSnapshot(q, (snapshot) => {
    const backgrounds = snapshot.docs.map((doc) =>
      docToBackground(doc.id, doc.data())
    );
    callback(backgrounds);
  });
}

/**
 * Get active backgrounds as BackgroundOptions for UI
 * Filters by user's subscription tier
 */
export async function getBackgroundOptions(
  userTier: 'free' | 'premium' | 'enterprise' = 'free'
): Promise<BackgroundOption[]> {
  const backgrounds = await getBackgrounds({ active: true });

  // Filter by access level based on user tier
  const accessible = backgrounds.filter((bg) => {
    if (bg.accessLevel === 'free') return true;
    if (bg.accessLevel === 'premium') return userTier !== 'free';
    if (bg.accessLevel === 'restricted') return userTier === 'enterprise';
    return false;
  });

  return accessible.map(toBackgroundOption);
}

/**
 * Toggle background active status
 */
export async function toggleBackgroundActive(
  backgroundId: string,
  active: boolean
): Promise<void> {
  await updateBackground(backgroundId, { active });
}
