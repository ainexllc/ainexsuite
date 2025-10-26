'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { Workout } from '@ainexsuite/types';
import { TopNav } from '@/components/top-nav';
import { WorkoutList } from '@/components/workout-list';
import { WorkoutEditor } from '@/components/workout-editor';
import { AIAssistant } from '@/components/ai-assistant';
import { getWorkouts } from '@/lib/fitness';
import { Plus, Dumbbell } from 'lucide-react';

function FitWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadWorkouts = async () => {
      setLoading(true);
      try {
        const data = await getWorkouts(30);
        setWorkouts(data);
      } catch (error) {
        console.error('Failed to load workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    const data = await getWorkouts(30);
    setWorkouts(data);
    setShowEditor(false);
    setSelectedWorkout(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading workouts...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Dumbbell className="h-16 w-16 text-ink-600 mx-auto" />
          <p className="text-ink-600">Please sign in to track your workouts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {workouts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Dumbbell className="h-16 w-16 text-ink-600 mx-auto" />
            <p className="text-ink-600">No workouts yet. Start tracking your fitness journey!</p>
          </div>
        ) : (
          <WorkoutList
            workouts={workouts}
            onEdit={(workout) => {
              setSelectedWorkout(workout);
              setShowEditor(true);
            }}
            onUpdate={handleUpdate}
          />
        )}
      </main>

      <button
        onClick={() => {
          setSelectedWorkout(null);
          setShowEditor(true);
        }}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        type="button"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {showEditor && (
        <WorkoutEditor
          workout={selectedWorkout}
          onClose={() => {
            setShowEditor(false);
            setSelectedWorkout(null);
          }}
          onSave={handleUpdate}
        />
      )}

      <AIAssistant />
    </div>
  );
}

export default function FitWorkspacePage() {
  return (
    <SuiteGuard appName="fit">
      <FitWorkspaceContent />
    </SuiteGuard>
  );
}

