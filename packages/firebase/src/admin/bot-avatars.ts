/**
 * Bot Avatars Admin Service
 * Server-side functions using Firebase Admin SDK (bypasses security rules)
 */

import { storage, db } from './index';
import { FieldValue } from 'firebase-admin/firestore';
import type {
  BotAvatar,
  BotAvatarAnimationStyle,
  SubscriptionTier,
} from '@ainexsuite/types';

const BOT_AVATARS_COLLECTION = 'bot-avatars';
const STORAGE_BUCKET = 'alnexsuite.firebasestorage.app';

/**
 * Generate a UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Convert base64 data URL to Buffer
 */
function base64ToBuffer(dataURL: string): { buffer: Buffer; mimeType: string } {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const buffer = Buffer.from(parts[1], 'base64');
  return { buffer, mimeType };
}

/**
 * Check if a string is a URL
 */
function isURL(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://');
}

/**
 * Fetch file from URL and return as Buffer
 */
async function fetchAsBuffer(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const mimeType = response.headers.get('content-type') || 'application/octet-stream';
  return { buffer: Buffer.from(arrayBuffer), mimeType };
}

export interface AdminBotAvatarUploadResult {
  success: boolean;
  avatar?: BotAvatar;
  error?: string;
}

/**
 * Upload a new bot avatar using Admin SDK (server-side)
 */
export async function uploadBotAvatarAdmin(
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
): Promise<AdminBotAvatarUploadResult> {
  try {
    const avatarId = generateUUID();
    const basePath = `bot-avatars/${avatarId}`;
    const bucket = storage.bucket(STORAGE_BUCKET);

    // Process source image
    const sourceIsURL = isURL(sourceImageData);
    const { buffer: sourceBuffer, mimeType: sourceMime } = sourceIsURL
      ? await fetchAsBuffer(sourceImageData)
      : base64ToBuffer(sourceImageData);
    const sourceExt = sourceMime.includes('png') ? 'png' : 'jpg';
    const sourceImagePath = `${basePath}/source.${sourceExt}`;

    // Upload source image
    const sourceFile = bucket.file(sourceImagePath);
    await sourceFile.save(sourceBuffer, {
      contentType: sourceMime,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    await sourceFile.makePublic();
    const sourceImageURL = `https://storage.googleapis.com/${STORAGE_BUCKET}/${sourceImagePath}`;

    // Process video
    const videoIsURL = isURL(videoData);
    const { buffer: videoBuffer, mimeType: videoMime } = videoIsURL
      ? await fetchAsBuffer(videoData)
      : base64ToBuffer(videoData);
    const videoFormat = videoMime.includes('webm') ? 'webm' : 'mp4';
    const videoPath = `${basePath}/video.${videoFormat}`;

    // Upload video
    const videoFile = bucket.file(videoPath);
    await videoFile.save(videoBuffer, {
      contentType: videoMime,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    await videoFile.makePublic();
    const videoURL = `https://storage.googleapis.com/${STORAGE_BUCKET}/${videoPath}`;

    // If setting as default, unset other defaults first
    if (metadata.isDefault) {
      const defaultsQuery = await db
        .collection(BOT_AVATARS_COLLECTION)
        .where('isDefault', '==', true)
        .get();

      const batch = db.batch();
      defaultsQuery.docs.forEach((doc) => {
        batch.update(doc.ref, { isDefault: false, updatedAt: FieldValue.serverTimestamp() });
      });
      if (!defaultsQuery.empty) {
        await batch.commit();
      }
    }

    // Create Firestore document
    const avatarData = {
      name: metadata.name,
      description: metadata.description || null,
      sourceImageURL,
      sourceImagePath,
      videoURL,
      videoPath,
      fileSize: videoBuffer.length,
      animationStyle: metadata.animationStyle,
      generationPrompt: metadata.generationPrompt || null,
      isDefault: metadata.isDefault || false,
      availableTiers: metadata.availableTiers,
      uploadedBy,
      uploadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      active: true,
      provider: 'fal.ai',
      model: 'kling-1.6',
    };

    const docRef = await db.collection(BOT_AVATARS_COLLECTION).add(avatarData);

    const now = Date.now();
    return {
      success: true,
      avatar: {
        id: docRef.id,
        name: metadata.name,
        description: metadata.description,
        sourceImageURL,
        sourceImagePath,
        videoURL,
        videoPath,
        fileSize: videoBuffer.length,
        animationStyle: metadata.animationStyle,
        generationPrompt: metadata.generationPrompt,
        isDefault: metadata.isDefault || false,
        availableTiers: metadata.availableTiers,
        uploadedBy,
        uploadedAt: now,
        updatedAt: now,
        active: true,
        provider: 'fal.ai',
        model: 'kling-1.6',
      } as BotAvatar,
    };
  } catch (error) {
    console.error('Failed to upload bot avatar (admin):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a bot avatar using Admin SDK (server-side)
 */
export async function deleteBotAvatarAdmin(avatarId: string): Promise<boolean> {
  try {
    const docRef = db.collection(BOT_AVATARS_COLLECTION).doc(avatarId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    const data = doc.data();
    const bucket = storage.bucket(STORAGE_BUCKET);

    // Delete storage files
    try {
      if (data?.sourceImagePath) {
        await bucket.file(data.sourceImagePath).delete();
      }
      if (data?.videoPath) {
        await bucket.file(data.videoPath).delete();
      }
      if (data?.posterPath) {
        await bucket.file(data.posterPath).delete();
      }
    } catch (storageError) {
      console.warn('Some storage files may not have been deleted:', storageError);
    }

    // Delete Firestore document
    await docRef.delete();
    return true;
  } catch (error) {
    console.error('Failed to delete bot avatar (admin):', error);
    return false;
  }
}
