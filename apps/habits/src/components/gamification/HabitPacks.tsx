'use client';

import { useState } from 'react';
import {
  Package,
  Check,
  Plus,
  Dumbbell,
  Brain,
  Briefcase,
  Heart,
  BookOpen,
  Wallet,
  Palette,
  Moon,
  Coffee,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useGrowStore } from '@/lib/store';
import { Habit, Schedule } from '@/types/models';
import { cn } from '@/lib/utils';

interface HabitTemplate {
  title: string;
  description?: string;
  schedule: Partial<Schedule>;
}

interface HabitPack {
  id: string;
  title: string;
  description: string;
  icon: typeof Package;
  color: string;
  category: string;
  habits: HabitTemplate[];
}

const HABIT_PACKS: HabitPack[] = [
  // Health & Fitness
  {
    id: 'pack_morning',
    title: 'Morning Momentum',
    description: 'Start your day with energy and focus.',
    icon: Coffee,
    color: 'from-orange-500 to-amber-500',
    category: 'Health',
    habits: [
      { title: 'Drink Water (500ml)', schedule: { type: 'daily' } },
      { title: '5 Minute Stretch', schedule: { type: 'daily' } },
      { title: 'Make Your Bed', schedule: { type: 'daily' } },
      { title: 'Healthy Breakfast', schedule: { type: 'daily' } },
    ],
  },
  {
    id: 'pack_fitness',
    title: 'Fitness Starter',
    description: 'Build a sustainable exercise routine.',
    icon: Dumbbell,
    color: 'from-red-500 to-rose-500',
    category: 'Health',
    habits: [
      { title: '30 Min Workout', schedule: { type: 'specific_days', daysOfWeek: [1, 3, 5] } },
      { title: '10,000 Steps', schedule: { type: 'daily' } },
      { title: 'Take the Stairs', schedule: { type: 'daily' } },
      { title: 'Post-Workout Stretch', schedule: { type: 'specific_days', daysOfWeek: [1, 3, 5] } },
    ],
  },
  {
    id: 'pack_sleep',
    title: 'Better Sleep',
    description: 'Optimize your rest for peak performance.',
    icon: Moon,
    color: 'from-indigo-500 to-blue-500',
    category: 'Health',
    habits: [
      { title: 'No Screens After 9pm', schedule: { type: 'daily' } },
      { title: 'Read Before Bed', schedule: { type: 'daily' } },
      { title: 'Sleep by 10:30pm', schedule: { type: 'daily' } },
      { title: 'No Caffeine After 2pm', schedule: { type: 'daily' } },
    ],
  },

  // Productivity
  {
    id: 'pack_deep_work',
    title: 'Deep Work',
    description: 'Maximize focus and output.',
    icon: Briefcase,
    color: 'from-violet-500 to-purple-500',
    category: 'Productivity',
    habits: [
      { title: '2 Hour Focus Block', schedule: { type: 'specific_days', daysOfWeek: [1, 2, 3, 4, 5] } },
      { title: 'Clear Inbox to Zero', schedule: { type: 'daily' } },
      { title: 'Plan Tomorrow Tonight', schedule: { type: 'daily' } },
      { title: 'Weekly Review', schedule: { type: 'weekly', timesPerWeek: 1 } },
    ],
  },
  {
    id: 'pack_learning',
    title: 'Lifelong Learner',
    description: 'Never stop growing your knowledge.',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
    category: 'Learning',
    habits: [
      { title: 'Read 20 Pages', schedule: { type: 'daily' } },
      { title: 'Learn Something New', schedule: { type: 'daily' } },
      { title: 'Practice a Skill', schedule: { type: 'specific_days', daysOfWeek: [1, 3, 5] } },
      { title: 'Take Notes', schedule: { type: 'daily' } },
    ],
  },

  // Mental Wellness
  {
    id: 'pack_mindfulness',
    title: 'Mindful Living',
    description: 'Cultivate peace and presence.',
    icon: Brain,
    color: 'from-cyan-500 to-sky-500',
    category: 'Mindfulness',
    habits: [
      { title: '5 Min Meditation', schedule: { type: 'daily' } },
      { title: 'Gratitude Journal', schedule: { type: 'daily' } },
      { title: 'Deep Breathing Exercise', schedule: { type: 'daily' } },
      { title: 'Digital Detox Hour', schedule: { type: 'daily' } },
    ],
  },

  // Relationships
  {
    id: 'pack_couple',
    title: 'Happy Couple',
    description: 'Nurture your relationship daily.',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    category: 'Relationships',
    habits: [
      { title: 'Date Night', schedule: { type: 'weekly', timesPerWeek: 1 } },
      { title: 'Compliment Partner', schedule: { type: 'daily' } },
      { title: 'Quality Time (No Phones)', schedule: { type: 'daily' } },
      { title: 'Express Appreciation', schedule: { type: 'daily' } },
    ],
  },
  {
    id: 'pack_social',
    title: 'Stay Connected',
    description: 'Maintain meaningful relationships.',
    icon: Users,
    color: 'from-blue-500 to-indigo-500',
    category: 'Relationships',
    habits: [
      { title: 'Reach Out to a Friend', schedule: { type: 'weekly', timesPerWeek: 2 } },
      { title: 'Call Family Member', schedule: { type: 'weekly', timesPerWeek: 1 } },
      { title: 'Send a Thank You', schedule: { type: 'weekly', timesPerWeek: 1 } },
    ],
  },

  // Finance
  {
    id: 'pack_finance',
    title: 'Money Mindset',
    description: 'Build financial discipline.',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    category: 'Finance',
    habits: [
      { title: 'Track Spending', schedule: { type: 'daily' } },
      { title: 'No Impulse Purchases', schedule: { type: 'daily' } },
      { title: 'Review Budget', schedule: { type: 'weekly', timesPerWeek: 1 } },
      { title: 'Save Before Spending', schedule: { type: 'weekly', timesPerWeek: 1 } },
    ],
  },

  // Creativity
  {
    id: 'pack_creative',
    title: 'Creative Flow',
    description: 'Unlock your creative potential.',
    icon: Palette,
    color: 'from-fuchsia-500 to-pink-500',
    category: 'Creativity',
    habits: [
      { title: 'Morning Pages (3 Pages)', schedule: { type: 'daily' } },
      { title: 'Create Something', schedule: { type: 'daily' } },
      { title: 'Consume Inspiring Content', schedule: { type: 'daily' } },
      { title: 'Share Your Work', schedule: { type: 'weekly', timesPerWeek: 1 } },
    ],
  },

  // Self-Care
  {
    id: 'pack_selfcare',
    title: 'Self-Care Essentials',
    description: 'Prioritize your well-being.',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-500',
    category: 'Self-Care',
    habits: [
      { title: 'Skincare Routine', schedule: { type: 'daily' } },
      { title: 'Take a Real Break', schedule: { type: 'daily' } },
      { title: 'Do Something Fun', schedule: { type: 'daily' } },
      { title: 'Weekly Treat Yourself', schedule: { type: 'weekly', timesPerWeek: 1 } },
    ],
  },
];

