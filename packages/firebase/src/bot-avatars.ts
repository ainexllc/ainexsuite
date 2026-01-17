/**
 * Bot Avatars service for managing AI assistant animated avatars
 * Handles upload, retrieval, and management of animated bot avatars for chat interfaces
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, storage } from './client';
import type {
  BotAvatar,
  BotAvatarUpdateInput,
  BotAvatarAnimationStyle,
} from '@ainexsuite/types';
import type { SubscriptionTier } from '@ainexsuite/types';

const BOT_AVATARS_COLLECTION = 'bot-avatars';
const BOT_AVATARS_STORAGE_PATH = 'bot-avatars';

/**
 * Generate a UUID with fallback for non-secure contexts
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
 * Convert base64 data URL to Blob
 */
function base64ToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'video/webm';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Check if a string is a URL
 */
function isURL(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://');
}

/**
 * Fetch file from URL and return as Blob
 */
async function fetchAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  return response.blob();
}

export interface BotAvatarUploadResult {
  success: boolean;
  avatar?: BotAvatar;
  error?: string;
}

/**
 * Upload a new bot avatar with source image and animated video
 */
export async function uploadBotAvatar(
  sourceImageData: string,
  videoData: string,
  metadata: {
    name: string;
    description?: string;
    animationStyle: BotAvatarAnimationStyle;
    availableTiers: SubscriptionTier[];
    isDefault?: boolean;
    generationPrompt?: string;
  },
  uploadedBy: string
): Promise<BotAvatarUploadResult> {
  try {
    const avatarId = generateUUID();
    const basePath = `${BOT_AVATARS_STORAGE_PATH}/${avatarId}`;

    // Determine source image format
    const sourceIsURL = isURL(sourceImageData);
    const sourceBlob = sourceIsURL
      ? await fetchAsBlob(sourceImageData)
      : base64ToBlob(sourceImageData);
    const sourceExt = sourceBlob.type.includes('png') ? 'png' : 'jpg';
    const sourceImagePath = `${basePath}/source.${sourceExt}`;

    // Upload source image
    const sourceRef = ref(storage, sourceImagePath);
    await uploadBytes(sourceRef, sourceBlob, {
      contentType: sourceBlob.type,
      cacheControl: 'public, max-age=31536000',
    });
    const sourceImageURL = await getDownloadURL(sourceRef);

    // Determine video format
    const videoIsURL = isURL(videoData);
    const videoBlob = videoIsURL
      ? await fetchAsBlob(videoData)
      : base64ToBlob(videoData);
    const videoFormat = videoBlob.type.includes('webm') ? 'webm' : 'mp4';
    const videoPath = `${basePath}/video.${videoFormat}`;

    // Upload video
    const videoRef = ref(storage, videoPath);
    await uploadBytes(videoRef, videoBlob, {
      contentType: videoBlob.type,
      cacheControl: 'public, max-age=31536000',
    });
    const videoURL = await getDownloadURL(videoRef);

    // If setting as default, unset other defaults first
    if (metadata.isDefault) {
      await unsetAllDefaults();
    }

    // Create Firestore document
    const avatarData = {
      name: metadata.name,
      description: metadata.description,
      sourceImageURL,
      sourceImagePath,
      videoURL,
      videoPath,
      fileSize: videoBlob.size,
      animationStyle: metadata.animationStyle,
      generationPrompt: metadata.generationPrompt,
      isDefault: metadata.isDefault || false,
      availableTiers: metadata.availableTiers,
      uploadedBy,
      uploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true,
      provider: 'fal.ai' as const,
      model: 'kling-1.6',
    };

    const docRef = await addDoc(collection(db, BOT_AVATARS_COLLECTION), avatarData);

    // Return with current timestamp as placeholder (Firestore will set actual value)
    const now = Date.now();
    return {
      success: true,
      avatar: {
        id: docRef.id,
        ...avatarData,
        uploadedAt: now,
        updatedAt: now,
      } as BotAvatar,
    };
  } catch (error) {
    console.error('Failed to upload bot avatar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get all bot avatars
 */
export async function getBotAvatars(): Promise<BotAvatar[]> {
  try {
    const q = query(
      collection(db, BOT_AVATARS_COLLECTION),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BotAvatar[];
  } catch (error) {
    console.error('Failed to get bot avatars:', error);
    return [];
  }
}

/**
 * Get only active bot avatars
 */
export async function getActiveBotAvatars(): Promise<BotAvatar[]> {
  try {
    const q = query(
      collection(db, BOT_AVATARS_COLLECTION),
      where('active', '==', true),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BotAvatar[];
  } catch (error) {
    console.error('Failed to get active bot avatars:', error);
    return [];
  }
}

/**
 * Get a single bot avatar by ID
 */
export async function getBotAvatarById(avatarId: string): Promise<BotAvatar | null> {
  try {
    const docRef = doc(db, BOT_AVATARS_COLLECTION, avatarId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as BotAvatar;
  } catch (error) {
    console.error('Failed to get bot avatar:', error);
    return null;
  }
}

/**
 * Get the default bot avatar
 */
export async function getDefaultBotAvatar(): Promise<BotAvatar | null> {
  try {
    const q = query(
      collection(db, BOT_AVATARS_COLLECTION),
      where('isDefault', '==', true),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Fallback: get any active avatar
      const activeAvatars = await getActiveBotAvatars();
      return activeAvatars[0] || null;
    }
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as BotAvatar;
  } catch (error) {
    console.error('Failed to get default bot avatar:', error);
    return null;
  }
}

/**
 * Get bot avatars available for a specific subscription tier
 */
export async function getBotAvatarsForTier(tier: SubscriptionTier): Promise<BotAvatar[]> {
  try {
    const q = query(
      collection(db, BOT_AVATARS_COLLECTION),
      where('active', '==', true),
      where('availableTiers', 'array-contains', tier),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BotAvatar[];
  } catch (error) {
    console.error('Failed to get bot avatars for tier:', error);
    return [];
  }
}

/**
 * Subscribe to bot avatars (real-time updates)
 */
export function subscribeToBotAvatars(
  callback: (avatars: BotAvatar[]) => void,
  activeOnly = false
): Unsubscribe {
  const q = activeOnly
    ? query(
        collection(db, BOT_AVATARS_COLLECTION),
        where('active', '==', true),
        orderBy('uploadedAt', 'desc')
      )
    : query(collection(db, BOT_AVATARS_COLLECTION), orderBy('uploadedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const avatars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BotAvatar[];
    callback(avatars);
  });
}

/**
 * Unset all default flags (internal helper)
 */
async function unsetAllDefaults(): Promise<void> {
  const q = query(
    collection(db, BOT_AVATARS_COLLECTION),
    where('isDefault', '==', true)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isDefault: false, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

/**
 * Set a bot avatar as the default
 */
export async function setDefaultBotAvatar(avatarId: string): Promise<boolean> {
  try {
    // First, unset all other defaults
    await unsetAllDefaults();

    // Then set the new default
    const docRef = doc(db, BOT_AVATARS_COLLECTION, avatarId);
    await updateDoc(docRef, {
      isDefault: true,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to set default bot avatar:', error);
    return false;
  }
}

/**
 * Toggle bot avatar active status
 */
export async function toggleBotAvatarActive(
  avatarId: string,
  active: boolean
): Promise<boolean> {
  try {
    const docRef = doc(db, BOT_AVATARS_COLLECTION, avatarId);
    await updateDoc(docRef, {
      active,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to toggle bot avatar active status:', error);
    return false;
  }
}

/**
 * Update bot avatar metadata
 */
export async function updateBotAvatar(
  avatarId: string,
  updates: BotAvatarUpdateInput
): Promise<boolean> {
  try {
    // If setting as default, unset others first
    if (updates.isDefault) {
      await unsetAllDefaults();
    }

    const docRef = doc(db, BOT_AVATARS_COLLECTION, avatarId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update bot avatar:', error);
    return false;
  }
}

/**
 * Delete a bot avatar and its storage files
 */
export async function deleteBotAvatar(avatarId: string): Promise<boolean> {
  try {
    // Get the avatar to find storage paths
    const avatar = await getBotAvatarById(avatarId);
    if (!avatar) {
      return false;
    }

    // Delete storage files
    try {
      if (avatar.sourceImagePath) {
        await deleteObject(ref(storage, avatar.sourceImagePath));
      }
      if (avatar.videoPath) {
        await deleteObject(ref(storage, avatar.videoPath));
      }
      if (avatar.posterPath) {
        await deleteObject(ref(storage, avatar.posterPath));
      }
    } catch (storageError) {
      console.warn('Some storage files may not have been deleted:', storageError);
    }

    // Delete Firestore document
    await deleteDoc(doc(db, BOT_AVATARS_COLLECTION, avatarId));
    return true;
  } catch (error) {
    console.error('Failed to delete bot avatar:', error);
    return false;
  }
}

/**
 * Update user's preferred bot avatar (for pro/premium users)
 */
export async function updateUserBotAvatarPreference(
  userId: string,
  botAvatarId: string | null
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      selectedBotAvatarId: botAvatarId,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update user bot avatar preference:', error);
    return false;
  }
}

/**
 * Get user's preferred bot avatar
 */
export async function getUserBotAvatarPreference(
  userId: string
): Promise<BotAvatar | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return getDefaultBotAvatar();
    }

    const userData = userSnapshot.data();
    const selectedId = userData?.selectedBotAvatarId;

    if (selectedId) {
      const avatar = await getBotAvatarById(selectedId);
      if (avatar && avatar.active) {
        return avatar;
      }
    }

    // Fallback to default
    return getDefaultBotAvatar();
  } catch (error) {
    console.error('Failed to get user bot avatar preference:', error);
    return getDefaultBotAvatar();
  }
}
