"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@ainexsuite/auth";
import { db } from "@ainexsuite/firebase";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { Trophy, Lock, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

// Achievement milestones (simplified from habits app)
const ACHIEVEMENT_MILESTONES = [
  // Streak achievements
  { id: 'streak_7', type: 'streak', threshold: 7, title: '7-Day Warrior', icon: '🔥', color: '#f59e0b', tier: 'bronze' },
  { id: 'streak_14', type: 'streak', threshold: 14, title: 'Two Week Champion', icon: '⚡', color: '#f97316', tier: 'silver' },
  { id: 'streak_30', type: 'streak', threshold: 30, title: 'Monthly Master', icon: '🏆', color: '#eab308', tier: 'gold' },
  { id: 'streak_60', type: 'streak', threshold: 60, title: 'Habit Hero', icon: '💎', color: '#8b5cf6', tier: 'platinum' },
  { id: 'streak_100', type: 'streak', threshold: 100, title: 'Century Legend', icon: '👑', color: '#06b6d4', tier: 'diamond' },
  // Total completions
  { id: 'total_10', type: 'total_completions', threshold: 10, title: 'Getting Started', icon: '🌱', color: '#22c55e', tier: 'bronze' },
  { id: 'total_50', type: 'total_completions', threshold: 50, title: 'Building Momentum', icon: '🚀', color: '#3b82f6', tier: 'silver' },
  { id: 'total_100', type: 'total_completions', threshold: 100, title: 'Century Club', icon: '💯', color: '#eab308', tier: 'gold' },
  { id: 'total_500', type: 'total_completions', threshold: 500, title: 'Habit Machine', icon: '⭐', color: '#8b5cf6', tier: 'platinum' },
  { id: 'total_1000', type: 'total_completions', threshold: 1000, title: 'Legendary', icon: '🌟', color: '#06b6d4', tier: 'diamond' },
  // Active habits
  { id: 'habits_3', type: 'habit_count', threshold: 3, title: 'Triple Threat', icon: '🎯', color: '#10b981', tier: 'bronze' },
  { id: 'habits_5', type: 'habit_count', threshold: 5, title: 'High Five', icon: '🖐️', color: '#f59e0b', tier: 'silver' },
  { id: 'habits_10', type: 'habit_count', threshold: 10, title: 'Perfect Ten', icon: '🔟', color: '#eab308', tier: 'gold' },
];

interface AchievementData {
  unlocked: number;
  total: number;
  recentUnlocked: Array<{ id: string; icon: string; title: string; color: string }>;
  nextToUnlock: { id: string; title: string; icon: string; progress: number; threshold: number; color: string } | null;
}

export function AchievementsWidget() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementData>({
    unlocked: 0,
    total: ACHIEVEMENT_MILESTONES.length,
    recentUnlocked: [],
    nextToUnlock: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];
    const data: {
      habits: Array<{ id: string; currentStreak: number; bestStreak: number; isFrozen: boolean }>;
      completionsCount: number;
    } = {
      habits: [],
      completionsCount: 0,
    };

    const calculate = () => {
      const activeHabits = data.habits.filter(h => !h.isFrozen);
      const bestStreak = Math.max(0, ...data.habits.map(h => h.bestStreak || h.currentStreak || 0));
      const totalCompletions = data.completionsCount;
      const habitCount = activeHabits.length;

      const computed = ACHIEVEMENT_MILESTONES.map(milestone => {
        let progress = 0;
        let unlocked = false;

        switch (milestone.type) {
          case 'streak':
            progress = bestStreak;
            unlocked = bestStreak >= milestone.threshold;
            break;
          case 'total_completions':
            progress = totalCompletions;
            unlocked = totalCompletions >= milestone.threshold;
            break;
          case 'habit_count':
            progress = habitCount;
            unlocked = habitCount >= milestone.threshold;
            break;
        }

        return { ...milestone, progress, unlocked };
      });

      const unlockedAchievements = computed.filter(a => a.unlocked);
      const lockedAchievements = computed.filter(a => !a.unlocked);

      // Find next achievement to unlock (first locked one of each type)
      const nextByType: Record<string, typeof computed[0] | null> = {};
      for (const achievement of lockedAchievements) {
        if (!nextByType[achievement.type]) {
          nextByType[achievement.type] = achievement;
        }
      }
      const nextAchievements = Object.values(nextByType).filter(Boolean);
      // Pick the one with highest progress percentage
      const nextToUnlock = nextAchievements.length > 0
        ? nextAchievements.reduce((best, curr) => {
            if (!best) return curr;
            if (!curr) return best;
            const bestPct = best.progress / best.threshold;
            const currPct = curr.progress / curr.threshold;
            return currPct > bestPct ? curr : best;
          }, null as typeof computed[0] | null)
        : null;

      setAchievements({
        unlocked: unlockedAchievements.length,
        total: ACHIEVEMENT_MILESTONES.length,
        recentUnlocked: unlockedAchievements.slice(-3).reverse().map(a => ({
          id: a.id,
          icon: a.icon,
          title: a.title,
          color: a.color,
        })),
        nextToUnlock: nextToUnlock ? {
          id: nextToUnlock.id,
          title: nextToUnlock.title,
          icon: nextToUnlock.icon,
          progress: nextToUnlock.progress,
          threshold: nextToUnlock.threshold,
          color: nextToUnlock.color,
        } : null,
      });
      setLoading(false);
    };

    // Subscribe to habits
    const habitsQuery = query(
      collection(db, 'habits'),
      where('ownerId', '==', user.uid),
      limit(50)
    );

    unsubscribes.push(
      onSnapshot(habitsQuery, (snapshot) => {
        data.habits = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            currentStreak: d.currentStreak || 0,
            bestStreak: d.bestStreak || 0,
            isFrozen: d.isFrozen || false,
          };
        });
        calculate();
      }, () => {
        data.habits = [];
        calculate();
      })
    );

    // Subscribe to completions count
    const completionsQuery = query(
      collection(db, 'completions'),
      where('userId', '==', user.uid),
      limit(1000)
    );

    unsubscribes.push(
      onSnapshot(completionsQuery, (snapshot) => {
        data.completionsCount = snapshot.size;
        calculate();
      }, () => {
        data.completionsCount = 0;
        calculate();
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="font-semibold text-ink-900">Achievements</h2>
        <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-4">
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-300 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="font-semibold text-ink-900">Achievements</h2>
        </div>
        <span className="text-sm text-ink-500">
          {achievements.unlocked}/{achievements.total} unlocked
        </span>
      </div>

      <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-4">
        {achievements.unlocked === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <Lock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium text-ink-700">No achievements yet</p>
              <p className="text-sm text-ink-500">Start building habits to unlock achievements!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recent unlocked achievements */}
            <div>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
                Recently Unlocked
              </p>
              <div className="flex gap-3">
                {achievements.recentUnlocked.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center gap-1"
                    title={achievement.title}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                      style={{ backgroundColor: `${achievement.color}20` }}
                    >
                      {achievement.icon}
                    </div>
                    <span className="text-xs text-ink-600 text-center line-clamp-1 max-w-[60px]">
                      {achievement.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next achievement to unlock */}
            {achievements.nextToUnlock && (
              <div
                className={clsx(
                  "flex items-center gap-3 rounded-lg p-3 transition-colors",
                  "bg-surface-muted/50 hover:bg-surface-muted"
                )}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl opacity-50"
                  style={{ backgroundColor: `${achievements.nextToUnlock.color}15` }}
                >
                  {achievements.nextToUnlock.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-700">
                      {achievements.nextToUnlock.title}
                    </span>
                    <span className="text-xs text-ink-500">
                      {achievements.nextToUnlock.progress}/{achievements.nextToUnlock.threshold}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-outline-subtle/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (achievements.nextToUnlock.progress / achievements.nextToUnlock.threshold) * 100)}%`,
                        backgroundColor: achievements.nextToUnlock.color,
                      }}
                    />
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-400" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
