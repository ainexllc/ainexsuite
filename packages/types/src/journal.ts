import type { BaseDocument, MoodType, EntryColor } from './common';

// Re-export EntryColor for backward compatibility
export type { EntryColor } from './common';

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
  color?: EntryColor; // Entry card background color
  archived?: boolean; // Whether entry is archived
  pinned?: boolean; // Whether entry is pinned to top
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
