'use client';

import { useState } from 'react';
import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import { Plus, Settings, Layout, Package, Crown, Sparkles, BarChart3, Rocket } from 'lucide-react';
import Link from 'next/link';

// Core Components
import { SpaceSwitcher } from '@/components/spaces/SpaceSwitcher';
import { MemberManager } from '@/components/spaces/MemberManager';
import { HabitEditor } from '@/components/habits/HabitEditor';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitPacks } from '@/components/gamification/HabitPacks';
import { QuestBar } from '@/components/gamification/QuestBar';
import { WagerCard } from '@/components/gamification/WagerCard';
import { FirestoreSync } from '@/components/FirestoreSync';
import { QuestEditor } from '@/components/gamification/QuestEditor';
import { NotificationBell } from '@/components/gamification/NotificationBell';
import { NotificationToast } from '@/components/gamification/NotificationToast';
import { HabitSuggester } from '@/components/ai/HabitSuggester';
import { AIInsightsBanner } from '@/components/ai/AIInsightsBanner';
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { EmptyState } from '@ainexsuite/ui';
import { BottomNav } from '@/components/mobile/BottomNav';

// Analytics Components
import { CombinedInsights } from '@/components/analytics/CombinedInsights';
import { TeamLeaderboard } from '@/components/analytics/TeamLeaderboard';

// Store & Types
import { useGrowStore } from '@/lib/store';
import { getHabitStatus, getTodayDateString } from '@/lib/date-utils';
import { Habit, Member, Quest } from '@/types/models';
import {
  calculateWeeklyConsistency,
  getBestDayOfWeek,
  calculateCompletionRate,
  getTeamContribution
} from '@/lib/analytics-utils';
import { canCreateHabit } from '@/lib/permissions';