const CATEGORIES = [
  'All',
  'Health',
  'Productivity',
  'Learning',
  'Mindfulness',
  'Relationships',
  'Finance',
  'Creativity',
  'Self-Care',
];

interface HabitPacksProps {
  onClose?: () => void;
}

export function HabitPacks({ onClose: _onClose }: HabitPacksProps) {
  const { user } = useAuth();
  const { addHabit } = useGrowStore();
  const { currentSpace } = useSpaces();
  

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [installedPacks, setInstalledPacks] = useState<Set<string>>(new Set());

  if (!currentSpace || !user) return null;

  const filteredPacks =
    selectedCategory === 'All'
      ? HABIT_PACKS
      : HABIT_PACKS.filter((pack) => pack.category === selectedCategory);

  const handleInstall = async (pack: HabitPack) => {
    // For team spaces, assign to all members by default
    // For personal space, only assign to the current user
    const assigneeIds = currentSpace.type !== 'personal' && currentSpace.memberUids?.length > 0
      ? currentSpace.memberUids
      : [user.uid];

    for (const h of pack.habits) {
      const habit: Habit = {
        id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        spaceId: currentSpace.id,
        title: h.title,
        description: h.description || `From "${pack.title}" pack`,
        schedule: {
          type: h.schedule.type || 'daily',
          daysOfWeek: h.schedule.daysOfWeek,
          timesPerWeek: h.schedule.timesPerWeek,
          intervalDays: h.schedule.intervalDays,
        } as Schedule,
        assigneeIds,
        currentStreak: 0,
        bestStreak: 0,
        isFrozen: false,
        createdAt: new Date().toISOString(),
      };
      await addHabit(habit);
      // Small delay to ensure unique IDs
      await new Promise((r) => setTimeout(r, 50));
    }

    setInstalledPacks((prev) => new Set([...prev, pack.id]));
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              selectedCategory === category
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Packs Grid */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {filteredPacks.map((pack) => {
          const Icon = pack.icon;
          const isInstalled = installedPacks.has(pack.id);

          return (
            <div
              key={pack.id}
              className={cn(
                'group relative bg-[#1a1a1a] border rounded-xl p-4 transition-all overflow-hidden',
                isInstalled
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/10 hover:border-white/20 hover:shadow-lg'
              )}
            >
              {/* Install Button */}
              <div className="absolute top-3 right-3">
                {isInstalled ? (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <Check className="h-3 w-3" />
                    Added
                  </span>
                ) : (
                  <button
                    onClick={() => handleInstall(pack)}
                    className="opacity-0 group-hover:opacity-100 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    Install
                  </button>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                    pack.color
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-20">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white">{pack.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                      {pack.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mb-3">{pack.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pack.habits.slice(0, 3).map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/60"
                      >
                        <Check className="h-2 w-2" />
                        {h.title}
                      </span>
                    ))}
                    {pack.habits.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/40">
                        +{pack.habits.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">
          {HABIT_PACKS.length} packs available • {HABIT_PACKS.reduce((acc, p) => acc + p.habits.length, 0)} habits total
        </p>
      </div>
    </div>
  );
}
