import type { MoodType } from '@ainexsuite/types';
import { LucideIcon, Smile, Frown, Minus, PartyPopper, HeartHandshake, Flame, CloudRain, Sparkles, Zap, Moon, Coffee, HelpCircle, Trophy, CloudOff, Heart, Wind, Lightbulb, Meh, Check } from 'lucide-react';

export const moodConfig: Record<MoodType, {
  label: string;
  color: string;
  icon: LucideIcon;
}> = {
  happy: {
    label: 'Happy',
    color: 'bg-yellow-400 text-yellow-900',
    icon: Smile
  },
  sad: {
    label: 'Sad',
    color: 'bg-blue-400 text-blue-900',
    icon: Frown
  },
  neutral: {
    label: 'Neutral',
    color: 'bg-gray-400 text-gray-900',
    icon: Minus
  },
  excited: {
    label: 'Excited',
    color: 'bg-orange-400 text-orange-900',
    icon: PartyPopper
  },
  anxious: {
    label: 'Anxious',
    color: 'bg-purple-400 text-purple-900',
    icon: Wind
  },
  grateful: {
    label: 'Grateful',
    color: 'bg-pink-400 text-pink-900',
    icon: HeartHandshake
  },
  angry: {
    label: 'Angry',
    color: 'bg-red-400 text-red-900',
    icon: Flame
  },
  peaceful: {
    label: 'Peaceful',
    color: 'bg-cyan-400 text-cyan-900',
    icon: CloudRain
  },
  stressed: {
    label: 'Stressed',
    color: 'bg-red-500 text-white',
    icon: Wind
  },
  hopeful: {
    label: 'Hopeful',
    color: 'bg-green-400 text-green-900',
    icon: Sparkles
  },
  tired: {
    label: 'Tired',
    color: 'bg-indigo-400 text-indigo-900',
    icon: Moon
  },
  energetic: {
    label: 'Energetic',
    color: 'bg-yellow-500 text-white',
    icon: Zap
  },
  confused: {
    label: 'Confused',
    color: 'bg-gray-500 text-white',
    icon: HelpCircle
  },
  confident: {
    label: 'Confident',
    color: 'bg-blue-500 text-white',
    icon: Trophy
  },
  lonely: {
    label: 'Lonely',
    color: 'bg-slate-400 text-slate-900',
    icon: CloudOff
  },
  loved: {
    label: 'Loved',
    color: 'bg-rose-400 text-rose-900',
    icon: Heart
  },
  frustrated: {
    label: 'Frustrated',
    color: 'bg-orange-500 text-white',
    icon: Wind
  },
  inspired: {
    label: 'Inspired',
    color: 'bg-violet-400 text-violet-900',
    icon: Lightbulb
  },
  bored: {
    label: 'Bored',
    color: 'bg-stone-400 text-stone-900',
    icon: Meh
  },
  content: {
    label: 'Content',
    color: 'bg-emerald-400 text-emerald-900',
    icon: Check
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
