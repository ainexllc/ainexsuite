/**
 * Profile Images service for managing user-generated profile avatars
 * Handles upload, retrieval, and deletion of AI-generated profile images
 */

import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, storage } from './client';

const PROFILE_IMAGES_PATH = 'profile-images';
const MEMBER_AVATARS_PATH = 'member-avatars';

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

export interface ProfileImageUploadResult {
  success: boolean;
  downloadURL?: string;
  storagePath?: string;
  error?: string;
}

/**
 * Upload a profile image for a user
 * @param userId - The user's UID
 * @param imageData - Base64 data URL of the image (e.g., "data:image/png;base64,...")
 * @returns Upload result with download URL
 */
export async function uploadProfileImage(
  userId: string,
  imageData: string
): Promise<ProfileImageUploadResult> {
  try {
    // Generate a unique filename to prevent caching issues
    const imageId = generateUUID();
    const storagePath = `${PROFILE_IMAGES_PATH}/${userId}/${imageId}.jpg`;
    const storageRef = ref(storage, storagePath);

    // Upload the base64 data URL
    await uploadString(storageRef, imageData, 'data_url', {
      contentType: 'image/jpeg',
      customMetadata: {
        userId,
        generatedAt: new Date().toISOString(),
      },
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      downloadURL,
      storagePath,
    };
  } catch (error) {
    console.error('Failed to upload profile image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a profile image from storage
 * @param storagePath - The full storage path of the image
 */
export async function deleteProfileImage(storagePath: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.warn('Failed to delete profile image:', error);
    return false;
  }
}

/**
 * Update the user's profile photo URL in Firestore
 * @param userId - The user's UID
 * @param photoURL - The new photo URL
 * @param storagePath - Optional storage path for the custom image
 */
export async function updateUserPhotoURL(
  userId: string,
  photoURL: string,
  storagePath?: string
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
      customPhotoURL: photoURL,
      customPhotoUpdatedAt: new Date(),
    };

    // Store the storage path so we can delete old images
    if (storagePath) {
      updateData.customPhotoPath = storagePath;
    }

    await updateDoc(userRef, updateData);
    return true;
  } catch (error) {
    console.error('Failed to update user photo URL:', error);
    return false;
  }
}

/**
 * Get the user's current custom profile image path from Firestore
 * Used to delete old images when updating
 */
export async function getUserCustomPhotoPath(userId: string): Promise<string | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return data?.customPhotoPath as string | null;
  } catch (error) {
    console.error('Failed to get user custom photo path:', error);
    return null;
  }
}

/**
 * Remove the user's custom profile image and revert to default
 * @param userId - The user's UID
 */
export async function removeCustomProfileImage(userId: string): Promise<boolean> {
  try {
    // Get the current custom photo path
    const storagePath = await getUserCustomPhotoPath(userId);

    // Delete from storage if exists
    if (storagePath) {
      await deleteProfileImage(storagePath);
    }

    // Clear the custom photo fields in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      customPhotoURL: null,
      customPhotoPath: null,
      customPhotoUpdatedAt: null,
    });

    return true;
  } catch (error) {
    console.error('Failed to remove custom profile image:', error);
    return false;
  }
}

/**
 * Upload and set a new profile image, cleaning up the old one
 * This is the main function to use for updating profile images
 */
export async function setProfileImage(
  userId: string,
  imageData: string
): Promise<ProfileImageUploadResult> {
  try {
    // Get the old custom photo path
    const oldPath = await getUserCustomPhotoPath(userId);

    // Upload the new image
    const uploadResult = await uploadProfileImage(userId, imageData);

    if (!uploadResult.success || !uploadResult.downloadURL) {
      return uploadResult;
    }

    // Update the user's photo URL in Firestore
    const updated = await updateUserPhotoURL(
      userId,
      uploadResult.downloadURL,
      uploadResult.storagePath
    );

    if (!updated) {
      // Rollback: delete the uploaded image
      if (uploadResult.storagePath) {
        await deleteProfileImage(uploadResult.storagePath);
      }
      return {
        success: false,
        error: 'Failed to update user profile',
      };
    }

    // Clean up the old image (don't await, fire and forget)
    if (oldPath) {
      deleteProfileImage(oldPath).catch(() => {
        // Ignore cleanup errors
      });
    }

    // Sync the new photoURL to all spaces the user belongs to (fire and forget)
    syncUserPhotoToSpaces(userId, uploadResult.downloadURL!).catch(() => {
      // Ignore sync errors - non-critical
    });

    return uploadResult;
  } catch (error) {
    console.error('Failed to set profile image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set profile image',
    };
  }
}

/**
 * Upload an avatar for a space member (e.g., kids in a family space)
 * These members have synthetic UIDs and don't have real Firebase Auth accounts
 * @param spaceId - The space ID
 * @param memberId - The member's synthetic UID
 * @param imageData - Base64 data URL of the image
 * @returns Upload result with download URL
 */
export async function uploadMemberAvatar(
  spaceId: string,
  memberId: string,
  imageData: string
): Promise<ProfileImageUploadResult> {
  try {
    // Generate a unique filename to prevent caching issues
    const imageId = generateUUID();
    const storagePath = `${MEMBER_AVATARS_PATH}/${spaceId}/${memberId}/${imageId}.jpg`;
    const storageRef = ref(storage, storagePath);

    // Upload the base64 data URL
    await uploadString(storageRef, imageData, 'data_url', {
      contentType: 'image/jpeg',
      customMetadata: {
        spaceId,
        memberId,
        generatedAt: new Date().toISOString(),
      },
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      downloadURL,
      storagePath,
    };
  } catch (error) {
    console.error('Failed to upload member avatar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Space collections that may contain member arrays with photoURL
 * Add new collections here as needed
 */
const SPACE_COLLECTIONS = ['spaces', 'habitSpaces', 'noteSpaces', 'journalSpaces'];

interface SpaceMember {
  uid: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  joinedAt?: string;
  ageGroup?: string;
}

/**
 * Sync user's photoURL to all spaces they belong to.
 * This updates the member's photoURL in each space's members array.
 * @param userId - The user's UID
 * @param photoURL - The new photo URL (or null to remove)
 */
export async function syncUserPhotoToSpaces(
  userId: string,
  photoURL: string | null
): Promise<void> {
  try {
    // Query all space collections in parallel
    const updatePromises: Promise<void>[] = [];

    for (const collectionName of SPACE_COLLECTIONS) {
      const spacesRef = collection(db, collectionName);
      const q = query(spacesRef, where('memberUids', 'array-contains', userId));

      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const members = data.members as SpaceMember[] | undefined;

        if (!members || !Array.isArray(members)) continue;

        // Find and update the member
        const memberIndex = members.findIndex((m) => m.uid === userId);
        if (memberIndex === -1) continue;

        // Create updated members array
        const updatedMembers = [...members];
        updatedMembers[memberIndex] = {
          ...updatedMembers[memberIndex],
          photoURL: photoURL || undefined,
        };

        // Update the space document
        const spaceRef = doc(db, collectionName, docSnap.id);
        updatePromises.push(
          updateDoc(spaceRef, { members: updatedMembers })
        );
      }
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);
  } catch {
    // Sync failed - non-critical operation, fail silently
  }
}
