'use client';

import { useState } from 'react';
import { Flame, Settings, Snowflake, Check, RotateCcw } from 'lucide-react';
import { Habit, Completion, SpaceType } from '@/types/models';
import { getHabitStatus, calculateStreak } from '@/lib/date-utils';
import { NudgeButton } from '@/components/gamification/NudgeButton';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  completions: Completion[];
  onComplete: (habitId: string) => void;
  onUndoComplete: (habitId: string) => void;
  onEdit: (habitId: string) => void;
  spaceType: SpaceType;
  partnerId?: string;
}

export function HabitCard({
  habit,
  completions,
  onComplete,
  onUndoComplete,
  onEdit,
  spaceType,
  partnerId
}: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const status = getHabitStatus(habit, completions);
  const isCompleted = status === 'completed';
  const streak = calculateStreak(habit, completions);

  // Handle completion with animation
  const handleComplete = () => {
    if (habit.isFrozen || isCompleted) return;

    setIsAnimating(true);
    setJustCompleted(true);
    onComplete(habit.id);

    // Show undo button for 5 seconds
    setShowUndo(true);
    setTimeout(() => {
      setShowUndo(false);
      setJustCompleted(false);
    }, 5000);

    // Reset animation
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Handle undo
  const handleUndo = () => {
    setShowUndo(false);
    setJustCompleted(false);
    onUndoComplete(habit.id);
  };

  // Get status-based styles
  const getCardStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-900/20 border-emerald-500/30';
      case 'frozen':
        return 'bg-blue-900/10 border-blue-500/20 opacity-70';
      case 'not_due':
        return 'bg-[#1a1a1a] border-white/5 opacity-60';
      case 'due':
      default:
        return 'bg-[#1a1a1a] border-white/5 hover:border-white/10 hover:shadow-md';
    }
  };

  // Get checkbox styles
  const getCheckboxStyles = () => {
    if (habit.isFrozen) {
      return 'border-blue-400/30 cursor-not-allowed bg-blue-500/5';
    }
    if (isCompleted) {
      return 'border-emerald-500 bg-emerald-500 text-white';
    }
    return 'border-indigo-500 hover:bg-indigo-500/20 hover:border-indigo-400';
  };

  // Get streak color based on count
  const getStreakColor = () => {
    if (streak >= 30) return 'text-yellow-400 bg-yellow-500/10'; // Fire
    if (streak >= 14) return 'text-orange-400 bg-orange-500/10'; // Hot
    if (streak >= 7) return 'text-amber-400 bg-amber-500/10';    // Warm
    return 'text-orange-400 bg-orange-500/10';                    // Default
  };

  // Schedule type label
  const getScheduleLabel = () => {
    const { type, daysOfWeek, intervalDays, timesPerWeek } = habit.schedule;
    switch (type) {
      case 'daily':
        return 'Daily';
      case 'specific_days': {
        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        return daysOfWeek?.map(d => dayNames[d]).join(', ') || 'Custom';
      }
      case 'interval':
        return `Every ${intervalDays} days`;
      case 'weekly':
        return `${timesPerWeek}x per week`;
      default:
        return '';
    }
  };

  return (
    <div
      id={`habit-${habit.id}`}
      className={cn(
        'group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300',
        getCardStyles(),
        isAnimating && 'scale-[1.02]'
      )}
    >
      {/* Left side: Checkbox + Content */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Completion Checkbox */}
        <button
          onClick={handleComplete}
          disabled={habit.isFrozen || isCompleted}
          className={cn(
            'relative h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0',
            getCheckboxStyles(),
            isAnimating && 'animate-pulse'
          )}
          aria-label={isCompleted ? 'Completed' : 'Mark as complete'}
        >
          {isCompleted && (
            <Check
              className={cn(
                'h-4 w-4 transition-all duration-300',
                justCompleted && 'animate-bounce'
              )}
            />
          )}
          {habit.isFrozen && <Snowflake className="h-3.5 w-3.5 text-blue-400" />}
        </button>

        {/* Habit Info */}
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'text-sm font-medium flex items-center gap-2 transition-all',
              isCompleted ? 'text-emerald-300 line-through opacity-70' : 'text-white'
            )}
          >
            <span className="truncate">{habit.title}</span>
            {habit.isFrozen && (
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded flex-shrink-0">
                Frozen
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2 mt-0.5">
            {habit.description && (
              <p className="text-xs text-white/40 truncate">{habit.description}</p>
            )}
            <span className="text-[10px] text-white/30 flex-shrink-0">
              {getScheduleLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Streak + Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Undo Button (shows for 5s after completion) */}
        {showUndo && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all"
          >
            <RotateCcw className="h-3 w-3" />
            Undo
          </button>
        )}

        {/* Streak Badge */}
        {streak > 0 && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all',
              getStreakColor(),
              isAnimating && streak > 0 && 'animate-pulse'
            )}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>{streak}</span>
          </div>
        )}

        {/* Nudge Button (Team/Couple only) */}
        {spaceType !== 'personal' && partnerId && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <NudgeButton
              targetName="Partner"
              targetId={partnerId}
              habitTitle={habit.title}
            />
          </div>
        )}

        {/* Edit Button */}
        <button
          onClick={() => onEdit(habit.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-white transition-all rounded-md hover:bg-white/5"
          aria-label="Edit habit"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Completion celebration effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 animate-shimmer" />
        </div>
      )}
    </div>
  );
}

// CSS for shimmer animation (add to globals.css or tailwind config)
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
// .animate-shimmer { animation: shimmer 0.6s ease-out; }
