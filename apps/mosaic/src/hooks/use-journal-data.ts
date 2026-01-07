'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import type { MoodType } from '@ainexsuite/types';

export interface JournalEntry {
  id: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood?: MoodType;
  tags: string[];
  wordCount?: number;
  createdAt: number;
}

export interface JournalData {
  latestEntry: JournalEntry | null;
  currentMood: MoodType | null;
  writingStreak: number;
  onThisDay: JournalEntry | null;
  recentEntries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
}

// Mood configuration with emojis and colors (softened for less prominent display)
export const MOOD_CONFIG: Record<MoodType, { emoji: string; color: string; bg: string; label: string }> = {
  happy: { emoji: '😊', color: 'text-yellow-300/80', bg: 'bg-yellow-500/10', label: 'Happy' },
  excited: { emoji: '🤩', color: 'text-orange-300/80', bg: 'bg-orange-500/10', label: 'Excited' },
  grateful: { emoji: '🙏', color: 'text-pink-300/80', bg: 'bg-pink-500/10', label: 'Grateful' },
  peaceful: { emoji: '😌', color: 'text-green-300/80', bg: 'bg-green-500/10', label: 'Peaceful' },
  neutral: { emoji: '😐', color: 'text-gray-300/80', bg: 'bg-gray-500/10', label: 'Neutral' },
  anxious: { emoji: '😰', color: 'text-purple-300/80', bg: 'bg-purple-500/10', label: 'Anxious' },
  sad: { emoji: '😢', color: 'text-blue-300/80', bg: 'bg-blue-500/10', label: 'Sad' },
  frustrated: { emoji: '😤', color: 'text-red-300/80', bg: 'bg-red-500/10', label: 'Frustrated' },
  tired: { emoji: '😴', color: 'text-indigo-300/80', bg: 'bg-indigo-500/10', label: 'Tired' },
};

// Calculate writing streak from entries
function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique dates
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();

  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of dates) {
    const entryDate = new Date(dateStr);
    entryDate.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = entryDate;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Find "on this day" entry from previous years
function findOnThisDay(entries: JournalEntry[]): JournalEntry | null {
  const today = new Date();
  const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const currentYear = today.getFullYear();

  // Find entries from same month-day but previous years
  const onThisDayEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    const entryMonthDay = `${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
    return entryMonthDay === todayMonthDay && entryDate.getFullYear() < currentYear;
  });

  // Return the oldest one for nostalgia
  return onThisDayEntries.length > 0 ? onThisDayEntries[onThisDayEntries.length - 1] : null;
}

export function useJournalData(userId: string | undefined): JournalData {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Query recent journal entries (last 30 for streak calculation)
    const entriesQuery = query(
      collection(db, 'journal_entries'),
      where('ownerId', '==', userId),
      where('isDraft', '==', false),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      entriesQuery,
      (snapshot) => {
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as JournalEntry[];
        setEntries(entriesData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching journal entries:', err);
        setError('Failed to load journal');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Get latest entry
  const latestEntry = entries.length > 0 ? entries[0] : null;

  // Get current mood from latest entry
  const currentMood = latestEntry?.mood || null;

  // Calculate writing streak
  const writingStreak = calculateStreak(entries);

  // Find "on this day" memory
  const onThisDay = findOnThisDay(entries);

  return {
    latestEntry,
    currentMood,
    writingStreak,
    onThisDay,
    recentEntries: entries.slice(0, 5),
    isLoading,
    error,
  };
}
