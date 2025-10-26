import type { BaseDocument, MoodType } from './common';

export interface JournalEntry extends BaseDocument {
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  mediaUrls: string[];
}

export type CreateJournalEntryInput = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateJournalEntryInput = Partial<Omit<JournalEntry, 'id' | 'ownerId' | 'createdAt'>>;

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
