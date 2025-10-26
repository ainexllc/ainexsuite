'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { Habit, HabitCompletion } from '@ainexsuite/types';
import { getHabits, getCompletions } from '@/lib/habits';
import { TopNav } from '@/components/top-nav';
import { HabitList } from '@/components/habit-list';
import { HabitEditor } from '@/components/habit-editor';
import { HabitCalendar } from '@/components/habit-calendar';
import { Stats } from '@/components/stats';
import { AIAssistant } from '@/components/ai-assistant';
import { Plus, TrendingUp } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

function TrackWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
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
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeHabits = habits.filter((h) => !h.archived);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading habits...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Please sign in to view your habits.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base">
      <TopNav />

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Habits</h1>
                <p className="text-ink-600">
                  {activeHabits.length} active {activeHabits.length === 1 ? 'habit' : 'habits'}
                </p>
              </div>

              <button
                onClick={() => setIsCreatingHabit(true)}
                className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium transition-colors"
                type="button"
              >
                <Plus className="h-5 w-5" />
                New Habit
              </button>
            </div>

            {activeHabits.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-ink-600" />
                <p className="text-ink-600 mb-4">No habits yet</p>
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
      </main>

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
    </div>
  );
}

export default function TrackWorkspacePage() {
  return (
    <SuiteGuard appName="track">
      <TrackWorkspaceContent />
    </SuiteGuard>
  );
}

