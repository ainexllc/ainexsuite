'use client';

import { useMemo } from 'react';
import { PartyPopper, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Habit, Completion, SpaceType, ReactionEmoji, Member } from '@/types/models';
import { getHabitStatus } from '@/lib/date-utils';
import { HabitCard } from './HabitCard';
import { SwipeableHabitCard } from './SwipeableHabitCard';

interface PersonalHabitsCardProps {
  user: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
  habits: Habit[];
  allHabits: Habit[];
  completions: Completion[];
  onComplete: (habitId: string) => void;
  onUndoComplete: (habitId: string) => void;
  onEdit: (habitId: string) => void;
  onChainNext?: (habitId: string) => void;
  onCardClick?: (habitId: string) => void;
  // Selection mode props
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onSelect: (habitId: string, event: React.MouseEvent) => void;
  // Assignment props
  members: Member[];
  onAssign: (habitId: string, assigneeIds: string[]) => void;
  // Space info
  spaceType: SpaceType;
  partnerId?: string;
  onReact?: (completionId: string, emoji: ReactionEmoji) => void;
  onRemoveReaction?: (completionId: string) => void;
}

// Section divider component
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="pt-4 mt-2 border-t border-white/5">
      <p className="text-xs text-white/30 uppercase tracking-wider mb-3">
        {label}
      </p>
    </div>
  );
}

// Get user initials
function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function PersonalHabitsCard({
  user,
  habits,
  allHabits,
  completions,
  onComplete,
  onUndoComplete,
  onEdit,
  onChainNext,
  onCardClick,
  isSelectMode,
  selectedIds,
  onSelect,
  members,
  onAssign,
  spaceType,
  partnerId,
  onReact,
  onRemoveReaction,
}: PersonalHabitsCardProps) {
  // Calculate progress stats
  const progressStats = useMemo(() => {
    // Due habits = habits with status 'due' or 'completed' (scheduled for today)
    const dueHabits = habits.filter((habit) => {
      const status = getHabitStatus(habit, completions);
      return status === 'due' || status === 'completed';
    });

    const completedHabits = dueHabits.filter((habit) => {
      const status = getHabitStatus(habit, completions);
      return status === 'completed';
    });

    return {
      dueCount: dueHabits.length,
      completedCount: completedHabits.length,
      allDone: dueHabits.length > 0 && completedHabits.length === dueHabits.length,
    };
  }, [habits, completions]);

  const { dueCount, completedCount, allDone } = progressStats;

  // Categorize habits by status
  const categorizedHabits = useMemo(() => {
    const dueAndCompleted: Habit[] = [];
    const notDue: Habit[] = [];
    const frozen: Habit[] = [];

    allHabits.forEach((habit) => {
      if (habit.isFrozen) {
        frozen.push(habit);
      } else {
        const status = getHabitStatus(habit, completions);
        if (status === 'due' || status === 'completed') {
          dueAndCompleted.push(habit);
        } else if (status === 'not_due') {
          notDue.push(habit);
        }
      }
    });

    return { dueAndCompleted, notDue, frozen };
  }, [allHabits, completions]);

  const { dueAndCompleted, notDue, frozen } = categorizedHabits;

  // Render a habit card with swipe wrapper
  const renderHabitCard = (habit: Habit) => {
    const status = getHabitStatus(habit, completions);
    const isHabitCompleted = status === 'completed';

    return (
      <SwipeableHabitCard
        key={habit.id}
        onSwipeRight={() => !isHabitCompleted && !isSelectMode && onComplete(habit.id)}
        onSwipeLeft={() => !isSelectMode && onEdit(habit.id)}
        isCompleted={isHabitCompleted}
        disabled={habit.isFrozen || isSelectMode}
      >
        <HabitCard
          habit={habit}
          completions={completions}
          allHabits={allHabits}
          onComplete={onComplete}
          onUndoComplete={onUndoComplete}
          onEdit={onEdit}
          onChainNext={onChainNext}
          spaceType={spaceType}
          partnerId={partnerId}
          currentUserId={user.uid}
          onReact={onReact}
          onRemoveReaction={onRemoveReaction}
          isSelectMode={isSelectMode}
          isSelected={selectedIds.has(habit.id)}
          onSelect={onSelect}
          members={members}
          onAssign={onAssign}
          onCardClick={onCardClick}
        />
      </SwipeableHabitCard>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border overflow-hidden',
        allDone
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-white/5 border-white/10'
      )}
    >
      {/* Banner Header with user photo background */}
      <div
        className={cn(
          'relative text-center border-b overflow-hidden',
          user.photoURL ? 'py-8 lg:py-12 px-4' : 'p-4',
          allDone ? 'border-emerald-500/20' : 'border-white/10'
        )}
      >
        {/* Background Image */}
        {user.photoURL && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${user.photoURL})` }}
            />
            {/* Dark gradient overlay for text readability */}
            <div
              className={cn(
                'absolute inset-0',
                allDone
                  ? 'bg-gradient-to-b from-emerald-900/70 via-emerald-900/80 to-emerald-900/90'
                  : 'bg-gradient-to-b from-black/50 via-black/60 to-black/70'
              )}
            />
          </>
        )}

        {/* Content (positioned above background) */}
        <div className="relative z-10">
          {/* Avatar - only show if no banner image */}
          {!user.photoURL && (
            <div
              className={cn(
                'h-14 w-14 rounded-full mx-auto flex items-center justify-center text-xl font-bold shadow-lg',
                allDone
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                  : 'bg-gradient-to-br from-gray-700 to-gray-600 text-white'
              )}
            >
              {getInitials(user.displayName || 'Me')}
            </div>
          )}

          {/* Name */}
          <h3
            className={cn(
              'text-base font-semibold flex items-center justify-center gap-1.5',
              user.photoURL
                ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                : 'text-white mt-2'
            )}
          >
            {user.displayName || 'My Habits'}
            <User className="h-3.5 w-3.5 text-white/60 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
          </h3>

          {/* Progress */}
          <p
            className={cn(
              'text-sm mt-1',
              allDone
                ? 'text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                : user.photoURL
                  ? 'text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                  : 'text-white/50'
            )}
          >
            {allDone ? (
              <span className="flex items-center justify-center gap-1">
                <PartyPopper className="h-4 w-4" />
                All done!
              </span>
            ) : dueCount > 0 ? (
              `${completedCount}/${dueCount} completed`
            ) : (
              'No habits due today'
            )}
          </p>
        </div>
      </div>

      {/* Habits Content */}
      <div className="flex-1 p-3 space-y-3">
        {/* Due/Completed Habits */}
        {dueAndCompleted.length > 0 ? (
          dueAndCompleted.map(renderHabitCard)
        ) : (
          <div className="text-center py-4 text-white/30 text-sm">
            No habits scheduled for today
          </div>
        )}

        {/* Not Scheduled Today Section */}
        {notDue.length > 0 && (
          <>
            <SectionDivider label="Not scheduled today" />
            {notDue.map(renderHabitCard)}
          </>
        )}

        {/* Frozen Habits Section */}
        {frozen.length > 0 && (
          <>
            <SectionDivider label="Frozen" />
            {frozen.map(renderHabitCard)}
          </>
        )}
      </div>
    </div>
  );
}
