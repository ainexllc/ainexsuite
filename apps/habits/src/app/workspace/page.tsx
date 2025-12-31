'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { Plus, Layout, Crown, Rocket } from 'lucide-react';

// Core Components
import { WorkspacePageLayout, EmptyState } from '@ainexsuite/ui';
import { MemberManager } from '@/components/spaces/MemberManager';
import { HabitEditor } from '@/components/habits/HabitEditor';
import { HabitComposer } from '@/components/habits/HabitComposer';
import { HabitCard } from '@/components/habits/HabitCard';
import { SwipeableHabitCard } from '@/components/habits/SwipeableHabitCard';
import { HabitPacks } from '@/components/gamification/HabitPacks';
import { QuestBar } from '@/components/gamification/QuestBar';
import { WagerCard } from '@/components/gamification/WagerCard';
import { FirestoreSync } from '@/components/FirestoreSync';
import { QuestEditor } from '@/components/gamification/QuestEditor';
import { StreakDangerAlert } from '@/components/gamification/StreakDangerAlert';
import { AchievementBadges } from '@/components/gamification/AchievementBadges';
import { ActivityFeed } from '@/components/gamification/ActivityFeed';
import { HabitSuggester } from '@/components/ai/HabitSuggester';
import { BottomNav } from '@/components/mobile/BottomNav';

// Analytics Components
import { TeamLeaderboard } from '@/components/analytics/TeamLeaderboard';

// Store & Types
import { useGrowStore } from '@/lib/store';
import { getHabitStatus, getTodayDateString } from '@/lib/date-utils';
import { Habit, Member, Quest, ReactionEmoji } from '@/types/models';
import { getTeamContribution } from '@/lib/analytics-utils';
import { canCreateHabit } from '@/lib/permissions';

export default function GrowWorkspacePage() {
  const { user } = useWorkspaceAuth();
  
  // Zustand Store
  const {
    getCurrentSpace,
    getSpaceHabits,
    getSpaceQuests,
    addCompletion,
    removeCompletion,
    addReaction,
    removeReaction,
    completions
  } = useGrowStore();

  const currentSpace = getCurrentSpace();
  const habits = currentSpace ? getSpaceHabits(currentSpace.id) : [];
  const quests = currentSpace ? getSpaceQuests(currentSpace.id) : [];

  // Permission check for habit creation
  const createPermission = currentSpace && user
    ? canCreateHabit(currentSpace, user.uid)
    : { allowed: false, reason: 'No space selected' };

  // Team stats for leaderboard
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

  const handleReact = (completionId: string, emoji: ReactionEmoji) => {
    if (!user) return;
    addReaction(completionId, emoji, user.uid, user.displayName || 'User');
  };

  const handleRemoveReaction = (completionId: string) => {
    if (!user) return;
    removeReaction(completionId, user.uid);
  };

  const getPartnerId = () => {
    if (!currentSpace || !user) return '';
    const partner = currentSpace.members.find((m: Member) => m.uid !== user.uid);
    return partner?.uid || '';
  };

  if (!user) return null;

  return (
    <>
      <FirestoreSync />

      <WorkspacePageLayout
        composer={
          createPermission.allowed ? (
            <HabitComposer onAISuggestClick={() => setShowAISuggester(true)} />
          ) : null
        }
      >

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

        {/* Team Leaderboard - Only for non-personal spaces */}
        {currentSpace?.type !== 'personal' && (
          <TeamLeaderboard data={teamStats} />
        )}

        {/* Activity Feed - Only for non-personal spaces */}
        {currentSpace?.type !== 'personal' && currentSpace && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              Recent Activity
            </h3>
            <ActivityFeed
              completions={completions}
              habits={habits}
              members={currentSpace.members}
              currentUserId={user?.uid || ''}
              limit={8}
            />
          </div>
        )}

        {/* Achievement Badges */}
        <AchievementBadges habits={habits} completions={completions} />

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

        {/* Streak Danger Alert */}
        <StreakDangerAlert
          habits={habits}
          completions={completions}
          onHabitClick={(habitId) => {
            const el = document.getElementById(`habit-${habitId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />

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
                .map((habit: Habit) => {
                  const status = getHabitStatus(habit, completions);
                  const isHabitCompleted = status === 'completed';
                  return (
                    <SwipeableHabitCard
                      key={habit.id}
                      onSwipeRight={() => !isHabitCompleted && handleCompleteHabit(habit.id)}
                      onSwipeLeft={() => handleEditHabit(habit.id)}
                      isCompleted={isHabitCompleted}
                      disabled={habit.isFrozen}
                    >
                      <HabitCard
                        habit={habit}
                        completions={completions}
                        allHabits={habits}
                        onComplete={handleCompleteHabit}
                        onUndoComplete={handleUndoComplete}
                        onEdit={handleEditHabit}
                        onChainNext={(habitId) => {
                          const el = document.getElementById(`habit-${habitId}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        spaceType={currentSpace?.type || 'personal'}
                        partnerId={getPartnerId()}
                        currentUserId={user?.uid}
                        onReact={handleReact}
                        onRemoveReaction={handleRemoveReaction}
                      />
                    </SwipeableHabitCard>
                  );
                })}
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
                    <SwipeableHabitCard
                      key={habit.id}
                      onSwipeRight={() => handleCompleteHabit(habit.id)}
                      onSwipeLeft={() => handleEditHabit(habit.id)}
                      isCompleted={false}
                      disabled={habit.isFrozen}
                    >
                      <HabitCard
                        habit={habit}
                        completions={completions}
                        allHabits={habits}
                        onComplete={handleCompleteHabit}
                        onUndoComplete={handleUndoComplete}
                        onEdit={handleEditHabit}
                        onChainNext={(habitId) => {
                          const el = document.getElementById(`habit-${habitId}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        spaceType={currentSpace?.type || 'personal'}
                        partnerId={getPartnerId()}
                        currentUserId={user?.uid}
                        onReact={handleReact}
                        onRemoveReaction={handleRemoveReaction}
                      />
                    </SwipeableHabitCard>
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
                    <SwipeableHabitCard
                      key={habit.id}
                      onSwipeLeft={() => handleEditHabit(habit.id)}
                      disabled={true}
                    >
                      <HabitCard
                        habit={habit}
                        completions={completions}
                        allHabits={habits}
                        onComplete={handleCompleteHabit}
                        onUndoComplete={handleUndoComplete}
                        onEdit={handleEditHabit}
                        onChainNext={(habitId) => {
                          const el = document.getElementById(`habit-${habitId}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        spaceType={currentSpace?.type || 'personal'}
                        partnerId={getPartnerId()}
                        currentUserId={user?.uid}
                        onReact={handleReact}
                        onRemoveReaction={handleRemoveReaction}
                      />
                    </SwipeableHabitCard>
                  ))}
              </div>
            </div>
          )}
        </div>
      </WorkspacePageLayout>

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
    </>
  );
}