function GrowWorkspaceContent() {
  const { user, isLoading, isReady, handleSignOut, bootstrapStatus } = useWorkspaceAuth();
  
  // Zustand Store
  const {
    spaces,
    getCurrentSpace,
    getSpaceHabits,
    getSpaceQuests,
    addCompletion,
    removeCompletion,
    completions
  } = useGrowStore();

  // Onboarding state - show if no spaces exist after initial load
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  
  const currentSpace = getCurrentSpace();
  const habits = currentSpace ? getSpaceHabits(currentSpace.id) : [];
  const quests = currentSpace ? getSpaceQuests(currentSpace.id) : [];

  // Permission check for habit creation
  const createPermission = currentSpace && user
    ? canCreateHabit(currentSpace, user.uid)
    : { allowed: false, reason: 'No space selected' };

  // Analytics Calculations
  const weeklyStats = calculateWeeklyConsistency(habits, completions);
  const bestDay = getBestDayOfWeek(completions);
  const totalCompletions = completions.length;
  const completionRate = habits.length > 0
    ? Math.round(habits.reduce((acc: number, h: Habit) => acc + calculateCompletionRate(h, completions), 0) / habits.length)
    : 0;
  const teamStats = currentSpace ? getTeamContribution(currentSpace.members, completions) : [];

  // UI State
  const [showHabitEditor, setShowHabitEditor] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showHabitPacks, setShowHabitPacks] = useState(false);
  const [showQuestEditor, setShowQuestEditor] = useState(false);
  const [showAISuggester, setShowAISuggester] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | undefined>(undefined);


  const handleCompleteHabit = (habitId: string) => {
    if (!user || !currentSpace) return;
    addCompletion({
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      habitId,
      spaceId: currentSpace.id,
      userId: user.uid,
      date: getTodayDateString(),
      completedAt: new Date().toISOString(),
    });
  };

  const handleUndoComplete = (habitId: string) => {
    removeCompletion(habitId);
  };

  const handleEditHabit = (habitId: string) => {
    setSelectedHabitId(habitId);
    setShowHabitEditor(true);
  };

  const getPartnerId = () => {
    if (!currentSpace || !user) return '';
    const partner = currentSpace.members.find((m: Member) => m.uid !== user.uid);
    return partner?.uid || '';
  };

  // Show standardized loading screen
  if (isLoading) {
    return <WorkspaceLoadingScreen />;
  }

  // Return null while redirecting
  if (!isReady || !user) {
    return null;
  }

  // Check if onboarding needed (delayed to allow Firestore sync)
  // Show onboarding if user has no spaces after data loads
  if (!onboardingChecked && bootstrapStatus === 'complete') {
    setTimeout(() => {
      if (spaces.length === 0) {
        setShowOnboarding(true);
      }
      setOnboardingChecked(true);
    }, 1000);
  }

  // Show onboarding flow
  if (showOnboarding) {
    return (
      <WelcomeFlow onComplete={() => setShowOnboarding(false)} />
    );
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search habits & quests..."
      appName="Grow"
    >
      <FirestoreSync />
      <NotificationToast />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Insights Banner - Full Width at Top */}
        <AIInsightsBanner />

        {/* Header Actions - Custom for Grow */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <Link
              href="/workspace/analytics"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
              title="View Analytics"
            >
              <BarChart3 className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setShowAISuggester(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border border-violet-500/30 text-violet-300 text-sm transition-all"
              title="Get AI habit suggestions"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Suggest</span>
            </button>
            <button
              onClick={() => setShowHabitPacks(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Packs</span>
            </button>
            <button
              onClick={() => {
                if (createPermission.allowed) {
                  setSelectedHabitId(undefined);
                  setShowHabitEditor(true);
                }
              }}
              disabled={!createPermission.allowed}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                createPermission.allowed
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
              title={createPermission.allowed ? 'Create a new habit' : createPermission.reason}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Habit</span>
            </button>
          </div>
        </div>

        {/* Quests Section (Squad/Couple Only) */}
        {currentSpace?.type !== 'personal' && (
          <div>
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
                {quests.map((quest: Quest) => (
                  <QuestBar key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div
                onClick={() => setShowQuestEditor(true)}
                className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-foreground/5 hover:bg-foreground/10 transition-colors cursor-pointer group"
              >
                <Crown className="h-8 w-8 text-foreground/20 group-hover:text-yellow-400/50 mb-2 transition-colors" />
                <p className="text-sm text-muted-foreground group-hover:text-muted-foreground">No active quests. Start a team challenge!</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Row - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CombinedInsights
            weeklyStats={weeklyStats}
            bestDay={bestDay}
            totalCompletions={totalCompletions}
            completionRate={completionRate}
          />
          {currentSpace?.type !== 'personal' && <TeamLeaderboard data={teamStats} />}
        </div>

        {/* Active Wagers - Full Width */}
        {currentSpace?.type === 'couple' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Active Wagers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.filter((h: Habit) => h.wager?.isActive).map((habit: Habit) => (
                <WagerCard key={habit.id} habit={habit} />
              ))}
            </div>
            {habits.filter((h: Habit) => h.wager?.isActive).length === 0 && (
              <div className="p-4 rounded-xl bg-foreground/5 border border-dashed border-border text-center">
                <p className="text-xs text-foreground/40">No active bets. Spice things up!</p>
              </div>
            )}
          </div>
        )}

        {/* Main Habits List - Full Width */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layout className="h-5 w-5 text-indigo-400" />
            Today&apos;s Focus
          </h2>

          {habits.length === 0 ? (
            <EmptyState
              icon={Rocket}
              title="Ready to grow?"
              description="Start with a few simple habits. Consistency beats intensity - even 5 minutes a day adds up!"
              action={{
                label: 'Get AI Suggestions',
                onClick: () => setShowAISuggester(true),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Due habits first */}
              {habits
                .filter((habit: Habit) => {
                  const status = getHabitStatus(habit, completions);
                  return status === 'due' || status === 'completed';
                })
                .map((habit: Habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completions={completions}
                    onComplete={handleCompleteHabit}
                    onUndoComplete={handleUndoComplete}
                    onEdit={handleEditHabit}
                    spaceType={currentSpace?.type || 'personal'}
                    partnerId={getPartnerId()}
                  />
                ))}
            </div>
          )}

          {/* Not due today (collapsed section) */}
          {habits.filter((habit: Habit) => getHabitStatus(habit, completions) === 'not_due').length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Not scheduled today</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits
                  .filter((habit: Habit) => getHabitStatus(habit, completions) === 'not_due')
                  .map((habit: Habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      completions={completions}
                      onComplete={handleCompleteHabit}
                      onUndoComplete={handleUndoComplete}
                      onEdit={handleEditHabit}
                      spaceType={currentSpace?.type || 'personal'}
                      partnerId={getPartnerId()}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Frozen habits */}
          {habits.filter((habit: Habit) => habit.isFrozen).length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Frozen</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits
                  .filter((habit: Habit) => habit.isFrozen)
                  .map((habit: Habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      completions={completions}
                      onComplete={handleCompleteHabit}
                      onUndoComplete={handleUndoComplete}
                      onEdit={handleEditHabit}
                      spaceType={currentSpace?.type || 'personal'}
                      partnerId={getPartnerId()}
                    />
                  ))}
              </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-foreground border border-border rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Habit Packs</h3>
                <button onClick={() => setShowHabitPacks(false)} className="text-muted-foreground hover:text-foreground">
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
              <HabitPacks onClose={() => setShowHabitPacks(false)} />
            </div>
          </div>
        )}

      {/* AI Habit Suggester */}
      <HabitSuggester
        isOpen={showAISuggester}
        onClose={() => setShowAISuggester(false)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onAddHabit={() => {
          if (createPermission.allowed) {
            setSelectedHabitId(undefined);
            setShowHabitEditor(true);
          }
        }}
        canAddHabit={createPermission.allowed}
        addHabitReason={createPermission.reason}
      />

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />
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
