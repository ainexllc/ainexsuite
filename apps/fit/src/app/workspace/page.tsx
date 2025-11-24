'use client';

import { useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { WorkoutList } from '@/components/workout-list';
import { WorkoutEditor } from '@/components/workout-editor';
import { AIAssistant } from '@/components/ai-assistant';
import { Plus, Dumbbell, Loader2, Trophy } from 'lucide-react';

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
  const { getCurrentSpace, workouts, addWorkout } = useFitStore();
  const currentSpace = getCurrentSpace();
  
  const [showEditor, setShowEditor] = useState(false);
  const [showChallengeEditor, setShowChallengeEditor] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

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
    if (!user || !currentSpace) return;
    
    // Convert legacy workout format to new model if needed
    // Our new addWorkout expects a Workout object
    const newWorkout: Workout = {
      id: selectedWorkout?.id || `workout_${Date.now()}`,
      spaceId: currentSpace.id,
      userId: user.uid,
      title: workoutData.title || 'Workout',
      date: workoutData.date || new Date().toISOString(),
      duration: workoutData.duration || 0,
      exercises: workoutData.exercises || [],
      // Map other fields as needed or use defaults
    };
    
    await addWorkout(newWorkout);
    setShowEditor(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
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
                    Log your first session to get started!
                  </p>
                  <button
                    onClick={() => {
                      setSelectedWorkout(null);
                      setShowEditor(true);
                    }}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Log Workout
                  </button>
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

          {/* Sidebar */}
          <div className="space-y-6">
            <Leaderboard />
            {/* Add Weekly Volume Stats here later */}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setSelectedWorkout(null);
          setShowEditor(true);
        }}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        type="button"
        aria-label="Log workout"
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
