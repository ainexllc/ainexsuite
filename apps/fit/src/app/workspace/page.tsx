'use client';

import { useState } from 'react';
import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { WorkoutList } from '@/components/workout-list';
import { WorkoutEditor } from '@/components/workout-editor';
import { WorkoutComposer } from '@/components/workout-composer';
import { AIAssistant } from '@/components/ai-assistant';
import { FitInsights } from '@/components/fit-insights';
import { Dumbbell, Trophy } from 'lucide-react';

// New Components
import { SpaceSwitcher } from '@/components/spaces';
import { Leaderboard } from '@/components/social/Leaderboard';
import { SharedWorkoutFeed } from '@/components/social/SharedWorkoutFeed';
import { ChallengeEditor } from '@/components/social/ChallengeEditor';
import { FitFirestoreSync } from '@/components/FitFirestoreSync';

import { useFitStore } from '@/lib/store';
import { Workout } from '@/types/models';

function FitWorkspaceContent() {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();
  
  // Store
  const { getCurrentSpace, workouts, addWorkout, updateWorkout } = useFitStore();
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

  // Show standardized loading screen
  if (isLoading) {
    return <WorkspaceLoadingScreen />;
  }

  // Return null while redirecting
  if (!isReady || !user) {
    return null;
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search workouts..."
      appName="Fit"
    >
      <FitFirestoreSync />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Insights Banner - Full Width at Top */}
        <FitInsights variant="sidebar" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <SpaceSwitcher />
          </div>

          <div className="flex items-center gap-3">
             {currentSpace?.type !== 'personal' && (
               <button
                 onClick={() => setShowChallengeEditor(true)}
                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-medium transition-colors border border-orange-500/20"
               >
                 <Trophy className="h-4 w-4" />
                 <span>Start Challenge</span>
               </button>
             )}
          </div>
        </div>

        {/* Workout Composer - Entry point like Notes */}
        <WorkoutComposer onWorkoutCreated={handleUpdate} />

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-orange-500" />
              My Logs
            </h2>
          </div>

          {workouts.filter((w: Workout) => w.userId === user.uid).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-white/10 rounded-2xl bg-surface-elevated/50">
              <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Your Fitness Journey</h3>
              <p className="text-white/50 mb-6 text-center max-w-md">
                Track your workouts, visualize progress, and crush your goals.
                Click &ldquo;Log a workout...&rdquo; above to get started!
              </p>
            </div>
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
      </div>

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
    </WorkspaceLayout>
  );
}

export default function FitWorkspacePage() {
  return (
    <SuiteGuard appName="fit">
      <FitWorkspaceContent />
    </SuiteGuard>
  );
}
