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
  BackgroundVariant,
  BackgroundGenerationMeta,
  BackgroundDocWithVariants,
  BackgroundSourceType,
  VariantResolution,
  VariantAspectRatio,
} from '@ainexsuite/types';

const COLLECTION_NAME = 'backgrounds';

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
  const backgroundId = generateUUID();
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
  userTier?: 'free' | 'premium' | 'enterprise'
): Promise<BackgroundOption[]> {
  // Get all backgrounds (filter active client-side to avoid index requirement)
  const backgrounds = await getBackgrounds();
  const activeBackgrounds = backgrounds.filter(bg => bg.active !== false);

  // If no tier specified, return all active backgrounds
  if (!userTier) {
    return activeBackgrounds.map(toBackgroundOption);
  }

  // Filter by access level based on user tier
  const accessible = activeBackgrounds.filter((bg) => {
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

// ============================================
// Variant Upload Functions (AI Generation)
// ============================================

export interface VariantUpload {
  key: string;
  blob: Blob;
  width: number;
  height: number;
}

export interface GeneratedBackgroundInput extends BackgroundCreateInput {
  generationMeta?: BackgroundGenerationMeta;
  sourceType: BackgroundSourceType;
}

/**
 * Upload an AI-generated or uploaded background with responsive variants
 */
export async function uploadBackgroundWithVariants(
  originalBlob: Blob,
  variants: VariantUpload[],
  metadata: GeneratedBackgroundInput,
  uploadedBy: string
): Promise<BackgroundDocWithVariants> {
  const backgroundId = generateUUID();
  const basePath = `backgrounds/${backgroundId}`;

  // 1. Upload original image
  const originalPath = `${basePath}/original.jpg`;
  const originalRef = ref(storage, originalPath);
  await uploadBytes(originalRef, originalBlob, {
    contentType: 'image/jpeg',
    customMetadata: {
      brightness: metadata.brightness,
      sourceType: metadata.sourceType,
    },
  });
  const originalURL = await getDownloadURL(originalRef);

  // 2. Upload all variants
  const uploadedVariants: BackgroundVariant[] = [];

  for (const variant of variants) {
    const variantPath = `${basePath}/variants/${variant.key}.jpg`;
    const variantRef = ref(storage, variantPath);

    await uploadBytes(variantRef, variant.blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        variantKey: variant.key,
        width: String(variant.width),
        height: String(variant.height),
      },
    });

    const variantURL = await getDownloadURL(variantRef);

    // Parse resolution and aspect ratio from key (e.g., "mobile-16:9")
    const [resolution, aspectRatio] = variant.key.split('-') as [
      VariantResolution,
      VariantAspectRatio,
    ];

    uploadedVariants.push({
      resolution,
      aspectRatio,
      width: variant.width,
      height: variant.height,
      storagePath: variantPath,
      downloadURL: variantURL,
    });
  }

  // 3. Create Firestore document with variants
  const backgroundDoc = {
    name: metadata.name,
    brightness: metadata.brightness,
    storagePath: originalPath,
    downloadURL: originalURL,
    accessLevel: metadata.accessLevel,
    tags: metadata.tags,
    category: metadata.category,
    seasonal: metadata.seasonal || null,
    uploadedBy,
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    active: true,
    sourceType: metadata.sourceType,
    generationMeta: metadata.generationMeta
      ? {
          ...metadata.generationMeta,
          baseImagePath: originalPath,
          generatedAt: metadata.generationMeta.generatedAt,
        }
      : null,
    variants: uploadedVariants,
  };

  await setDoc(doc(db, COLLECTION_NAME, backgroundId), backgroundDoc);

  return {
    id: backgroundId,
    ...backgroundDoc,
    uploadedAt: new Date(),
    updatedAt: new Date(),
  } as BackgroundDocWithVariants;
}

/**
 * Delete a background with all its variants
 */
export async function deleteBackgroundWithVariants(
  backgroundId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, backgroundId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Background not found');
  }

  const data = docSnap.data();

  // Delete original file
  if (data.storagePath) {
    try {
      await deleteObject(ref(storage, data.storagePath as string));
    } catch (error) {
      console.warn('Failed to delete original:', error);
    }
  }

  // Delete all variants
  if (data.variants && Array.isArray(data.variants)) {
    for (const variant of data.variants as BackgroundVariant[]) {
      try {
        await deleteObject(ref(storage, variant.storagePath));
      } catch (error) {
        console.warn('Failed to delete variant:', variant.storagePath, error);
      }
    }
  }

  // Delete Firestore document
  await deleteDoc(docRef);
}

/**
 * Get variant URL for a specific resolution and aspect ratio
 */
export function getVariantURL(
  background: BackgroundDocWithVariants,
  resolution: VariantResolution,
  aspectRatio: VariantAspectRatio
): string | null {
  if (!background.variants) {
    return background.downloadURL;
  }

  const variant = background.variants.find(
    (v) => v.resolution === resolution && v.aspectRatio === aspectRatio
  );

  return variant?.downloadURL || background.downloadURL;
}

/**
 * Get the best variant URL based on viewport dimensions
 */
export function getBestVariantURL(
  background: BackgroundDocWithVariants,
  viewportWidth: number,
  viewportHeight: number
): string {
  if (!background.variants || background.variants.length === 0) {
    return background.downloadURL;
  }

  // Determine resolution tier
  let resolution: VariantResolution;
  if (viewportWidth <= 640) {
    resolution = 'mobile';
  } else if (viewportWidth <= 1024) {
    resolution = 'tablet';
  } else if (viewportWidth <= 1920) {
    resolution = 'desktop';
  } else {
    resolution = '4k';
  }

  // Determine aspect ratio (closest match)
  const viewportAspect = viewportWidth / viewportHeight;
  let aspectRatio: VariantAspectRatio;

  if (viewportAspect < 0.75) {
    aspectRatio = '9:16'; // Portrait
  } else if (viewportAspect < 1.15) {
    aspectRatio = '1:1'; // Square-ish
  } else if (viewportAspect < 1.5) {
    aspectRatio = '4:3'; // Standard
  } else {
    aspectRatio = '16:9'; // Wide
  }

  // Find matching variant
  const variant = background.variants.find(
    (v) => v.resolution === resolution && v.aspectRatio === aspectRatio
  );

  if (variant) {
    return variant.downloadURL;
  }

  // Fallback: find any variant with matching resolution
  const resolutionMatch = background.variants.find(
    (v) => v.resolution === resolution
  );
  if (resolutionMatch) {
    return resolutionMatch.downloadURL;
  }

  // Final fallback: original
  return background.downloadURL;
}
