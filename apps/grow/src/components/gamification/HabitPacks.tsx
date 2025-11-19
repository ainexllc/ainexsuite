'use client';

import { Package, Plus, Check } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { Habit } from '../../types/models';

const HABIT_PACKS = [
  {
    id: 'pack_morning',
    title: 'Morning Momentum',
    description: 'Start your day with energy and focus.',
    habits: [
      { title: 'Drink Water (500ml)', schedule: { type: 'daily' } },
      { title: '5 Minute Stretch', schedule: { type: 'daily' } },
      { title: 'Plan Top 3 Priorities', schedule: { type: 'daily' } },
    ]
  },
  {
    id: 'pack_couple',
    title: 'Happy Couple',
    description: 'Small gestures to keep the spark alive.',
    habits: [
      { title: 'Date Night', schedule: { type: 'weekly' } },
      { title: 'Compliment Partner', schedule: { type: 'daily' } },
      { title: 'No Phones at Dinner', schedule: { type: 'daily' } },
    ]
  },
  {
    id: 'pack_deep_work',
    title: 'Deep Work',
    description: 'Optimize for focus and productivity.',
    habits: [
      { title: '2 Hour Focus Block', schedule: { type: 'daily' } },
      { title: 'Clear Inbox', schedule: { type: 'daily' } },
      { title: 'Review Weekly Goals', schedule: { type: 'weekly' } },
    ]
  }
];

interface HabitPacksProps {
  onClose: () => void;
}

export function HabitPacks({ onClose }: HabitPacksProps) {
  const { getCurrentSpace, addHabit } = useGrowStore();
  const currentSpace = getCurrentSpace();

  if (!currentSpace) return null;

  const handleInstall = (pack: typeof HABIT_PACKS[0]) => {
    pack.habits.forEach((h) => {
      const habit: Habit = {
        id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spaceId: currentSpace.id,
        title: h.title,
        description: `Imported from ${pack.title}`,
        schedule: h.schedule as any,
        assigneeIds: [currentSpace.members[0].uid], // Default to self
        currentStreak: 0,
        bestStreak: 0,
        isFrozen: false,
        createdAt: new Date().toISOString(),
      };
      addHabit(habit);
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      {HABIT_PACKS.map((pack) => (
        <div 
          key={pack.id}
          className="group relative bg-[#1a1a1a] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all hover:shadow-lg overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => handleInstall(pack)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg"
            >
              <Plus className="h-3 w-3" /> Install
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">{pack.title}</h4>
              <p className="text-xs text-white/50 mb-3">{pack.description}</p>
              <div className="flex flex-wrap gap-2">
                {pack.habits.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/60">
                    <Check className="h-2 w-2" /> {h.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
