'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Habit } from '@/types/models';
import { cn } from '@/lib/utils';

interface TouchHabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: () => void;
  onUndoComplete: () => void;
}

export function TouchHabitCard({
  habit,
  isCompleted,
  onComplete,
  onUndoComplete,
}: TouchHabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTap = () => {
    if (isCompleted) {
      onUndoComplete();
    } else {
      setIsAnimating(true);
      onComplete();
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        // Base styles - large touch target
        'w-full min-h-[80px] lg:min-h-[90px] p-4 rounded-xl border-2 transition-all duration-200',
        // Touch feedback
        'active:scale-[0.97] select-none',
        // States
        isCompleted
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100'
          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20',
        // Animation
        isAnimating && 'animate-celebrate'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Large Checkbox */}
        <div
          className={cn(
            'h-12 w-12 lg:h-14 lg:w-14 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300',
            isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-white/10 border-2 border-white/20'
          )}
        >
          {isCompleted && <Check className="h-7 w-7 lg:h-8 lg:w-8" strokeWidth={3} />}
        </div>

        {/* Habit Title */}
        <div className="flex-1 text-left">
          <p
            className={cn(
              'text-lg lg:text-xl font-semibold',
              isCompleted && 'line-through opacity-70'
            )}
          >
            {habit.title}
          </p>
          {habit.description && (
            <p className="text-sm text-white/50 mt-0.5 line-clamp-1">
              {habit.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
