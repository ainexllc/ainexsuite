'use client';

import { useState } from 'react';
import { Flame, Settings, Snowflake, RotateCcw, Link2, ArrowRight, Square, CheckSquare } from 'lucide-react';
import type { Habit, Completion, SpaceType, ReactionEmoji } from '@/types/models';
import { HABIT_CATEGORIES } from '@/types/models';
import { getHabitStatus, calculateStreak, getTodayDateString } from '@/lib/date-utils';
import { NudgeButton } from '@/components/gamification/NudgeButton';
import { ReactionPicker } from '@/components/gamification/ReactionPicker';
import { cn } from '@/lib/utils';
import { isInChain, getNextInChain, getChainPositionLabel } from '@/lib/chain-utils';

interface HabitCardProps {
  habit: Habit;
  completions: Completion[];
  allHabits?: Habit[]; // For chain detection
  onComplete: (habitId: string) => void;
  onUndoComplete: (habitId: string) => void;
  onEdit: (habitId: string) => void;
  onChainNext?: (habitId: string) => void; // Scroll to next in chain
  spaceType: SpaceType;
  partnerId?: string;
  currentUserId?: string;
  onReact?: (completionId: string, emoji: ReactionEmoji) => void;
  onRemoveReaction?: (completionId: string) => void;
}

export function HabitCard({
  habit,
  completions,
  allHabits = [],
  onComplete,
  onUndoComplete,
  onEdit,
  onChainNext,
  spaceType,
  partnerId,
  currentUserId,
  onReact,
  onRemoveReaction
}: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showNextPrompt, setShowNextPrompt] = useState(false);

  const status = getHabitStatus(habit, completions);
  const isCompleted = status === 'completed';
  const streak = calculateStreak(habit, completions);

  // Chain detection
  const inChain = isInChain(habit);
  const nextHabit = getNextInChain(habit, allHabits);
  const chainPosition = getChainPositionLabel(habit, allHabits);

  // Calculate today's progress toward target
  const todayStr = getTodayDateString();
  const todayCompletion = completions.find(c => c.habitId === habit.id && c.date === todayStr);
  const todayValue = todayCompletion?.value || 0;
  const hasTarget = habit.targetValue && habit.targetValue > 0;
  const progressPercent = hasTarget ? Math.min(100, (todayValue / habit.targetValue!) * 100) : 0;

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

    // Show "next in chain" prompt if applicable
    if (nextHabit) {
      setShowNextPrompt(true);
      setTimeout(() => setShowNextPrompt(false), 8000);
    }

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
        return 'bg-emerald-900/20 border-emerald-500/30 shadow-emerald-500/10 shadow-lg';
      case 'frozen':
        return 'bg-blue-900/10 border-blue-500/20 opacity-70';
      case 'not_due':
        return 'bg-[#1a1a1a] border-white/5 opacity-50';
      case 'due':
      default:
        return 'bg-[#1a1a1a] border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-indigo-500/5';
    }
  };

  // Get checkbox icon styles
  const getCheckboxIconStyles = () => {
    if (habit.isFrozen) {
      return 'text-blue-400/30 cursor-not-allowed';
    }
    if (isCompleted) {
      return 'text-emerald-500';
    }
    return 'text-white/30 hover:text-indigo-400';
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

  // Get category info
  const categoryInfo = habit.category
    ? HABIT_CATEGORIES.find(c => c.value === habit.category)
    : null;

  return (
    <div
      id={`habit-${habit.id}`}
      className={cn(
        'group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300',
        getCardStyles(),
        isAnimating && 'scale-[1.02]'
      )}
    >
      {/* Left side: Checkbox + Content */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Completion Checkbox Icon */}
        <button
          onClick={handleComplete}
          disabled={habit.isFrozen || isCompleted}
          className={cn(
            'flex-shrink-0 transition-all duration-300',
            getCheckboxIconStyles(),
            isAnimating && 'animate-pulse'
          )}
          aria-label={isCompleted ? 'Completed' : 'Mark as complete'}
        >
          {habit.isFrozen ? (
            <Snowflake className="h-5 w-5 text-blue-400" />
          ) : isCompleted ? (
            <CheckSquare
              className={cn(
                'h-5 w-5 transition-all duration-300',
                justCompleted && 'animate-bounce'
              )}
            />
          ) : (
            <Square className="h-5 w-5" />
          )}
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
            {inChain && chainPosition && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded flex-shrink-0 flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {chainPosition}
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {categoryInfo && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
              >
                {categoryInfo.icon} {categoryInfo.label}
              </span>
            )}
            {habit.description && (
              <p className="text-xs text-white/40 truncate">{habit.description}</p>
            )}
            <span className="text-[10px] text-white/30 flex-shrink-0">
              {getScheduleLabel()}
            </span>
          </div>

          {/* Progress bar for habits with targets */}
          {hasTarget && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                <span>{todayValue} / {habit.targetValue} {habit.targetUnit}</span>
                <span className={progressPercent >= 100 ? 'text-emerald-400' : 'text-indigo-400'}>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    progressPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Streak + Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Undo Button (shows for 5s after completion) */}
        {showUndo && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
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

        {/* Nudge Button (Team/Couple only) - Always visible */}
        {spaceType !== 'personal' && partnerId && (
          <NudgeButton
            targetName="Partner"
            targetId={partnerId}
            habitTitle={habit.title}
          />
        )}

        {/* Reactions (Team/Couple/Family only, when completed) */}
        {spaceType !== 'personal' && isCompleted && todayCompletion && currentUserId && onReact && onRemoveReaction && (
          <ReactionPicker
            reactions={todayCompletion.reactions}
            currentUserId={currentUserId}
            onReact={(emoji) => onReact(todayCompletion.id, emoji)}
            onRemoveReaction={() => onRemoveReaction(todayCompletion.id)}
            size="sm"
          />
        )}

        {/* Edit Button */}
        <button
          onClick={() => onEdit(habit.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-white transition-all rounded-lg hover:bg-white/10"
          aria-label="Edit habit"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Completion celebration effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 animate-shimmer" />
        </div>
      )}

      {/* Next in chain prompt */}
      {showNextPrompt && nextHabit && (
        <div className="absolute -bottom-12 left-0 right-0 animate-fade-in">
          <button
            onClick={() => {
              setShowNextPrompt(false);
              onChainNext?.(nextHabit.id);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Next: {nextHabit.title}
          </button>
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
