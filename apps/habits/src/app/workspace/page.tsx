'use client';

import { useState } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { Plus, Layout, Crown, Rocket, ChevronDown, Settings, Trophy, Users } from 'lucide-react';

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
import { cn } from '@/lib/utils';

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

  // Collapsible section states
  const [questsExpanded, setQuestsExpanded] = useState(true);
  const [statsExpanded, setStatsExpanded] = useState(true);

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

  const isTeamSpace = currentSpace?.type !== 'personal';

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
        {/* Main content with consistent section spacing */}
        <div className="space-y-4">
          {/* Family/Team Settings - Always visible for non-personal spaces */}
          {isTeamSpace && (
            <button
              onClick={() => setShowMemberManager(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                  <Users className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-white">
                  {currentSpace?.type === 'family' ? 'Family' : currentSpace?.type === 'couple' ? 'Partner' : 'Team'} Settings
                </span>
                <span className="text-xs text-white/40">
                  {currentSpace?.members.length} {currentSpace?.members.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <Settings className="h-4 w-4 text-indigo-400 group-hover:rotate-45 transition-transform" />
            </button>
          )}

          {/* Quests Section (Non-personal spaces) - Collapsible */}
          {isTeamSpace && (
            <section className="space-y-2">
              <button
                onClick={() => setQuestsExpanded(!questsExpanded)}
                className="w-full flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-yellow-500/20">
                    <Crown className="h-3.5 w-3.5 text-yellow-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">Active Quests</h2>
                  {quests.length > 0 && (
                    <span className="text-xs text-yellow-400/80 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">
                      {quests.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQuestEditor(true);
                    }}
                    className="text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors px-2 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20"
                  >
                    + New
                  </button>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-white/40 transition-transform duration-200",
                      questsExpanded ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </div>
              </button>

              <div className={cn(
                "transition-all duration-200 overflow-hidden",
                questsExpanded ? "opacity-100" : "opacity-0 h-0"
              )}>
                {quests.length > 0 ? (
                  <div className="space-y-2">
                    {/* Compact quests on mobile, regular on larger screens */}
                    <div className="block md:hidden space-y-2">
                      {quests.map((quest: Quest) => (
                        <QuestBar key={quest.id} quest={quest} compact />
                      ))}
                    </div>
                    <div className="hidden md:grid md:grid-cols-2 gap-2">
                      {quests.map((quest: Quest) => (
                        <QuestBar key={quest.id} quest={quest} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowQuestEditor(true)}
                    className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center text-center bg-white/5 hover:bg-white/10 hover:border-yellow-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-yellow-500/30 transition-all">
                        <Crown className="h-4 w-4 text-white/30 group-hover:text-yellow-400 transition-colors" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white/60">No active quests</p>
                        <p className="text-xs text-white/30">Start a team challenge!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Team Stats Row - Collapsible with compact mobile view */}
          {isTeamSpace && currentSpace && (
            <section className="space-y-2">
              <button
                onClick={() => setStatsExpanded(!statsExpanded)}
                className="w-full flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">Progress & Achievements</h2>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-white/40 transition-transform duration-200",
                    statsExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              <div className={cn(
                "transition-all duration-200 overflow-hidden",
                statsExpanded ? "opacity-100" : "opacity-0 h-0"
              )}>
                {/* Mobile: Stacked compact cards */}
                <div className="block lg:hidden space-y-2">
                  <TeamLeaderboard
                    data={teamStats}
                    spaceType={currentSpace?.type}
                    onSettingsClick={() => setShowMemberManager(true)}
                    compact
                  />
                  <AchievementBadges habits={habits} completions={completions} variant="mini" />
                </div>
                {/* Desktop: Side by side */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-3">
                  <TeamLeaderboard
                    data={teamStats}
                    spaceType={currentSpace?.type}
                    onSettingsClick={() => setShowMemberManager(true)}
                  />
                  <AchievementBadges habits={habits} completions={completions} />
                </div>
              </div>
            </section>
          )}

          {/* Achievement Badges - Personal spaces only */}
          {currentSpace?.type === 'personal' && (
            <section>
              <AchievementBadges habits={habits} completions={completions} variant="mini" />
            </section>
          )}

          {/* Active Wagers - Couple Only */}
          {currentSpace?.type === 'couple' && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Active Wagers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {habits.filter((h: Habit) => h.wager?.isActive).map((habit: Habit) => (
                  <WagerCard key={habit.id} habit={habit} />
                ))}
              </div>
              {habits.filter((h: Habit) => h.wager?.isActive).length === 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                  <p className="text-sm text-white/40">No active bets. Spice things up!</p>
                </div>
              )}
            </section>
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

          {/* Main Habits List */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20">
                <Layout className="h-3.5 w-3.5 text-indigo-400" />
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
            <div className="pt-4 mt-2 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Not scheduled today</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
            <div className="pt-4 mt-2 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Frozen</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
          </section>
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
