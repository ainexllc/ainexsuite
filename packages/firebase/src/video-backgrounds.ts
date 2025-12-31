/**
 * Video Backgrounds service for managing landing page video backgrounds
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
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { db, storage } from './client';

const COLLECTION_NAME = 'video-backgrounds';

/**
 * Video background document stored in Firestore
 */
export interface VideoBackgroundDoc {
  id: string;
  name: string;
  description?: string;
  storagePath: string;
  downloadURL: string;
  posterStoragePath?: string;
  posterURL?: string;
  /** File size in bytes */
  fileSize: number;
  /** Duration in seconds (if available) */
  duration?: number;
  /** Recommended overlay opacity for this video */
  recommendedOverlay?: number;
  /** Tags for organization */
  tags: string[];
  /** Which app this video is assigned to (optional) */
  assignedApp?: string;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
  active: boolean;
}

/**
 * Input for creating a new video background
 */
export interface VideoBackgroundCreateInput {
  name: string;
  description?: string;
  tags?: string[];
  recommendedOverlay?: number;
  assignedApp?: string;
}

/**
 * Input for updating a video background
 */
export interface VideoBackgroundUpdateInput {
  name?: string;
  description?: string;
  tags?: string[];
  recommendedOverlay?: number;
  assignedApp?: string;
  active?: boolean;
}

/**
 * Progress callback for upload
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Convert Firestore document to VideoBackgroundDoc
 */
function docToVideoBackground(
  id: string,
  data: Record<string, unknown>
): VideoBackgroundDoc {
  return {
    id,
    name: data.name as string,
    description: data.description as string | undefined,
    storagePath: data.storagePath as string,
    downloadURL: data.downloadURL as string,
    posterStoragePath: data.posterStoragePath as string | undefined,
    posterURL: data.posterURL as string | undefined,
    fileSize: data.fileSize as number,
    duration: data.duration as number | undefined,
    recommendedOverlay: data.recommendedOverlay as number | undefined,
    tags: (data.tags as string[]) || [],
    assignedApp: data.assignedApp as string | undefined,
    uploadedBy: data.uploadedBy as string,
    uploadedAt:
      data.uploadedAt instanceof Timestamp
        ? data.uploadedAt.toDate()
        : new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(),
    active: (data.active as boolean) ?? true,
  };
}

/**
 * Upload a new video background with progress tracking
 */
export async function uploadVideoBackground(
  videoFile: File,
  metadata: VideoBackgroundCreateInput,
  uploadedBy: string,
  onProgress?: UploadProgressCallback,
  posterFile?: File
): Promise<VideoBackgroundDoc> {
  const videoId = crypto.randomUUID();
  const extension = videoFile.name.split('.').pop() || 'mp4';
  const storagePath = `video-backgrounds/${videoId}.${extension}`;

  // Upload video to Storage with progress tracking
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, videoFile, {
    contentType: videoFile.type || 'video/mp4',
    customMetadata: {
      originalName: videoFile.name,
    },
  });

  // Track upload progress
  await new Promise<UploadTaskSnapshot>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      () => resolve(uploadTask.snapshot)
    );
  });

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);

  // Upload poster image if provided
  let posterStoragePath: string | undefined;
  let posterURL: string | undefined;

  if (posterFile) {
    const posterExtension = posterFile.name.split('.').pop() || 'jpg';
    posterStoragePath = `video-backgrounds/${videoId}-poster.${posterExtension}`;
    const posterRef = ref(storage, posterStoragePath);
    await uploadBytesResumable(posterRef, posterFile, {
      contentType: posterFile.type || 'image/jpeg',
    });
    posterURL = await getDownloadURL(posterRef);
  }

  // Create Firestore document
  const videoDoc = {
    name: metadata.name,
    description: metadata.description || null,
    storagePath,
    downloadURL,
    posterStoragePath: posterStoragePath || null,
    posterURL: posterURL || null,
    fileSize: videoFile.size,
    recommendedOverlay: metadata.recommendedOverlay ?? 0.4,
    tags: metadata.tags || [],
    assignedApp: metadata.assignedApp || null,
    uploadedBy,
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    active: true,
  };

  await setDoc(doc(db, COLLECTION_NAME, videoId), videoDoc);

  return {
    id: videoId,
    ...videoDoc,
    uploadedAt: new Date(),
    updatedAt: new Date(),
    active: true,
  } as VideoBackgroundDoc;
}

