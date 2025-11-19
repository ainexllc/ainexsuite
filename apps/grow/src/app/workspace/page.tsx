'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Settings, Flame, Layout, Package, Crown, Activity } from 'lucide-react';

// Core Components
import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';
import { MemberManager } from '@/components/spaces/MemberManager';
import { HabitEditor } from '@/components/habits/HabitEditor';
import { HabitPacks } from '@/components/gamification/HabitPacks';
import { QuestBar } from '@/components/gamification/QuestBar';
import { WagerCard } from '@/components/gamification/WagerCard';
import { NudgeButton } from '@/components/gamification/NudgeButton';
import { FirestoreSync } from '@/components/FirestoreSync';
import { QuestEditor } from '@/components/gamification/QuestEditor';
import { NotificationBell } from '@/components/gamification/NotificationBell';
import { NotificationToast } from '@/components/gamification/NotificationToast';

// Analytics Components
import { ConsistencyChart } from '@/components/analytics/ConsistencyChart';
import { InsightsGrid } from '@/components/analytics/InsightsGrid';
import { TeamLeaderboard } from '@/components/analytics/TeamLeaderboard';

// Store & Types
import { useGrowStore } from '@/lib/store';
import { isHabitDueToday } from '@/lib/date-utils';
import { 
  calculateWeeklyConsistency, 
  getBestDayOfWeek, 
  calculateCompletionRate, 
  getTeamContribution 
} from '@/lib/analytics-utils';

function GrowWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Zustand Store
  const { 
    getCurrentSpace, 
    getSpaceHabits, 
    getSpaceQuests, 
    addCompletion,
    completions 
  } = useGrowStore();
  
  const currentSpace = getCurrentSpace();
  const habits = currentSpace ? getSpaceHabits(currentSpace.id) : [];
  const quests = currentSpace ? getSpaceQuests(currentSpace.id) : [];

  // Analytics Calculations
  const weeklyStats = calculateWeeklyConsistency(habits, completions);
  const bestDay = getBestDayOfWeek(completions);
  const totalCompletions = completions.length;
  const completionRate = habits.length > 0 
    ? Math.round(habits.reduce((acc, h) => acc + calculateCompletionRate(h, completions), 0) / habits.length)
    : 0;
  const teamStats = currentSpace ? getTeamContribution(currentSpace.members, completions) : [];

  // UI State
  const [showHabitEditor, setShowHabitEditor] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showHabitPacks, setShowHabitPacks] = useState(false);
  const [showQuestEditor, setShowQuestEditor] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | undefined>(undefined);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCompleteHabit = (habitId: string) => {
    if (!user || !currentSpace) return;
    addCompletion({
      id: `comp_${Date.now()}`,
      habitId,
      spaceId: currentSpace.id,
      userId: user.uid,
      date: new Date().toISOString().split('T')[0],
      completedAt: new Date().toISOString(),
    });
  };

  const getPartnerId = () => {
    if (!currentSpace || !user) return '';
    const partner = currentSpace.members.find(m => m.uid !== user.uid);
    return partner?.uid || '';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search habits & quests..."
      appName="Grow"
    >
      <FirestoreSync />
      <NotificationToast />
      
      {/* Header Actions - Custom for Grow */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <SpaceSwitcher />
          {currentSpace?.type !== 'personal' && (
            <button 
              onClick={() => setShowMemberManager(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
              title="Manage Members"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => setShowHabitPacks(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>Packs</span>
          </button>
          <button
            onClick={() => {
              setSelectedHabitId(undefined);
              setShowHabitEditor(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Quests Section (Squad/Couple Only) */}
      {currentSpace?.type !== 'personal' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Active Quests
            </h2>
            <button
              onClick={() => setShowQuestEditor(true)}
              className="text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              + New Quest
            </button>
          </div>
          
          {quests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quests.map(quest => (
                <QuestBar key={quest.id} quest={quest} />
              ))}
            </div>
          ) : (
            <div 
              onClick={() => setShowQuestEditor(true)}
              className="border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <Crown className="h-8 w-8 text-white/20 group-hover:text-yellow-400/50 mb-2 transition-colors" />
              <p className="text-sm text-white/50 group-hover:text-white/70">No active quests. Start a team challenge!</p>
            </div>
          )}
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Habits List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layout className="h-5 w-5 text-indigo-400" />
            Today's Focus
          </h2>

          {habits.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-white/50 mb-4">No habits yet. Start small!</p>
              <button 
                onClick={() => setShowHabitPacks(true)}
                className="text-indigo-400 text-sm hover:underline"
              >
                Browse Habit Packs
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map(habit => {
                // Simple MVP: Check if active. In real app, check completion status for today.
                const isDue = isHabitDueToday(habit);
                if (!isDue) return null;

                return (
                  <div 
                    key={habit.id} 
                    className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                      habit.isFrozen 
                        ? 'bg-blue-900/10 border-blue-500/20 opacity-70' 
                        : 'bg-[#1a1a1a] border-white/5 hover:border-white/10 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleCompleteHabit(habit.id)}
                        disabled={habit.isFrozen}
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          habit.isFrozen
                            ? 'border-blue-400/30 cursor-not-allowed'
                            : 'border-indigo-500 hover:bg-indigo-500/20'
                        }`}
                      >
                        {/* Checkmark logic would go here based on completions */}
                      </button>
                      
                      <div>
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                          {habit.title}
                          {habit.isFrozen && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Frozen</span>}
                        </h3>
                        {habit.description && <p className="text-xs text-white/40">{habit.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Streak */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                        <Flame className="h-3 w-3" />
                        {habit.currentStreak}
                      </div>

                      {/* Nudge (If Team/Couple) */}
                      {currentSpace?.type !== 'personal' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <NudgeButton 
                            targetName="Partner" 
                            targetId={getPartnerId()}
                            habitTitle={habit.title} 
                          />
                        </div>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setSelectedHabitId(habit.id);
                          setShowHabitEditor(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-white transition-all"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Analytics & Wagers */}
        <div className="space-y-6">
          
          {/* Analytics Module */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
              <Activity className="h-4 w-4" />
              Insights
            </div>
            <ConsistencyChart data={weeklyStats} />
            <InsightsGrid 
              bestDay={bestDay} 
              totalCompletions={totalCompletions} 
              completionRate={completionRate} 
            />
            {currentSpace?.type !== 'personal' && <TeamLeaderboard data={teamStats} />}
          </div>

          {/* Active Wagers */}
          {currentSpace?.type === 'couple' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Active Wagers</h3>
              {habits.filter(h => h.wager?.isActive).map(habit => (
                <WagerCard key={habit.id} habit={habit} />
              ))}
              {habits.filter(h => h.wager?.isActive).length === 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                  <p className="text-xs text-white/40">No active bets. Spice things up!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <HabitEditor 
        isOpen={showHabitEditor} 
        onClose={() => setShowHabitEditor(false)}
        editHabitId={selectedHabitId}
      />
      
      <MemberManager
        isOpen={showMemberManager}
        onClose={() => setShowMemberManager(false)}
      />

      <QuestEditor
        isOpen={showQuestEditor}
        onClose={() => setShowQuestEditor(false)}
      />

      {showHabitPacks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Habit Packs</h3>
              <button onClick={() => setShowHabitPacks(false)} className="text-white/50 hover:text-white">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <HabitPacks onClose={() => setShowHabitPacks(false)} />
          </div>
        </div>
      )}

    </WorkspaceLayout>
  );
}

export default function GrowWorkspacePage() {
  return (
    <SuiteGuard appName="grow">
      <GrowWorkspaceContent />
    </SuiteGuard>
  );
}
