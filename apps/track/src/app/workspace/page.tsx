'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspacePageHeader } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import type { Habit, HabitCompletion } from '@ainexsuite/types';
import { getHabits, getCompletions } from '@/lib/habits';
import { HabitList } from '@/components/habit-list';
import { HabitEditor } from '@/components/habit-editor';
import { HabitCalendar } from '@/components/habit-calendar';
import { Stats } from '@/components/stats';
import { AIAssistant } from '@/components/ai-assistant';
import { Plus, TrendingUp, Loader2 } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

function TrackWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isCreatingHabit, setIsCreatingHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      void loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDate]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      // Ignore sign out error
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      const [fetchedHabits, fetchedCompletions] = await Promise.all([
        getHabits(),
        getCompletions(start, end),
      ]);
      setHabits(fetchedHabits);
      setCompletions(fetchedCompletions);
    } catch (error) {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  };

  const activeHabits = habits.filter((h) => h.active);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search habits..."
      appName="Track"
    >
      <WorkspacePageHeader
        title={`Welcome to Track, ${user.displayName ? user.displayName.split(' ')[0] : 'there'}!`}
        description={`${activeHabits.length} active ${activeHabits.length === 1 ? 'habit' : 'habits'}`}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-end">
              <button
                onClick={() => setIsCreatingHabit(true)}
                className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium transition-colors"
                type="button"
              >
                <Plus className="h-5 w-5" />
                New Habit
              </button>
            </div>

            {activeHabits.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-surface-elevated border border-outline-subtle">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-text-muted" />
                <p className="text-text-muted mb-4">No habits yet</p>
                <button
                  onClick={() => setIsCreatingHabit(true)}
                  className="text-accent-500 hover:text-accent-600 font-medium"
                  type="button"
                >
                  Create your first habit
                </button>
              </div>
            ) : (
              <HabitList
                habits={activeHabits}
                completions={completions}
                onHabitClick={(habit) => setSelectedHabit(habit)}
                onHabitEdit={(habit) => setEditingHabit(habit)}
                onUpdate={loadData}
              />
            )}
          </div>

          <div className="space-y-6">
            <Stats habits={activeHabits} completions={completions} />

            {selectedHabit && (
              <HabitCalendar
                habit={selectedHabit}
                completions={completions.filter((c) => c.habitId === selectedHabit.id)}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onUpdate={loadData}
              />
            )}
          </div>
        </div>
      </div>

      {(isCreatingHabit || editingHabit) && (
        <HabitEditor
          habit={editingHabit}
          onClose={() => {
            setIsCreatingHabit(false);
            setEditingHabit(null);
          }}
          onSave={() => {
            void loadData();
            setIsCreatingHabit(false);
            setEditingHabit(null);
          }}
        />
      )}

      <AIAssistant />
    </WorkspaceLayout>
  );
}

export default function TrackWorkspacePage() {
  return (
    <SuiteGuard appName="track">
      <TrackWorkspaceContent />
    </SuiteGuard>
  );
}