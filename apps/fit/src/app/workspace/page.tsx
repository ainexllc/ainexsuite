'use client';

import { useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { WorkoutList } from '@/components/workout-list';
import { WorkoutEditor } from '@/components/workout-editor';
import { WorkoutComposer } from '@/components/workout-composer';
import { AIAssistant } from '@/components/ai-assistant';
import { FitInsights } from '@/components/fit-insights';
import { Dumbbell, Loader2, Trophy } from 'lucide-react';

// New Components
import { BuddySwitcher } from '@/components/social/BuddySwitcher';
import { Leaderboard } from '@/components/social/Leaderboard';
import { SharedWorkoutFeed } from '@/components/social/SharedWorkoutFeed';
import { ChallengeEditor } from '@/components/social/ChallengeEditor';
import { FitFirestoreSync } from '@/components/FitFirestoreSync';

import { useFitStore } from '@/lib/store';
import { Workout } from '@/types/models';

function FitWorkspaceContent() {
  const { user, loading: authLoading, bootstrapStatus } = useAuth();
  const router = useRouter();
  
  // Store
  const { getCurrentSpace, workouts, addWorkout, updateWorkout } = useFitStore();
  const currentSpace = getCurrentSpace();
  
  const [showEditor, setShowEditor] = useState(false);
  const [showChallengeEditor, setShowChallengeEditor] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [mobileInsightsExpanded, setMobileInsightsExpanded] = useState(false);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

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

  // Show loading while authenticating or bootstrapping
  if (authLoading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search workouts..."
      appName="Fit"
    >
      <FitFirestoreSync />

      <div className="max-w-7xl mx-auto">
        {/* Mobile: Condensed AI Insights at top (hidden on xl+) */}
        <div className="xl:hidden mb-4">
          {mobileInsightsExpanded ? (
            <FitInsights
              variant="sidebar"
              onExpand={() => setMobileInsightsExpanded(false)}
            />
          ) : (
            <FitInsights
              variant="condensed"
              onExpand={() => setMobileInsightsExpanded(true)}
            />
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <BuddySwitcher />
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

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Workout Composer - Entry point like Notes */}
            <WorkoutComposer onWorkoutCreated={handleUpdate} />

            {/* Squad Feed (only if not personal) */}
            {currentSpace?.type !== 'personal' && (
              <SharedWorkoutFeed />
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

          {/* Sidebar - AI Insights + Leaderboard */}
          <div className="sticky top-28 hidden h-fit flex-col gap-6 xl:flex">
            <FitInsights variant="sidebar" />
            <Leaderboard />
          </div>
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
