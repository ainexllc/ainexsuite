import type { BaseDocument, MoodType } from './common';

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
