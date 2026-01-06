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
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db, createActivity } from '@ainexsuite/firebase';
import type { JournalEntry, JournalEntryFormData } from '@ainexsuite/types';

export const JOURNALS_COLLECTION = 'journal_entries';
const SPACES_COLLECTION = 'spaces';

// Helper to get space data (for fetching memberUids)
async function getSpace(spaceId: string): Promise<{ memberUids: string[] } | null> {
  const spaceRef = doc(db, SPACES_COLLECTION, spaceId);
  const snapshot = await getDoc(spaceRef);
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  return { memberUids: data.memberUids || [] };
}

// Convert Firestore timestamp to Date
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertTimestampToDate(data: any): any {
  if (data?.createdAt?.toDate) {
    data.createdAt = data.createdAt.toDate();
  }
  if (data?.updatedAt?.toDate) {
    data.updatedAt = data.updatedAt.toDate();
  }
  if (data?.attachments) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // Ensure backward compatibility for entries without background fields
  if (data?.backgroundImage === undefined) {
    data.backgroundImage = null;
  }
  if (data?.backgroundOverlay === undefined) {
    data.backgroundOverlay = 'auto';
  }
  // Ensure backward compatibility for entries without coverImage field
  if (data?.coverImage === undefined) {
    data.coverImage = null;
  }
  // Ensure backward compatibility for entries without coverSummary field
  if (data?.coverSummary === undefined) {
    data.coverSummary = null;
  }
  return data;
}

// Create a new journal entry
export async function createJournalEntry(
  userId: string,
  data: JournalEntryFormData,
  spaceId?: string
): Promise<string> {
  const now = new Date();

  // For shared spaces, add all space members to sharedWithUserIds
  let sharedWithUserIds: string[] = [];
  if (spaceId && spaceId !== 'personal') {
    const space = await getSpace(spaceId);
    if (space?.memberUids) {
      // Include all members except the entry owner
      sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
    }
  }

  const journalData = {
    ...data,
    mood: data.mood || 'neutral', // Ensure mood has a default value
    userId,
    date: data.date ? (typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().split('T')[0]) : now.toISOString().split('T')[0], // YYYY-MM-DD
    attachments: [],
    links: data.links || [],
    isDraft: data.isDraft ?? true,
    mediaUrls: [],
    ownerId: userId,
    // Only include spaceId if it's not the default personal space
    ...(spaceId && spaceId !== 'personal' ? { spaceId, sharedWithUserIds } : {}),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const docRef = await addDoc(collection(db, JOURNALS_COLLECTION), journalData);

  // Log activity
  try {
    const dateStr = new Date(journalData.date).toLocaleDateString();
    await createActivity({
      app: 'journal',
      action: 'created',
      itemType: 'entry',
      itemId: docRef.id,
      itemTitle: journalData.title || `Journal Entry - ${dateStr}`,
      metadata: { mood: journalData.mood },
    });
  } catch (error) {
    // Ignore activity logging error
  }

  return docRef.id;
}

// Update an existing journal entry
// Note: updatedAt only changes when title or content is modified
export async function updateJournalEntry(
  entryId: string,
  data: Partial<JournalEntryFormData> & {
    attachments?: JournalEntry['attachments'];
    archived?: boolean;
    color?: JournalEntry['color'];
    backgroundImage?: JournalEntry['backgroundImage'];
    backgroundOverlay?: JournalEntry['backgroundOverlay'];
    coverImage?: JournalEntry['coverImage'];
    coverOverlay?: JournalEntry['coverOverlay'];
    coverSummary?: JournalEntry['coverSummary'];
    spaceId?: string;
  },
  userId?: string
): Promise<void> {
  const docRef = doc(db, JOURNALS_COLLECTION, entryId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedData: Record<string, any> = { ...data };
  if (sanitizedData.isDraft === undefined) {
    delete sanitizedData.isDraft;
  }

  // Handle space changes - update sharedWithUserIds
  if ('spaceId' in data && userId) {
    if (data.spaceId && data.spaceId !== 'personal') {
      // Moving to a shared space - populate sharedWithUserIds
      const space = await getSpace(data.spaceId);
      if (space?.memberUids) {
        sanitizedData.sharedWithUserIds = space.memberUids.filter((uid) => uid !== userId);
      }
    } else {
      // Moving to personal space - clear sharedWithUserIds
      sanitizedData.sharedWithUserIds = [];
      sanitizedData.spaceId = null;
    }
  }

  // Only update updatedAt if title or content changed
  const shouldUpdateTimestamp = 'title' in data || 'content' in data;

  await updateDoc(docRef, {
    ...sanitizedData,
    ...(shouldUpdateTimestamp ? { updatedAt: Date.now() } : {})
  });

  // Log activity
  try {
    const dateStr = data.date
      ? new Date(data.date).toLocaleDateString()
      : 'Journal Entry';
    await createActivity({
      app: 'journal',
      action: 'updated',
      itemType: 'entry',
      itemId: entryId,
      itemTitle: data.title || `Journal Entry - ${dateStr}`,
      metadata: { mood: data.mood },
    });
  } catch (error) {
    // Ignore activity logging error
  }
}

// Delete a journal entry
export async function deleteJournalEntry(entryId: string): Promise<void> {
  const docRef = doc(db, JOURNALS_COLLECTION, entryId);
  
  // Get entry details before deleting for activity log
  let entryTitle = 'Journal Entry';
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      entryTitle = data.title || `Journal Entry - ${data.date}`;
    }
  } catch (e) {
    // Ignore read error during delete
  }

  await deleteDoc(docRef);

  // Log activity
  try {
    await createActivity({
      app: 'journal',
      action: 'deleted',
      itemType: 'entry',
      itemId: entryId,
      itemTitle: entryTitle,
    });
  } catch (error) {
    // Ignore activity logging error
  }
}

