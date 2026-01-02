/**
 * Covers service for managing journal cover images
 * Used by admin app for CRUD and journal app for fetching
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
  CoverDoc,
  CoverCreateInput,
  CoverUpdateInput,
  CoverFilters,
  CoverOption,
  CoverGenerationMeta,
} from '@ainexsuite/types';

const COLLECTION_NAME = 'covers';

/**
 * Generate a UUID with fallback for non-secure contexts (HTTP on local network)
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Convert Firestore document to CoverDoc
 */
function docToCover(id: string, data: Record<string, unknown>): CoverDoc {
  return {
    id,
    name: data.name as string,
    category: data.category as CoverDoc['category'],
    storagePath: data.storagePath as string,
    downloadURL: data.downloadURL as string,
    thumbnailURL: data.thumbnailURL as string,
    accessLevel: data.accessLevel as CoverDoc['accessLevel'],
    tags: (data.tags as string[]) || [],
    sourceType: data.sourceType as CoverDoc['sourceType'],
    generationMeta: data.generationMeta as CoverGenerationMeta | undefined,
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
 * Convert CoverDoc to simplified CoverOption for UI
 */
export function toCoverOption(cover: CoverDoc): CoverOption {
  return {
    id: cover.id,
    name: cover.name,
    thumbnail: cover.thumbnailURL || cover.downloadURL,
    fullImage: cover.downloadURL,
    category: cover.category,
  };
}

/**
 * Upload a new cover image with thumbnail
 */
export async function uploadCover(
  file: Blob,
  thumbnailBlob: Blob,
  metadata: CoverCreateInput,
  uploadedBy: string
): Promise<CoverDoc> {
  const coverId = generateUUID();
  const basePath = `covers/${coverId}`;

  // Upload original
  const originalPath = `${basePath}/original.png`;
  const originalRef = ref(storage, originalPath);
  await uploadBytes(originalRef, file, {
    contentType: 'image/png',
    customMetadata: {
      category: metadata.category,
      sourceType: metadata.sourceType,
    },
  });
  const downloadURL = await getDownloadURL(originalRef);

  // Upload thumbnail
  const thumbnailPath = `${basePath}/thumbnail.png`;
  const thumbnailRef = ref(storage, thumbnailPath);
  await uploadBytes(thumbnailRef, thumbnailBlob, {
    contentType: 'image/png',
  });
  const thumbnailURL = await getDownloadURL(thumbnailRef);

  // Create Firestore document
  const coverDoc = {
    name: metadata.name,
    category: metadata.category,
    storagePath: originalPath,
    downloadURL,
    thumbnailURL,
    accessLevel: metadata.accessLevel,
    tags: metadata.tags,
    sourceType: metadata.sourceType,
    generationMeta: metadata.generationMeta || null,
    uploadedBy,
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    active: true,
  };

  await setDoc(doc(db, COLLECTION_NAME, coverId), coverDoc);

  return {
    id: coverId,
    ...coverDoc,
    uploadedAt: new Date(),
    updatedAt: new Date(),
    active: true,
  } as CoverDoc;
}

/**
 * Update cover metadata
 */
export async function updateCover(
  coverId: string,
  updates: CoverUpdateInput
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, coverId);

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a cover (removes from both Storage and Firestore)
 */
export async function deleteCover(coverId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, coverId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Cover not found');
  }

  const basePath = `covers/${coverId}`;

  // Delete original
  try {
    await deleteObject(ref(storage, `${basePath}/original.png`));
  } catch (error) {
    console.warn('Failed to delete original cover:', error);
  }

  // Delete thumbnail
  try {
    await deleteObject(ref(storage, `${basePath}/thumbnail.png`));
  } catch (error) {
    console.warn('Failed to delete thumbnail:', error);
  }

  // Delete from Firestore
  await deleteDoc(docRef);
}

/**
 * Get all covers with optional filters
 */
export async function getCovers(
  filters?: CoverFilters
): Promise<CoverDoc[]> {
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

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToCover(doc.id, doc.data()));
}

/**
 * Get a single cover by ID
 */
export async function getCoverById(
  coverId: string
): Promise<CoverDoc | null> {
  const docRef = doc(db, COLLECTION_NAME, coverId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToCover(docSnap.id, docSnap.data());
}

/**
 * Subscribe to covers with real-time updates
 */
export function subscribeToCovers(
  callback: (covers: CoverDoc[]) => void,
  filters?: CoverFilters
): Unsubscribe {
  let q = query(collection(db, COLLECTION_NAME), orderBy('uploadedAt', 'desc'));

  // Apply filters
  if (filters?.active !== undefined) {
    q = query(q, where('active', '==', filters.active));
  }

  return onSnapshot(q, (snapshot) => {
    const covers = snapshot.docs.map((doc) =>
      docToCover(doc.id, doc.data())
    );
    callback(covers);
  });
}

/**
 * Get active covers as CoverOptions for UI
 * Filters by user's subscription tier
 */
export async function getCoverOptions(
  userTier?: 'free' | 'premium'
): Promise<CoverOption[]> {
  // Get all covers (filter active client-side to avoid index requirement)
  const covers = await getCovers();
  const activeCovers = covers.filter(c => c.active !== false);

  // If no tier specified, return all active covers
  if (!userTier) {
    return activeCovers.map(toCoverOption);
  }

  // Filter by access level based on user tier
  const accessible = activeCovers.filter((cover) => {
    if (cover.accessLevel === 'free') return true;
    if (cover.accessLevel === 'premium') return userTier === 'premium';
    return false;
  });

  return accessible.map(toCoverOption);
}

/**
 * Toggle cover active status
 */
export async function toggleCoverActive(
  coverId: string,
  active: boolean
): Promise<void> {
  await updateCover(coverId, { active });
}
