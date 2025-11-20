import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '@ainexsuite/firebase';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export interface UploadResult {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Validate file before upload
function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('File type not allowed');
  }
}

// Upload a file to Firebase Storage
export async function uploadFile(
  userId: string,
  entryId: string,
  file: File
): Promise<UploadResult> {
  // Validate file
  validateFile(file);

  // Generate unique file ID
  const fileId = uuidv4();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${fileId}.${fileExtension}`;
  const filePath = `users/${userId}/attachments/${entryId}/${fileName}`;

  // Create storage reference
  const storageRef = ref(storage, filePath);

  // Upload file
  const snapshot = await uploadBytes(storageRef, file);

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return {
    id: fileId,
    name: file.name,
    url: downloadURL,
    type: file.type,
    size: file.size
  };
}

// Upload multiple files
export async function uploadMultipleFiles(
  userId: string,
  entryId: string,
  files: File[]
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadFile(userId, entryId, file));
  return await Promise.all(uploadPromises);
}

// Delete a file from Firebase Storage
export async function deleteFile(
  userId: string,
  entryId: string,
  fileName: string
): Promise<void> {
  const filePath = `users/${userId}/attachments/${entryId}/${fileName}`;
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
}

// Delete all files for a journal entry
export async function deleteAllEntryFiles(
  userId: string,
  entryId: string
): Promise<void> {
  const directoryPath = `users/${userId}/attachments/${entryId}`;
  const directoryRef = ref(storage, directoryPath);

  // List all files in the directory
  const result = await listAll(directoryRef);

  // Delete each file
  const deletePromises = result.items.map(item => deleteObject(item));
  await Promise.all(deletePromises);
}

// Get the storage path for a user's attachments
export function getUserStoragePath(userId: string): string {
  return `users/${userId}/attachments`;
}

// Check if a file exists
export async function fileExists(
  userId: string,
  entryId: string,
  fileName: string
): Promise<boolean> {
  try {
    const filePath = `users/${userId}/attachments/${entryId}/${fileName}`;
    const storageRef = ref(storage, filePath);
    await getDownloadURL(storageRef);
    return true;
  } catch (error) {
    return false;
  }
}
