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
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import type { JournalEntry, JournalEntryFormData } from '@ainexsuite/types';

export const JOURNALS_COLLECTION = 'journal_entries';

// Convert Firestore timestamp to Date
function convertTimestampToDate(data: any): any {
  if (data?.createdAt?.toDate) {
    data.createdAt = data.createdAt.toDate();
  }
  if (data?.updatedAt?.toDate) {
    data.updatedAt = data.updatedAt.toDate();
  }
  if (data?.attachments) {
    data.attachments = data.attachments.map((att: any) => ({
      ...att,
      uploadedAt: att.uploadedAt?.toDate ? att.uploadedAt.toDate() : att.uploadedAt
    }));
  }
  if (data?.isDraft === undefined) {
    data.isDraft = false;
  }
  // Ensure backward compatibility for entries without links field
  if (!data?.links) {
    data.links = [];
  }
  return data;
}

// Create a new journal entry
export async function createJournalEntry(
  userId: string,
  data: JournalEntryFormData
): Promise<string> {
  try {
    const now = new Date();
    const journalData = {
      ...data,
      mood: data.mood || 'neutral', // Ensure mood has a default value
      userId,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      attachments: [],
      links: data.links || [],
      isDraft: data.isDraft ?? true,
      mediaUrls: [],
      ownerId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const docRef = await addDoc(collection(db, JOURNALS_COLLECTION), journalData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
}

// Update an existing journal entry
export async function updateJournalEntry(
  entryId: string,
  data: Partial<JournalEntryFormData>
): Promise<void> {
  try {
    const docRef = doc(db, JOURNALS_COLLECTION, entryId);
    const sanitizedData = { ...data };
    if (sanitizedData.isDraft === undefined) {
      delete sanitizedData.isDraft;
    }
    await updateDoc(docRef, {
      ...sanitizedData,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
}

// Delete a journal entry
export async function deleteJournalEntry(entryId: string): Promise<void> {
  try {
    const docRef = doc(db, JOURNALS_COLLECTION, entryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
}

// Get a single journal entry
export async function getJournalEntry(entryId: string): Promise<JournalEntry | null> {
  try {
    const docRef = doc(db, JOURNALS_COLLECTION, entryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = convertTimestampToDate(docSnap.data());
      return {
        id: docSnap.id,
        ...data
      } as JournalEntry;
    }

    return null;
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    throw error;
  }
}

// Get all journal entries for a user
export async function getUserJournalEntries(
  userId: string,
  options: {
    limit?: number;
    startAfter?: DocumentSnapshot;
    tags?: string[];
    mood?: string;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{
  entries: JournalEntry[];
  lastDoc: DocumentSnapshot | null;
}> {
  try {
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', userId)
    ];

    // Add tag filter if provided
    if (options.tags && options.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', options.tags));
    }

    // Add mood filter if provided
    if (options.mood) {
      constraints.push(where('mood', '==', options.mood));
    }

    // Add sorting
    const sortField = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    constraints.push(orderBy(sortField, sortOrder));

    // Add pagination
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }

    const q = query(collection(db, JOURNALS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const entries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = convertTimestampToDate(doc.data());
      entries.push({
        id: doc.id,
        ...data
      } as JournalEntry);
    });

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { entries, lastDoc };
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
}

// Search journal entries
export async function searchJournalEntries(
  userId: string,
  searchTerm: string
): Promise<JournalEntry[]> {
  try {
    // Note: This is a basic implementation. For full-text search,
    // consider using Algolia or Elasticsearch
    const entries = await getUserJournalEntries(userId, { limit: 100 });

    const searchLower = searchTerm.toLowerCase();
    return entries.entries.filter(entry =>
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      (entry.links && entry.links.some(link => link.toLowerCase().includes(searchLower)))
    );
  } catch (error) {
    console.error('Error searching journal entries:', error);
    throw error;
  }
}

// Get journal entry statistics
export async function getJournalStats(userId: string) {
  try {
    const q = query(
      collection(db, JOURNALS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = convertTimestampToDate(doc.data());
      entries.push({
        id: doc.id,
        ...data
      } as JournalEntry);
    });

    // Calculate statistics
    const totalEntries = entries.length;
    const moodCounts = entries.reduce((acc, entry) => {
      if (entry.mood) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const tagCounts = entries.reduce((acc, entry) => {
      entry.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const entriesByMonth = entries.reduce((acc, entry) => {
      const month = new Date(entry.createdAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries,
      moodCounts,
      tagCounts,
      entriesByMonth
    };
  } catch (error) {
    console.error('Error fetching journal statistics:', error);
    throw error;
  }
}