/**
 * Update video background metadata
 */
export async function updateVideoBackground(
  videoId: string,
  updates: VideoBackgroundUpdateInput
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, videoId);

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a video background (removes from both Storage and Firestore)
 */
export async function deleteVideoBackground(videoId: string): Promise<void> {
  // Get the document first to get the storage paths
  const docRef = doc(db, COLLECTION_NAME, videoId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Video background not found');
  }

  const data = docSnap.data();

  // Delete video from Storage
  if (data.storagePath) {
    try {
      const storageRef = ref(storage, data.storagePath as string);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn('Failed to delete video file:', error);
    }
  }

  // Delete poster from Storage
  if (data.posterStoragePath) {
    try {
      const posterRef = ref(storage, data.posterStoragePath as string);
      await deleteObject(posterRef);
    } catch (error) {
      console.warn('Failed to delete poster file:', error);
    }
  }

  // Delete from Firestore
  await deleteDoc(docRef);
}

/**
 * Get all video backgrounds
 */
export async function getVideoBackgrounds(): Promise<VideoBackgroundDoc[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('uploadedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToVideoBackground(doc.id, doc.data()));
}

/**
 * Get active video backgrounds only
 */
export async function getActiveVideoBackgrounds(): Promise<VideoBackgroundDoc[]> {
  const all = await getVideoBackgrounds();
  return all.filter((v) => v.active);
}

/**
 * Get a single video background by ID
 */
export async function getVideoBackgroundById(
  videoId: string
): Promise<VideoBackgroundDoc | null> {
  const docRef = doc(db, COLLECTION_NAME, videoId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToVideoBackground(docSnap.id, docSnap.data());
}

/**
 * Get video background by assigned app
 */
export async function getVideoBackgroundByApp(
  appName: string
): Promise<VideoBackgroundDoc | null> {
  const all = await getVideoBackgrounds();
  return all.find((v) => v.assignedApp === appName && v.active) || null;
}

/**
 * Subscribe to video backgrounds with real-time updates
 */
export function subscribeToVideoBackgrounds(
  callback: (videos: VideoBackgroundDoc[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('uploadedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const videos = snapshot.docs.map((doc) =>
      docToVideoBackground(doc.id, doc.data())
    );
    callback(videos);
  });
}

/**
 * Toggle video background active status
 */
export async function toggleVideoBackgroundActive(
  videoId: string,
  active: boolean
): Promise<void> {
  await updateVideoBackground(videoId, { active });
}

/**
 * Assign video to an app
 */
export async function assignVideoToApp(
  videoId: string,
  appName: string | null
): Promise<void> {
  await updateVideoBackground(videoId, { assignedApp: appName || undefined });
}

/**
 * Upload poster image for an existing video
 */
export async function uploadVideoPoster(
  videoId: string,
  posterFile: File
): Promise<string> {
  const docRef = doc(db, COLLECTION_NAME, videoId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Video background not found');
  }

  const data = docSnap.data();

  // Delete old poster if exists
  if (data.posterStoragePath) {
    try {
      const oldPosterRef = ref(storage, data.posterStoragePath as string);
      await deleteObject(oldPosterRef);
    } catch (error) {
      console.warn('Failed to delete old poster:', error);
    }
  }

  // Upload new poster
  const posterExtension = posterFile.name.split('.').pop() || 'jpg';
  const posterStoragePath = `video-backgrounds/${videoId}-poster.${posterExtension}`;
  const posterRef = ref(storage, posterStoragePath);
  await uploadBytesResumable(posterRef, posterFile, {
    contentType: posterFile.type || 'image/jpeg',
  });
  const posterURL = await getDownloadURL(posterRef);

  // Update Firestore
  await updateDoc(docRef, {
    posterStoragePath,
    posterURL,
    updatedAt: serverTimestamp(),
  });

  return posterURL;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
