import type { MoodType } from '@ainexsuite/types';
import { LucideIcon, Smile, Frown, Minus, PartyPopper, HeartHandshake, Leaf, Wind, Moon, Flame } from 'lucide-react';

// Reduced set of 9 analytically meaningful moods
// Organized by valence (positive → negative) and arousal (high → low energy)
export const moodConfig: Record<MoodType, {
  label: string;
  color: string;
  icon: LucideIcon;
}> = {
  // Positive emotions
  happy: {
    label: 'Happy',
    color: 'bg-yellow-400 text-yellow-900',
    icon: Smile
  },
  excited: {
    label: 'Excited',
    color: 'bg-orange-400 text-orange-900',
    icon: PartyPopper
  },
  grateful: {
    label: 'Grateful',
    color: 'bg-pink-400 text-pink-900',
    icon: HeartHandshake
  },
  peaceful: {
    label: 'Peaceful',
    color: 'bg-cyan-400 text-cyan-900',
    icon: Leaf
  },
  // Neutral
  neutral: {
    label: 'Neutral',
    color: 'bg-gray-400 text-gray-900',
    icon: Minus
  },
  // Negative emotions
  anxious: {
    label: 'Anxious',
    color: 'bg-purple-400 text-purple-900',
    icon: Wind
  },
  sad: {
    label: 'Sad',
    color: 'bg-blue-400 text-blue-900',
    icon: Frown
  },
  frustrated: {
    label: 'Frustrated',
    color: 'bg-red-400 text-red-900',
    icon: Flame
  },
  tired: {
    label: 'Tired',
    color: 'bg-indigo-400 text-indigo-900',
    icon: Moon
  }
};

export function getMoodColor(mood: MoodType): string {
  return moodConfig[mood]?.color || 'bg-gray-300 text-gray-900';
}

export function getMoodLabel(mood: MoodType): string {
  return moodConfig[mood]?.label || mood;
}

export function getMoodIcon(mood: MoodType): LucideIcon {
  return moodConfig[mood]?.icon || Minus;
}
