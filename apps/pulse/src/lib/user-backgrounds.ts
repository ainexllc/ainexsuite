import { storage } from '@ainexsuite/firebase';
import { ref, listAll, getDownloadURL, deleteObject, uploadBytes, getMetadata } from 'firebase/storage';

export interface UserBackground {
  url: string;
  name: string;
  fullPath: string;
  size?: number;
  contentType?: string;
  createdAt?: string;
}

export const UserBackgroundsService = {
  async getUserBackgrounds(userId: string): Promise<UserBackground[]> {
    if (!userId) return [];

    const backgroundsRef = ref(storage, `users/${userId}/backgrounds`);
    
    try {
      const result = await listAll(backgroundsRef);
      
      const backgrounds = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          let metadata;
          try {
            metadata = await getMetadata(itemRef);
          } catch (e) {
            console.warn('Failed to get metadata for', itemRef.fullPath);
          }

          return {
            url,
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            size: metadata?.size,
            contentType: metadata?.contentType,
            createdAt: metadata?.timeCreated,
          };
        })
      );

      // Sort by created time descending (newest first)
      return backgrounds.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

    } catch (error) {
      console.error('Error fetching user backgrounds:', error);
      return [];
    }
  },

  async uploadBackground(userId: string, file: Blob, filename?: string): Promise<string> {
    if (!userId) throw new Error('User ID required');

    const name = filename || `upload-${Date.now()}`;
    // Ensure png extension if not present and it's a blob/file with unknown name
    const finalName = name.includes('.') ? name : `${name}.png`; 

    const storageRef = ref(storage, `users/${userId}/backgrounds/${finalName}`);
    
    try {
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading background:', error);
      throw error;
    }
  },

  async deleteBackground(fullPath: string): Promise<void> {
    const storageRef = ref(storage, fullPath);
    try {
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting background:', error);
      throw error;
    }
  },
  
  async getStorageUsage(userId: string): Promise<{ totalBytes: number; count: number }> {
      if (!userId) return { totalBytes: 0, count: 0 };
      
      const backgroundsRef = ref(storage, `users/${userId}/backgrounds`);
      try {
          const result = await listAll(backgroundsRef);
          let totalBytes = 0;
          
          await Promise.all(
              result.items.map(async (item) => {
                  const meta = await getMetadata(item);
                  totalBytes += meta.size;
              })
          );
          
          return { totalBytes, count: result.items.length };
      } catch (error) {
          console.error('Error calculating storage usage:', error);
          return { totalBytes: 0, count: 0 };
      }
  }
};

