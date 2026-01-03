'use client';

import { Member, Habit } from '@/types/models';
import { TouchHabitCard } from './TouchHabitCard';
import { ChildHabitCard } from './ChildHabitCard';
import { Baby, User, PartyPopper, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMemberColumnProps {
  member: Member;
  habits: Habit[];
  isCompleted: (habitId: string) => boolean;
  onComplete: (habitId: string) => void;
  onUndoComplete: (habitId: string) => void;
  /** Total completions for this member (for achievement tracking) */
  totalCompletions?: number;
  /** Callback when celebration should trigger */
  onCelebrate?: (member: Member, achievement?: { name: string; icon: string }) => void;
}

export function FamilyMemberColumn({
  member,
  habits,
  isCompleted,
  onComplete,
  onUndoComplete,
  totalCompletions = 0,
  onCelebrate,
}: FamilyMemberColumnProps) {
  const completedCount = habits.filter((h) => isCompleted(h.id)).length;
  const allDone = habits.length > 0 && completedCount === habits.length;
  const isChild = member.ageGroup === 'child';

  // Handle celebration when completing a habit
  const handleCelebrate = (achievement?: { name: string; icon: string }) => {
    onCelebrate?.(member, achievement);
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      {/* Member Header with Banner Background */}
      <div className={cn(
        'relative text-center border-b overflow-hidden',
        member.photoURL ? 'py-8 lg:py-10 px-4 lg:px-5' : 'p-4 lg:p-5',
        allDone ? 'border-emerald-500/20' : 'border-white/10'
      )}>
        {/* Banner Background Image */}
        {member.photoURL && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${member.photoURL})` }}
            />
            {/* Dark gradient overlay for text readability */}
            <div className={cn(
              'absolute inset-0',
              allDone
                ? 'bg-gradient-to-b from-emerald-900/60 via-emerald-900/70 to-emerald-900/80'
                : 'bg-gradient-to-b from-black/40 via-black/50 to-black/60'
            )} />
          </>
        )}

        {/* Content (positioned above background) */}
        <div className="relative z-10">
          {/* Avatar - only show if no banner image */}
          {!member.photoURL && (
            <div className={cn(
              'h-16 w-16 lg:h-20 lg:w-20 rounded-full mx-auto flex items-center justify-center text-2xl lg:text-3xl font-bold shadow-lg',
              allDone
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                : 'bg-gradient-to-br from-gray-700 to-gray-600 text-white'
            )}>
              {member.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Name */}
          <h2 className={cn(
            'text-lg lg:text-xl font-bold flex items-center justify-center gap-2',
            member.photoURL ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-white mt-3'
          )}>
            {member.displayName}
            {isChild ? (
              <Baby className="h-4 w-4 text-pink-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            ) : (
              <User className="h-4 w-4 text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            )}
          </h2>

          {/* Progress */}
          <p className={cn(
            'text-sm mt-1',
            allDone
              ? 'text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              : member.photoURL
                ? 'text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                : 'text-white/50'
          )}>
            {allDone ? (
              <span className="flex items-center justify-center gap-1">
                <PartyPopper className="h-4 w-4" />
                All done!
              </span>
            ) : (
              `${completedCount}/${habits.length} done`
            )}
          </p>
        </div>
      </div>

      {/* Habits List */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3">
        {habits.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-center p-4">
            <p>No habits assigned</p>
          </div>
        ) : (
          habits.map((habit) =>
            isChild ? (
              <ChildHabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted(habit.id)}
                onComplete={() => onComplete(habit.id)}
                onUndoComplete={() => onUndoComplete(habit.id)}
                totalCompletions={totalCompletions}
                onCelebrate={handleCelebrate}
              />
            ) : (
              <TouchHabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted(habit.id)}
                onComplete={() => onComplete(habit.id)}
                onUndoComplete={() => onUndoComplete(habit.id)}
              />
            )
          )
        )}
      </div>

      {/* All Done Celebration for children */}
      {isChild && allDone && (
        <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-t border-emerald-500/30">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="font-bold">Amazing job!</span>
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
