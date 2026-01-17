'use client';

import { useAuth, SpaceGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Bell } from 'lucide-react';
import { FirestoreSync } from '@/components/FirestoreSync';
import { BottomNav } from '@/components/mobile/BottomNav';
import { ReminderSettings } from '@/components/reminders/ReminderSettings';
import { HabitReminderToggle } from '@/components/reminders/HabitReminderToggle';
import { useReminders } from '@/hooks/useReminders';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useGrowStore } from '@/lib/store';

function NotificationsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { habits } = useGrowStore();
  const { currentSpace } = useSpaces();
  
  const {
    getPreferences,
    savePreferences,
    getHabitReminder,
    updateHabitReminder,
    scheduleAllReminders,
  } = useReminders();

  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleSavePreferences = async (prefs: Parameters<typeof savePreferences>[0]) => {
    savePreferences(prefs);
    // Reschedule reminders with new preferences
    scheduleAllReminders();
  };

  const handleUpdateHabitReminder = (habitId: string, settings: Parameters<typeof updateHabitReminder>[1]) => {
    updateHabitReminder(habitId, settings);
    // Reschedule reminders
    scheduleAllReminders();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const spaceHabits = currentSpace
    ? habits.filter((h) => h.spaceId === currentSpace.id)
    : [];

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      appName="habits"
    >
      <FirestoreSync />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/workspace/settings"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-400" />
            Notifications
          </h1>
          <p className="text-sm text-white/50">Manage your reminders</p>
        </div>
      </div>

      <div className="max-w-xl space-y-8 pb-24">
        {/* Global Settings */}
        <ReminderSettings
          preferences={getPreferences()}
          onSave={handleSavePreferences}
        />

        {/* Per-Habit Reminders */}
        {spaceHabits.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">
              Habit Reminders
            </h2>
            <p className="text-xs text-white/50 mb-4 px-1">
              Set individual reminders for each habit
            </p>
            <div className="space-y-3">
              {spaceHabits.map((habit) => (
                <HabitReminderToggle
                  key={habit.id}
                  habitId={habit.id}
                  habitTitle={habit.title}
                  settings={getHabitReminder(habit.id)}
                  onUpdate={handleUpdateHabitReminder}
                />
              ))}
            </div>
          </div>
        )}

        {spaceHabits.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No habits to set reminders for</p>
            <p className="text-xs text-white/30 mt-1">
              Create some habits first, then come back here
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </WorkspaceLayout>
  );
}

export default function NotificationsPage() {
  return (
    <SpaceGuard appName="habits">
      <NotificationsContent />
    </SpaceGuard>
  );
}
