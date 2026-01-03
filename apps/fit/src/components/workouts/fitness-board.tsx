'use client';

import { useState, useMemo } from 'react';
import { Dumbbell, Clock, Flame, TrendingUp, Loader2 } from 'lucide-react';
import { useAppColors } from '@ainexsuite/theme';
import { useWorkouts } from '@/components/providers/workouts-provider';
import { WorkoutComposer } from './workout-composer';
import { WorkoutList } from './workout-list';
import { WorkoutEditor } from './workout-editor';
import type { Workout } from '@/lib/types/workout';

interface FitnessBoardProps {
  className?: string;
}

export function FitnessBoard({ className }: FitnessBoardProps) {
  const { primary } = useAppColors();
  const { workouts, isLoading, updateWorkout } = useWorkouts();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString();

    const recentWorkouts = workouts.filter((w) => w.date >= startDate);
    const totalWorkouts = recentWorkouts.length;
    const totalDuration = recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      averageDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
    };
  }, [workouts]);

  const handleSaveWorkout = async (data: Partial<Workout>) => {
    if (!data.id) return;
    await updateWorkout(data.id, data);
    setEditingWorkout(null);
  };

  return (
    <div className={className}>
      {/* Weekly Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-2xl border border-border bg-background/60 backdrop-blur-xl"
          style={{ borderColor: `${primary}30` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${primary}20` }}
            >
              <Dumbbell className="h-4 w-4" style={{ color: primary }} />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">This Week</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{weeklyStats.totalWorkouts}</div>
          <div className="text-xs text-muted-foreground">workouts</div>
        </div>

        <div
          className="p-4 rounded-2xl border border-border bg-background/60 backdrop-blur-xl"
          style={{ borderColor: `${primary}30` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${primary}20` }}
            >
              <Clock className="h-4 w-4" style={{ color: primary }} />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Duration</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{weeklyStats.totalDuration}</div>
          <div className="text-xs text-muted-foreground">minutes</div>
        </div>

        <div
          className="p-4 rounded-2xl border border-border bg-background/60 backdrop-blur-xl"
          style={{ borderColor: `${primary}30` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${primary}20` }}
            >
              <Flame className="h-4 w-4" style={{ color: primary }} />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Calories</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{weeklyStats.totalCalories || '—'}</div>
          <div className="text-xs text-muted-foreground">burned</div>
        </div>

        <div
          className="p-4 rounded-2xl border border-border bg-background/60 backdrop-blur-xl"
          style={{ borderColor: `${primary}30` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${primary}20` }}
            >
              <TrendingUp className="h-4 w-4" style={{ color: primary }} />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Average</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{weeklyStats.averageDuration}</div>
          <div className="text-xs text-muted-foreground">min/workout</div>
        </div>
      </div>

      {/* Workout Composer */}
      <WorkoutComposer />

      {/* Workouts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: primary }} />
        </div>
      ) : (
        <WorkoutList workouts={workouts} onEdit={setEditingWorkout} />
      )}

      {/* Workout Editor Modal */}
      {editingWorkout && (
        <WorkoutEditor
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onSave={handleSaveWorkout}
        />
      )}
    </div>
  );
}
