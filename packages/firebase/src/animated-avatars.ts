/**
 * Animated Avatars service for managing user-generated animated profile videos
 * Handles upload, retrieval, and deletion of Veo-generated animated avatars
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db, storage } from './client';

const ANIMATED_AVATARS_PATH = 'animated-avatars';

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

export interface AnimatedAvatar {
  videoURL: string;
  videoPath: string;
  posterURL?: string;
  posterPath?: string;
  duration?: number;
  fileSize?: number;
  createdAt: number;
  action?: string;
}

export interface AnimatedAvatarUploadResult {
  success: boolean;
  videoURL?: string;
  videoPath?: string;
  posterURL?: string;
  posterPath?: string;
  error?: string;
}

/**
 * Convert base64 data URL to Blob
 */
function base64ToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'video/mp4';
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
 * Fetch video from URL and return as Blob
 */
async function fetchVideoAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.status}`);
  }
  return response.blob();
}

/**
 * Upload an animated avatar video for a user
 * @param userId - The user's UID
 * @param videoData - Base64 data URL of the video (e.g., "data:video/mp4;base64,...")
 * @param posterData - Optional base64 data URL of the poster image
 * @param style - Optional animation style used to generate the video
 * @returns Upload result with download URLs
 */
export async function uploadAnimatedAvatar(
  userId: string,
  videoData: string,
  posterData?: string,
  style?: string
): Promise<AnimatedAvatarUploadResult> {
  try {
    // Generate a unique filename to prevent caching issues
    const videoId = generateUUID();
    const videoPath = `${ANIMATED_AVATARS_PATH}/${userId}/${videoId}.mp4`;
    const videoRef = ref(storage, videoPath);

    // Convert to Blob - handle both URLs and base64 data
    const videoBlob = isURL(videoData)
      ? await fetchVideoAsBlob(videoData)
      : base64ToBlob(videoData);

    // Upload the video
    await uploadBytes(videoRef, videoBlob, {
      contentType: 'video/mp4',
      customMetadata: {
        userId,
        style: style || 'default',
        generatedAt: new Date().toISOString(),
      },
    });

    // Get the download URL
    const videoURL = await getDownloadURL(videoRef);

    const result: AnimatedAvatarUploadResult = {
      success: true,
      videoURL,
      videoPath,
    };

    // Upload poster image if provided
    if (posterData) {
      try {
        const posterPath = `${ANIMATED_AVATARS_PATH}/${userId}/${videoId}-poster.jpg`;
        const posterRef = ref(storage, posterPath);
        const posterBlob = base64ToBlob(posterData);

        await uploadBytes(posterRef, posterBlob, {
          contentType: 'image/jpeg',
          customMetadata: {
            userId,
            videoId,
          },
        });

        const posterURL = await getDownloadURL(posterRef);
        result.posterURL = posterURL;
        result.posterPath = posterPath;
      } catch (posterError) {
        // Poster upload failed, but video succeeded - continue
        console.warn('Failed to upload poster image:', posterError);
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to upload animated avatar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete an animated avatar video from storage
 * @param videoPath - The full storage path of the video
 * @param posterPath - Optional path to the poster image
 */
export async function deleteAnimatedAvatar(
  videoPath: string,
  posterPath?: string
): Promise<boolean> {
  try {
    const videoRef = ref(storage, videoPath);
    await deleteObject(videoRef);

    // Also delete poster if path provided
    if (posterPath) {
      try {
        const posterRef = ref(storage, posterPath);
        await deleteObject(posterRef);
      } catch {
        // Poster deletion failed, but that's okay
      }
    }

    return true;
  } catch (error) {
    console.warn('Failed to delete animated avatar:', error);
    return false;
  }
}

/**
 * Update the user's animated avatar info in Firestore
 * @param userId - The user's UID
 * @param animatedAvatarURL - The video URL
 * @param animatedAvatarPath - The storage path
 * @param posterURL - Optional poster image URL
 * @param posterPath - Optional poster storage path
 * @param action - Optional action used (wave, wink, etc.)
 */
export async function updateUserAnimatedAvatar(
  userId: string,
  animatedAvatarURL: string,
  animatedAvatarPath: string,
  posterURL?: string,
  posterPath?: string,
  action?: string
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);

    // Check if user document exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('User document not found:', userId);
      return false;
    }

    const updateData: Record<string, unknown> = {
      animatedAvatarURL,
      animatedAvatarPath,
      animatedAvatarUpdatedAt: new Date(),
      useAnimatedAvatar: true, // Enable by default when uploading
    };

    if (posterURL) {
      updateData.animatedAvatarPosterURL = posterURL;
    }
    if (posterPath) {
      updateData.animatedAvatarPosterPath = posterPath;
    }
    if (action) {
      updateData.animatedAvatarAction = action;
    }

    await updateDoc(userRef, updateData);
    return true;
  } catch (error) {
    console.error('Failed to update user animated avatar:', error);
    return false;
  }
}

/**
 * Get the user's current animated avatar info from Firestore
 */
export async function getUserAnimatedAvatar(userId: string): Promise<AnimatedAvatar | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    if (!data?.animatedAvatarURL) {
      return null;
    }

    return {
      videoURL: data.animatedAvatarURL,
      videoPath: data.animatedAvatarPath,
      posterURL: data.animatedAvatarPosterURL,
      posterPath: data.animatedAvatarPosterPath,
      duration: data.animatedAvatarDuration,
      fileSize: data.animatedAvatarFileSize,
      createdAt: data.animatedAvatarUpdatedAt?.toMillis?.() || Date.now(),
      action: data.animatedAvatarAction || data.animatedAvatarStyle, // backwards compat
    };
  } catch (error) {
    console.error('Failed to get user animated avatar:', error);
    return null;
  }
}

/**
 * Toggle whether to use animated avatar
 * @param userId - The user's UID
 * @param useAnimated - Whether to use the animated avatar
 */
export async function toggleAnimatedAvatar(
  userId: string,
  useAnimated: boolean
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      useAnimatedAvatar: useAnimated,
    });
    return true;
  } catch (error) {
    console.error('Failed to toggle animated avatar:', error);
    return false;
  }
}

/**
 * Remove the user's animated avatar completely
 * @param userId - The user's UID
 */
export async function removeAnimatedAvatar(userId: string): Promise<boolean> {
  try {
    // Get current animated avatar info
    const animatedAvatar = await getUserAnimatedAvatar(userId);

    // Delete from storage if exists
    if (animatedAvatar?.videoPath) {
      await deleteAnimatedAvatar(animatedAvatar.videoPath, animatedAvatar.posterPath);
    }

    // Clear the animated avatar fields in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      animatedAvatarURL: null,
      animatedAvatarPath: null,
      animatedAvatarPosterURL: null,
      animatedAvatarPosterPath: null,
      animatedAvatarAction: null,
      animatedAvatarStyle: null, // legacy field
      animatedAvatarUpdatedAt: null,
      useAnimatedAvatar: false,
    });

    return true;
  } catch (error) {
    console.error('Failed to remove animated avatar:', error);
    return false;
  }
}

/**
 * Upload and set a new animated avatar, cleaning up the old one
 * This is the main function to use for updating animated avatars
 */
export async function setAnimatedAvatar(
  userId: string,
  videoData: string,
  posterData?: string,
  style?: string
): Promise<AnimatedAvatarUploadResult> {
  try {
    // Get the old animated avatar info
    const oldAvatar = await getUserAnimatedAvatar(userId);

    // Upload the new video
    const uploadResult = await uploadAnimatedAvatar(userId, videoData, posterData, style);

    if (!uploadResult.success || !uploadResult.videoURL) {
      return uploadResult;
    }

    // Update the user's animated avatar info in Firestore
    const updated = await updateUserAnimatedAvatar(
      userId,
      uploadResult.videoURL,
      uploadResult.videoPath!,
      uploadResult.posterURL,
      uploadResult.posterPath,
      style
    );

    if (!updated) {
      // Rollback: delete the uploaded video
      if (uploadResult.videoPath) {
        await deleteAnimatedAvatar(uploadResult.videoPath, uploadResult.posterPath);
      }
      return {
        success: false,
        error: 'Failed to update user profile',
      };
    }

    // Clean up the old video (don't await, fire and forget)
    if (oldAvatar?.videoPath) {
      deleteAnimatedAvatar(oldAvatar.videoPath, oldAvatar.posterPath).catch(() => {
        // Ignore cleanup errors
      });
    }

    return uploadResult;
  } catch (error) {
    console.error('Failed to set animated avatar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set animated avatar',
    };
  }
}
