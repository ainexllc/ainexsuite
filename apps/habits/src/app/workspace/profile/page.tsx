'use client';

import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  User,
  Trophy,
  Flame,
  Target,
  Calendar,
  Award,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { FirestoreSync } from '@/components/FirestoreSync';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useGrowStore } from '@/lib/store';
import { useMemo } from 'react';

function ProfileContent() {
  const { user, loading: authLoading, bootstrapStatus } = useAuth();
  const router = useRouter();
  const { habits, completions } = useGrowStore();
  const { currentSpace } = useSpaces();
  

  const stats = useMemo(() => {
    if (!currentSpace) return null;

    const spaceHabits = habits.filter((h) => h.spaceId === currentSpace.id);
    const spaceCompletions = completions.filter((c) =>
      spaceHabits.some((h) => h.id === c.habitId)
    );

    const totalCompletions = spaceCompletions.length;
    const currentStreaks = spaceHabits.reduce((sum, h) => sum + (h.currentStreak || 0), 0);
    const bestStreak = Math.max(...spaceHabits.map((h) => h.bestStreak || 0), 0);
    const activeHabits = spaceHabits.length;

    // Calculate days since first completion
    const firstCompletion = spaceCompletions
      .map((c) => new Date(c.date).getTime())
      .sort((a, b) => a - b)[0];
    const daysSinceStart = firstCompletion
      ? Math.floor((Date.now() - firstCompletion) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      totalCompletions,
      currentStreaks,
      bestStreak,
      activeHabits,
      daysSinceStart,
    };
  }, [habits, completions, currentSpace]);

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

  if (authLoading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const achievements = [
    {
      icon: Flame,
      title: 'First Streak',
      description: 'Complete a habit 3 days in a row',
      unlocked: stats && stats.bestStreak >= 3,
    },
    {
      icon: Target,
      title: 'Habit Builder',
      description: 'Create 5 habits',
      unlocked: stats && stats.activeHabits >= 5,
    },
    {
      icon: Trophy,
      title: 'Centurion',
      description: 'Complete 100 habits total',
      unlocked: stats && stats.totalCompletions >= 100,
    },
    {
      icon: Calendar,
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      unlocked: stats && stats.bestStreak >= 7,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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
          href="/workspace"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-400" />
            Profile
          </h1>
          <p className="text-sm text-white/50">Your progress and achievements</p>
        </div>
      </div>

      <div className="max-w-xl space-y-6">
        {/* User Info Card */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-16 w-16 rounded-full border-2 border-indigo-500"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-white">
                {user.displayName || 'Grow User'}
              </h2>
              <p className="text-sm text-white/50">{user.email}</p>
              {stats && stats.daysSinceStart > 0 && (
                <p className="text-xs text-indigo-400 mt-1">
                  Growing for {stats.daysSinceStart} days
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-white/50">Current Streaks</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.currentStreaks}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-white/50">Best Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.bestStreak}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-white/50">Active Habits</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.activeHabits}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-white/50">Completions</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalCompletions}</p>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Achievements
            </h2>
            <span className="text-xs text-indigo-400">
              {unlockedCount}/{achievements.length} unlocked
            </span>
          </div>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.title}
                  className={`flex items-center gap-4 p-4 ${
                    achievement.unlocked ? '' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : 'bg-white/5'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        achievement.unlocked ? 'text-white' : 'text-white/40'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{achievement.title}</p>
                    <p className="text-xs text-white/40">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Award className="h-5 w-5 text-amber-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">
            Account
          </h2>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            <Link
              href="/workspace/analytics"
              className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Target className="h-5 w-5 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">View Analytics</p>
                <p className="text-xs text-white/40">Detailed habit insights</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/20" />
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Sign Out</p>
                <p className="text-xs text-white/40">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center pt-4 pb-20">
          <p className="text-xs text-white/20">Grow v1.0.0</p>
        </div>
      </div>

      <BottomNav />
    </WorkspaceLayout>
  );
}

export default function ProfilePage() {
  return (
    <SuiteGuard appName="habits">
      <ProfileContent />
    </SuiteGuard>
  );
}
