/**
 * Wellness AI - Generates AI-powered insights from wellness data
 */

import { getTodayHealthSummary, getWellnessScore } from './wellness-hub';
import { getWeeklyWorkoutStats } from './fit-integration';
import { getTodayHabitProgress, getWeeklyHabitStats } from './habits-integration';

export interface WellnessInsight {
  type: 'positive' | 'warning' | 'suggestion' | 'correlation';
  message: string;
  action?: string;
  priority: number;
}

/**
 * Generate AI-powered wellness insights based on user data
 */
export async function generateWellnessInsights(): Promise<WellnessInsight[]> {
  const insights: WellnessInsight[] = [];

  try {
    // Fetch all wellness data in parallel
    const [healthSummary, wellnessScore, workoutStats, habitProgress, weeklyHabits] = await Promise.all([
      getTodayHealthSummary(),
      getWellnessScore(),
      getWeeklyWorkoutStats(),
      getTodayHabitProgress(),
      getWeeklyHabitStats(),
    ]);

    // Health-based insights
    if (healthSummary?.hasData) {
      // Sleep insights
      if (healthSummary.sleep) {
        if (healthSummary.sleep >= 7 && healthSummary.sleep <= 9) {
          insights.push({
            type: 'positive',
            message: `Great sleep last night! ${healthSummary.sleep} hours is in the optimal range.`,
            priority: 1,
          });
        } else if (healthSummary.sleep < 6) {
          insights.push({
            type: 'warning',
            message: `Only ${healthSummary.sleep} hours of sleep. Consider going to bed earlier tonight.`,
            action: 'Set bedtime reminder',
            priority: 2,
          });
        } else if (healthSummary.sleep > 9) {
          insights.push({
            type: 'suggestion',
            message: 'Oversleeping can affect energy. Try a consistent wake time.',
            priority: 3,
          });
        }
      }

      // Water intake insights
      if (healthSummary.water) {
        if (healthSummary.water >= 8) {
          insights.push({
            type: 'positive',
            message: `Excellent hydration! ${healthSummary.water} glasses keeps you energized.`,
            priority: 2,
          });
        } else if (healthSummary.water < 4) {
          insights.push({
            type: 'warning',
            message: `Low water intake today. Aim for 8 glasses to stay focused.`,
            action: 'Log water intake',
            priority: 1,
          });
        }
      }

      // Energy insights
      if (healthSummary.energy) {
        if (healthSummary.energy >= 8) {
          insights.push({
            type: 'positive',
            message: 'High energy today! Perfect time for challenging tasks.',
            priority: 3,
          });
        } else if (healthSummary.energy <= 4) {
          insights.push({
            type: 'suggestion',
            message: 'Low energy? A short walk or healthy snack might help.',
            action: 'Log a workout',
            priority: 2,
          });
        }
      }

      // Mood-based correlations
      if (healthSummary.mood && healthSummary.sleep) {
        if (['happy', 'excited', 'peaceful'].includes(healthSummary.mood) && healthSummary.sleep >= 7) {
          insights.push({
            type: 'correlation',
            message: 'Good mood correlates with quality sleep. Keep the pattern!',
            priority: 4,
          });
        }
      }
    }

    // Fitness insights
    if (workoutStats) {
      if (workoutStats.totalWorkouts >= 5) {
        insights.push({
          type: 'positive',
          message: `${workoutStats.totalWorkouts} workouts this week! You're crushing your fitness goals.`,
          priority: 1,
        });
      } else if (workoutStats.totalWorkouts === 0) {
        insights.push({
          type: 'suggestion',
          message: 'No workouts logged this week. Even 10 minutes of movement helps!',
          action: 'Start a workout',
          priority: 2,
        });
      } else if (workoutStats.totalWorkouts >= 3) {
        insights.push({
          type: 'positive',
          message: `${workoutStats.totalWorkouts} workouts so far. Great consistency!`,
          priority: 3,
        });
      }

      if (workoutStats.totalCalories && workoutStats.totalCalories > 1000) {
        insights.push({
          type: 'positive',
          message: `${workoutStats.totalCalories} calories burned this week. Strong effort!`,
          priority: 4,
        });
      }
    }

    // Habit insights
    if (habitProgress) {
      const completionPercent = Math.round(habitProgress.completionRate * 100);

      if (completionPercent === 100 && habitProgress.totalHabits > 0) {
        insights.push({
          type: 'positive',
          message: 'All habits completed today! Perfect day.',
          priority: 1,
        });
      } else if (completionPercent >= 80) {
        insights.push({
          type: 'positive',
          message: `${completionPercent}% habits done. Almost a perfect day!`,
          priority: 2,
        });
      } else if (completionPercent > 0 && completionPercent < 50) {
        const remaining = habitProgress.totalHabits - habitProgress.completedHabits;
        insights.push({
          type: 'suggestion',
          message: `${remaining} habits left today. Start with the easiest one!`,
          action: 'Open habits',
          priority: 2,
        });
      }

      // Streak insights
      if (habitProgress.topStreaks && habitProgress.topStreaks.length > 0) {
        const topStreak = habitProgress.topStreaks[0];
        if (topStreak.currentStreak >= 30) {
          insights.push({
            type: 'positive',
            message: `${topStreak.currentStreak}-day streak on "${topStreak.habitTitle}"! Incredible dedication.`,
            priority: 1,
          });
        } else if (topStreak.currentStreak >= 7) {
          insights.push({
            type: 'positive',
            message: `${topStreak.currentStreak}-day streak! Keep "${topStreak.habitTitle}" going.`,
            priority: 3,
          });
        }
      }
    }

    // Weekly habit trend
    if (weeklyHabits) {
      if (weeklyHabits.averageCompletionRate >= 0.8) {
        insights.push({
          type: 'positive',
          message: `${Math.round(weeklyHabits.averageCompletionRate * 100)}% weekly habit completion. Excellent consistency!`,
          priority: 2,
        });
      }
    }

    // Wellness score insights
    if (wellnessScore) {
      if (wellnessScore.overall >= 80) {
        insights.push({
          type: 'positive',
          message: `Wellness score of ${wellnessScore.overall}. You're in excellent shape!`,
          priority: 1,
        });
      } else if (wellnessScore.overall < 50) {
        // Find the weakest area
        const { breakdown } = wellnessScore;
        let weakest = 'health';
        let weakestScore = breakdown.health;
        if (breakdown.fitness < weakestScore) {
          weakest = 'fitness';
          weakestScore = breakdown.fitness;
        }
        if (breakdown.habits < weakestScore) {
          weakest = 'habits';
        }
        insights.push({
          type: 'suggestion',
          message: `Focus on ${weakest} to boost your wellness score.`,
          action: `Improve ${weakest}`,
          priority: 2,
        });
      }

      if (wellnessScore.trend === 'improving') {
        insights.push({
          type: 'positive',
          message: 'Your wellness trend is improving! Keep it up.',
          priority: 3,
        });
      } else if (wellnessScore.trend === 'declining') {
        insights.push({
          type: 'warning',
          message: 'Wellness score declining. Small consistent actions help.',
          priority: 2,
        });
      }
    }

    // Sort by priority and return top insights
    insights.sort((a, b) => a.priority - b.priority);
    return insights.slice(0, 5);
  } catch (error) {
    console.error('Failed to generate wellness insights:', error);
    return [];
  }
}
