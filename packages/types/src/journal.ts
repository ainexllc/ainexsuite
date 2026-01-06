import type { BaseDocument, MoodType, EntryColor, BackgroundOverlay } from './common';

// Re-export types for backward compatibility
export type { EntryColor, BackgroundOverlay } from './common';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface JournalEntry extends BaseDocument {
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood?: MoodType;
  tags: string[];
  mediaUrls: string[];
  attachments: Attachment[];
  links: string[];
  isPrivate: boolean;
  isDraft: boolean;
  wordCount?: number;
  spaceId?: string; // Optional - null/undefined means personal default space
  sharedWithUserIds?: string[]; // User IDs who can see this entry (populated from space members)
  color?: EntryColor; // Entry card background color
  archived?: boolean; // Whether entry is archived
  pinned?: boolean; // Whether entry is pinned to top
  backgroundImage?: string | null; // ID of a predefined background image
  backgroundOverlay?: BackgroundOverlay; // Overlay style for background images
  coverImage?: string | null; // ID of a cover image from Firestore (for card covers)
  coverOverlay?: BackgroundOverlay; // Overlay style for cover images
  coverSummary?: string | null; // AI-generated summary for cover display
}

export type CreateJournalEntryInput = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>;

export type UpdateJournalEntryInput = Partial<Omit<JournalEntry, 'id' | 'ownerId' | 'createdAt'>>;

export interface JournalEntryFormData {
  title: string;
  content: string;
  tags: string[];
  mood?: MoodType;
  links: string[];
  isPrivate: boolean;
  isDraft?: boolean;
  date?: string | number | Date;
  pinned?: boolean;
  backgroundImage?: string | null;
  backgroundOverlay?: BackgroundOverlay;
}

export interface MoodPattern {
  date: string;
  mood: MoodType;
  count: number;
}

export interface JournalStreak {
  current: number;
  longest: number;
  lastEntryDate: string;
}

export interface JournalStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  weeklyEntryCount: number;
  cadence: number;
  averageWordCount: number;
  mostCommonMood?: MoodType;
}
