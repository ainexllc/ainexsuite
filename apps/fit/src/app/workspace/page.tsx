'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { SectionHeader, EmptyState, WorkspacePageLayout } from '@ainexsuite/ui';
import { WorkoutList } from '@/components/workout-list';
import { WorkoutEditor } from '@/components/workout-editor';
import { WorkoutComposer } from '@/components/workout-composer';
import { AIAssistant } from '@/components/ai-assistant';
import { FitInsights } from '@/components/fit-insights';
import { Dumbbell, Trophy } from 'lucide-react';

// New Components
import { Leaderboard } from '@/components/social/Leaderboard';
import { SharedWorkoutFeed } from '@/components/social/SharedWorkoutFeed';
import { ChallengeEditor } from '@/components/social/ChallengeEditor';
import { FitFirestoreSync } from '@/components/FitFirestoreSync';

import { useFitStore } from '@/lib/store';
import { Workout } from '@/types/models';

export default function FitWorkspacePage() {
  const { user } = useWorkspaceAuth();

  // Store
  const { getCurrentSpace, spaces, currentSpaceId, setCurrentSpace, workouts, addWorkout, updateWorkout } = useFitStore();
  const currentSpace = getCurrentSpace();

  const [showEditor, setShowEditor] = useState(false);
  const [showChallengeEditor, setShowChallengeEditor] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const handleUpdate = async () => {
    // Refresh logic handled by Firestore subscription automatically now
    setShowEditor(false);
    setSelectedWorkout(null);
  };

  const handleSaveWorkout = async (workoutData: Partial<Workout>) => {
    if (!user) return;

    if (!currentSpace) {
      alert('No workout space found. Please refresh or create a space.');
      return;
    }

    // If editing an existing workout, update it
    if (selectedWorkout?.id) {
      await updateWorkout(selectedWorkout.id, {
        title: workoutData.title || 'Workout',
        date: workoutData.date || new Date().toISOString(),
        duration: workoutData.duration || 0,
        exercises: workoutData.exercises || [],
      });
    } else {
      // Create new workout
      const newWorkout: Workout = {
        id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spaceId: currentSpace.id,
        userId: user.uid,
        title: workoutData.title || 'Workout',
        date: workoutData.date || new Date().toISOString(),
        duration: workoutData.duration || 0,
        exercises: workoutData.exercises || [],
      };
      await addWorkout(newWorkout);
    }

    setShowEditor(false);
    setSelectedWorkout(null);
  };

  if (!user) return null;

  // Map spaces for WorkspacePageLayout - use SpaceType union
  const spaceItems = spaces.map((space) => ({
    id: space.id,
    name: space.name,
    type: space.type as 'personal' | 'family' | 'work' | 'couple' | 'buddy' | 'squad' | 'project',
  }));

  return (
    <>
      <FitFirestoreSync />

      <WorkspacePageLayout
        insightsBanner={<FitInsights variant="sidebar" />}
        composer={<WorkoutComposer onWorkoutCreated={handleUpdate} />}
        spaces={{
          items: spaceItems,
          currentSpaceId: currentSpaceId,
          onSpaceChange: setCurrentSpace,
        }}
        composerActions={
          currentSpace?.type !== 'personal' ? (
            <button
              onClick={() => setShowChallengeEditor(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-medium transition-colors border border-orange-500/20"
            >
              <Trophy className="h-4 w-4" />
              <span>Start Challenge</span>
            </button>
          ) : null
        }
      >
        {/* Squad Feed (only if not personal) */}
        {currentSpace?.type !== 'personal' && (
          <SharedWorkoutFeed />
        )}

        {/* Leaderboard - Full Width */}
        {currentSpace?.type !== 'personal' && (
          <Leaderboard />
        )}

        {/* My Workouts List */}
        <div>
          <SectionHeader
            title="My Logs"
            icon={<Dumbbell className="h-5 w-5" />}
            className="mb-4"
          />

          {workouts.filter((w: Workout) => w.userId === user.uid).length === 0 ? (
            <EmptyState
              title="Start Your Fitness Journey"
              description="Track your workouts, visualize progress, and crush your goals. Click 'Log a workout...' above to get started!"
              icon={Dumbbell}
              variant="illustrated"
            />
          ) : (
            <WorkoutList
              workouts={workouts.filter((w: Workout) => w.userId === user.uid)}
              onEdit={(workout) => {
                setSelectedWorkout(workout);
                setShowEditor(true);
              }}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </WorkspacePageLayout>

      {showEditor && (
        <WorkoutEditor
          workout={selectedWorkout}
          onClose={() => {
            setShowEditor(false);
            setSelectedWorkout(null);
          }}
          onSave={handleSaveWorkout}
        />
      )}

      <ChallengeEditor
        isOpen={showChallengeEditor}
        onClose={() => setShowChallengeEditor(false)}
      />

      <AIAssistant />
    </>
  );
}
