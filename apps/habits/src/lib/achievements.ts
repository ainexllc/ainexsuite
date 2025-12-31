import { Habit, Completion, ACHIEVEMENT_MILESTONES, ComputedAchievement } from '@/types/models';
import { calculateStreak } from './date-utils';

/**
 * Compute all achievements based on habits and completions.
 */
export function computeAchievements(
  habits: Habit[],
  completions: Completion[]
): ComputedAchievement[] {
  const activeHabits = habits.filter(h => !h.isFrozen);

  // Calculate metrics
  const bestStreak = Math.max(0, ...habits.map(h => calculateStreak(h, completions)));
  const totalCompletions = completions.length;
  const habitCount = activeHabits.length;

  return ACHIEVEMENT_MILESTONES.map(milestone => {
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
      default:
        break;
    }

    return {
      milestone,
      progress,
      unlocked,
    };
  });
}

/**
 * Get only unlocked achievements.
 */
export function getUnlockedAchievements(
  habits: Habit[],
  completions: Completion[]
): ComputedAchievement[] {
  return computeAchievements(habits, completions).filter(a => a.unlocked);
}

/**
 * Get the next achievement to unlock for each type.
 */
export function getNextAchievements(
  habits: Habit[],
  completions: Completion[]
): ComputedAchievement[] {
  const all = computeAchievements(habits, completions);
  const nextByType: Record<string, ComputedAchievement | null> = {};

  // Group by type and find first locked achievement
  for (const achievement of all) {
    const type = achievement.milestone.type;
    if (!nextByType[type] && !achievement.unlocked) {
      nextByType[type] = achievement;
    }
  }

  return Object.values(nextByType).filter((a): a is ComputedAchievement => a !== null);
}

/**
 * Get achievement stats summary.
 */
export function getAchievementStats(
  habits: Habit[],
  completions: Completion[]
): {
  total: number;
  unlocked: number;
  percentage: number;
  recentUnlock?: ComputedAchievement;
} {
  const all = computeAchievements(habits, completions);
  const unlocked = all.filter(a => a.unlocked);

  return {
    total: all.length,
    unlocked: unlocked.length,
    percentage: Math.round((unlocked.length / all.length) * 100),
    recentUnlock: unlocked[unlocked.length - 1],
  };
}