// Get a single journal entry
export async function getJournalEntry(entryId: string): Promise<JournalEntry | null> {
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
}

// Get all journal entries for a user (owned + shared in space)
export async function getUserJournalEntries(
  userId: string,
  options: {
    limit?: number;
    startAfter?: DocumentSnapshot;
    tags?: string[];
    mood?: string;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    spaceId?: string;
  } = {}
): Promise<{
  entries: JournalEntry[];
  lastDoc: DocumentSnapshot | null;
}> {
  const sortField = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  // For shared spaces, we need to query both owned and shared entries
  if (options.spaceId && options.spaceId !== 'personal') {
    // Query 1: Entries owned by user in this space
    const ownedConstraints: QueryConstraint[] = [
      where('ownerId', '==', userId),
      where('spaceId', '==', options.spaceId),
      orderBy(sortField, sortOrder),
    ];
    if (options.tags && options.tags.length > 0) {
      ownedConstraints.push(where('tags', 'array-contains-any', options.tags));
    }
    if (options.mood) {
      ownedConstraints.push(where('mood', '==', options.mood));
    }
    if (options.limit) {
      ownedConstraints.push(limit(options.limit));
    }

    // Query 2: Entries shared with user in this space
    const sharedConstraints: QueryConstraint[] = [
      where('sharedWithUserIds', 'array-contains', userId),
      where('spaceId', '==', options.spaceId),
      orderBy(sortField, sortOrder),
    ];
    if (options.limit) {
      sharedConstraints.push(limit(options.limit));
    }

    const [ownedSnapshot, sharedSnapshot] = await Promise.all([
      getDocs(query(collection(db, JOURNALS_COLLECTION), ...ownedConstraints)),
      getDocs(query(collection(db, JOURNALS_COLLECTION), ...sharedConstraints)),
    ]);

    const entriesMap = new Map<string, JournalEntry>();

    // Add owned entries
    ownedSnapshot.forEach((doc) => {
      const data = convertTimestampToDate(doc.data());
      entriesMap.set(doc.id, { id: doc.id, ...data } as JournalEntry);
    });

    // Add shared entries (avoiding duplicates)
    sharedSnapshot.forEach((doc) => {
      if (!entriesMap.has(doc.id)) {
        const data = convertTimestampToDate(doc.data());
        entriesMap.set(doc.id, { id: doc.id, ...data } as JournalEntry);
      }
    });

    // Sort combined entries
    let entries = Array.from(entriesMap.values()).sort((a, b) => {
      const aTime = sortField === 'createdAt' ? a.createdAt : a.updatedAt;
      const bTime = sortField === 'createdAt' ? b.createdAt : b.updatedAt;
      const aVal = typeof aTime === 'number' ? aTime : new Date(aTime as string | Date).getTime();
      const bVal = typeof bTime === 'number' ? bTime : new Date(bTime as string | Date).getTime();
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Apply limit if specified
    if (options.limit) {
      entries = entries.slice(0, options.limit);
    }

    return { entries, lastDoc: null };
  }

  // Personal space: only owned entries without a spaceId
  const constraints: QueryConstraint[] = [
    where('ownerId', '==', userId),
    orderBy(sortField, sortOrder),
  ];

  if (options.tags && options.tags.length > 0) {
    constraints.push(where('tags', 'array-contains-any', options.tags));
  }
  if (options.mood) {
    constraints.push(where('mood', '==', options.mood));
  }
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  if (options.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  const q = query(collection(db, JOURNALS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);

  let entries: JournalEntry[] = [];
  querySnapshot.forEach((doc) => {
    const data = convertTimestampToDate(doc.data());
    entries.push({ id: doc.id, ...data } as JournalEntry);
  });

  // Filter out entries that belong to other spaces
  entries = entries.filter(entry => !entry.spaceId || entry.spaceId === 'personal');

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { entries, lastDoc };
}

// Search journal entries
export async function searchJournalEntries(
  userId: string,
  searchTerm: string
): Promise<JournalEntry[]> {
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
}

// Get "On This Day" entries
export async function getOnThisDayEntries(userId: string, spaceId?: string): Promise<JournalEntry[]> {
  try {
    // Since Firestore doesn't support filtering by just month/day across years easily without a specific field,
    // we'll fetch all entries and filter in memory.
    // Optimization: If user has many entries, we might want to add 'monthDay' field (MM-DD) to documents.
    // For now, we assume reasonable number of entries or fetch latest 500.

    const { entries } = await getUserJournalEntries(userId, { limit: 500, spaceId });

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      // Filter out entries from today (current year)
      if (entryDate.getFullYear() === today.getFullYear()) return false;

      return entryDate.getMonth() === currentMonth && entryDate.getDate() === currentDay;
    });
  } catch (error) {
    return [];
  }
}

// Get journal entry statistics
export async function getJournalStats(userId: string) {
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
}

// Toggle pin status of an entry
// Note: Does not update updatedAt - only content changes should affect that
export async function toggleEntryPin(entryId: string, pinned: boolean): Promise<void> {
  const docRef = doc(db, JOURNALS_COLLECTION, entryId);
  await updateDoc(docRef, { pinned });
}

// Toggle archive status of an entry
// Note: Does not update updatedAt - only content changes should affect that
export async function toggleEntryArchive(entryId: string, archived: boolean): Promise<void> {
  const docRef = doc(db, JOURNALS_COLLECTION, entryId);
  await updateDoc(docRef, { archived });

  // Log activity (only for archiving, not unarchiving)
  if (archived) {
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        await createActivity({
          app: 'journal',
          action: 'archived',
          itemType: 'entry',
          itemId: entryId,
          itemTitle: data.title || 'Journal Entry',
        });
      }
    } catch {
      // Ignore activity logging error
    }
  }
}

// Update entry color
// Note: Does not update updatedAt - only content changes should affect that
export async function updateEntryColor(entryId: string, color: string): Promise<void> {
  const docRef = doc(db, JOURNALS_COLLECTION, entryId);
  await updateDoc(docRef, { color });
}