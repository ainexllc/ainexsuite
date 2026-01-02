'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '@ainexsuite/firebase';
import { collection, query, where, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { Space, Habit, Completion, Member } from '@/types/models';
import { getTodayDateString } from '@/lib/date-utils';
import { DashboardHeader } from './DashboardHeader';
import { FamilyMemberColumn } from './FamilyMemberColumn';
import { CelebrationOverlay, CELEBRATION_PRESETS } from './CelebrationOverlay';
import { FamilyStreakTracker } from './FamilyStreakTracker';

interface FamilyDashboardProps {
  space: Space;
  token: string;
}

export function FamilyDashboard({ space, token }: FamilyDashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Celebration overlay state
  const [celebrationState, setCelebrationState] = useState<{
    isOpen: boolean;
    type: 'achievement' | 'all_done' | 'challenge_complete';
    title: string;
    subtitle?: string;
    emoji: string;
    memberName?: string;
    memberPhotoURL?: string;
  } | null>(null);

  // Subscribe to habits
  useEffect(() => {
    const habitsQuery = query(
      collection(db, 'habits'),
      where('spaceId', '==', space.id)
    );

    const unsubscribe = onSnapshot(
      habitsQuery,
      (snapshot) => {
        const habitsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Habit[];
        setHabits(habitsData);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        // eslint-disable-next-line no-console
        console.error('[FamilyDashboard] Habits subscription error:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [space.id]);

  // Subscribe to today's completions
  useEffect(() => {
    const today = getTodayDateString();
    const completionsQuery = query(
      collection(db, 'completions'),
      where('spaceId', '==', space.id),
      where('date', '==', today)
    );

    const unsubscribe = onSnapshot(
      completionsQuery,
      (snapshot) => {
        const completionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Completion[];
        setCompletions(completionsData);
      },
      (err: FirestoreError) => {
        // eslint-disable-next-line no-console
        console.error('[FamilyDashboard] Completions subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [space.id]);

  // Handle completion via API (no auth required, token validated server-side)
  const handleComplete = useCallback(
    async (habitId: string, memberId: string) => {
      try {
        const response = await fetch('/api/dashboard/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spaceId: space.id,
            token,
            habitId,
            memberId,
            date: getTodayDateString(),
          }),
        });

        if (!response.ok) {
          console.error('Failed to record completion');
        }
      } catch (error) {
        console.error('Error completing habit:', error);
      }
    },
    [space.id, token]
  );

  // Handle undo completion
  const handleUndoComplete = useCallback(
    async (habitId: string, memberId: string) => {
      try {
        const response = await fetch('/api/dashboard/complete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spaceId: space.id,
            token,
            habitId,
            memberId,
            date: getTodayDateString(),
          }),
        });

        if (!response.ok) {
          console.error('Failed to remove completion');
        }
      } catch (error) {
        console.error('Error undoing completion:', error);
      }
    },
    [space.id, token]
  );

  // Get member's habits (assigned to them) that are due today
  const getMemberHabits = (memberId: string) => {
    return habits.filter((habit) =>
      habit.assigneeIds.includes(memberId) && !habit.isFrozen
    );
  };

  // Check if a habit is completed for a specific member today
  const isCompleted = (habitId: string, memberId: string) => {
    return completions.some(
      (c) => c.habitId === habitId && c.userId === memberId
    );
  };

  // Calculate overall progress
  const totalHabitsToday = habits.filter((h) => !h.isFrozen).reduce(
    (acc, h) => acc + h.assigneeIds.length,
    0
  );
  const totalCompletedToday = completions.length;

  // Get total completions per member
  const getMemberTotalCompletions = (memberId: string) => {
    return completions.filter((c) => c.userId === memberId).length;
  };

  // Check if member has completed all their habits today
  const isMemberAllDone = (memberId: string) => {
    const memberHabits = getMemberHabits(memberId);
    if (memberHabits.length === 0) return false;
    return memberHabits.every((h) => isCompleted(h.id, memberId));
  };

  // Handle celebration trigger from child cards
  const handleCelebration = useCallback(
    (member: Member, achievement?: { name: string; icon: string }) => {
      if (achievement) {
        // Achievement celebration
        const preset = CELEBRATION_PRESETS.achievement(
          achievement.name,
          achievement.icon,
          member.displayName
        );
        setCelebrationState({
          isOpen: true,
          ...preset,
          memberName: member.displayName,
          memberPhotoURL: member.photoURL,
        });
      } else if (isMemberAllDone(member.uid)) {
        // All done celebration
        const preset = CELEBRATION_PRESETS.allDone(member.displayName);
        setCelebrationState({
          isOpen: true,
          ...preset,
          memberName: member.displayName,
          memberPhotoURL: member.photoURL,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completions, habits]
  );

  const closeCelebration = useCallback(() => {
    setCelebrationState(null);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col p-4 lg:p-6">
        {/* Header */}
        <DashboardHeader
          spaceName={space.name}
          progress={{ completed: totalCompletedToday, total: totalHabitsToday }}
        />

        {/* Streak Tracker (Compact) */}
        <div className="mt-4">
          <FamilyStreakTracker
            members={space.members}
            habits={habits}
            completions={completions}
            compact
          />
        </div>

        {/* Members Grid */}
        <div className="flex-1 grid gap-4 lg:gap-6 overflow-hidden mt-4" style={{
          gridTemplateColumns: `repeat(${Math.min(space.members.length, 4)}, 1fr)`
        }}>
          {space.members.map((member: Member) => (
            <FamilyMemberColumn
              key={member.uid}
              member={member}
              habits={getMemberHabits(member.uid)}
              isCompleted={(habitId) => isCompleted(habitId, member.uid)}
              onComplete={(habitId) => handleComplete(habitId, member.uid)}
              onUndoComplete={(habitId) => handleUndoComplete(habitId, member.uid)}
              totalCompletions={getMemberTotalCompletions(member.uid)}
              onCelebrate={handleCelebration}
            />
          ))}
        </div>
      </div>

      {/* Celebration Overlay */}
      {celebrationState && (
        <CelebrationOverlay
          isOpen={celebrationState.isOpen}
          onClose={closeCelebration}
          type={celebrationState.type}
          title={celebrationState.title}
          subtitle={celebrationState.subtitle}
          emoji={celebrationState.emoji}
          memberName={celebrationState.memberName}
          memberPhotoURL={celebrationState.memberPhotoURL}
        />
      )}
    </>
  );
}
