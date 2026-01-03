'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import { Plus, Layout, Crown, Rocket, ChevronDown, Trophy, CheckSquare } from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';

// Core Components
import { WorkspacePageLayout, EmptyState, SpaceManagementModal, type UserSpace } from '@ainexsuite/ui';
import { useSettings } from '@/components/providers/settings-context';
import { MemberManager } from '@/components/spaces/MemberManager';
import { HabitEditor } from '@/components/habits/HabitEditor';
import { HabitComposer } from '@/components/habits/HabitComposer';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitDetailModal } from '@/components/habits/HabitDetailModal';
import { SwipeableHabitCard } from '@/components/habits/SwipeableHabitCard';
import { FamilyHabitsGrid } from '@/components/habits/FamilyHabitsGrid';
import { HabitPacks } from '@/components/gamification/HabitPacks';
import { QuestBar } from '@/components/gamification/QuestBar';
import { WagerCard } from '@/components/gamification/WagerCard';
import { FirestoreSync } from '@/components/FirestoreSync';
import { QuestEditor } from '@/components/gamification/QuestEditor';
import { StreakDangerAlert } from '@/components/gamification/StreakDangerAlert';
import { AchievementBadges } from '@/components/gamification/AchievementBadges';
import { HabitSuggester } from '@/components/ai/HabitSuggester';
import { BottomNav } from '@/components/mobile/BottomNav';

// Bulk operations & filtering
import { SelectionProvider, useHabitSelectionContext } from '@/components/providers/selection-provider';
import { HabitsToolbar } from '@/components/habits/HabitsToolbar';
import { BulkActionBar } from '@/components/habits/BulkActionBar';
import { useHabitFilters } from '@/hooks/use-habit-filters';
import { useFilteredHabits } from '@/hooks/use-filtered-habits';

// Analytics Components
import { TeamLeaderboard } from '@/components/analytics/TeamLeaderboard';

// Store & Types
import { useGrowStore } from '@/lib/store';
import { useSpaces } from '@/components/providers/spaces-provider';
import { getHabitStatus, getTodayDateString } from '@/lib/date-utils';
import { Habit, Member, Quest, ReactionEmoji } from '@/types/models';
import { getTeamContribution } from '@/lib/analytics-utils';
import { canCreateHabit } from '@/lib/permissions';
import { cn } from '@/lib/utils';

export default function GrowWorkspacePage() {
  return (
    <SelectionProvider>
      <GrowWorkspaceContent />
    </SelectionProvider>
  );
}

function GrowWorkspaceContent() {
  const { user } = useWorkspaceAuth();
  useSettings(); // Keep provider mounted

  // Spaces from context (createSpacesProvider)
  const { currentSpace, allSpaces, createSpace, updateSpace, deleteSpace } = useSpaces();

  // Selection context for bulk operations
  const selection = useHabitSelectionContext();

  // Filtering state
  const {
    filters,
    setSearchQuery,
    toggleCategory,
    toggleAssignee,
    setStatus,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useHabitFilters();

  // Handler to open member manager for current space
  const handleManagePeople = useCallback(() => {
    setShowMemberManager(true);
  }, []);

  // Map spaces to UserSpace format for SpaceManagementModal
  const userSpaces = useMemo<UserSpace[]>(() => {
    return allSpaces
      .filter((s) => s.id !== 'personal')
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type as SpaceType,
        isGlobal: (s as { isGlobal?: boolean }).isGlobal ?? false,
        isOwner: ((s as { ownerId?: string; createdBy?: string }).ownerId || (s as { ownerId?: string; createdBy?: string }).createdBy) === user?.uid,
        hiddenInApps: (s as { hiddenInApps?: string[] }).hiddenInApps || [],
      }));
  }, [allSpaces, user?.uid]);

  // Space management callbacks
  const handleJoinGlobalSpace = useCallback(async (type: SpaceType, hiddenInApps: string[]) => {
    if (!user) return;
    const globalSpaceNames: Record<string, string> = {
      family: 'Family',
      couple: 'Couple',
      squad: 'Team',
      work: 'Group',
    };
    // Create the space first, then update with extra fields
    const spaceId = await createSpace({
      name: globalSpaceNames[type] || type,
      type,
    });
    // Add isGlobal and hiddenInApps fields
    await updateSpace(spaceId, { isGlobal: true, hiddenInApps });
  }, [user, createSpace, updateSpace]);

  const handleLeaveGlobalSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleCreateCustomSpace = useCallback(async (name: string, hiddenInApps: string[]) => {
    if (!user) return;
    // Create the space first, then update with extra fields
    // Use 'work' type for custom spaces since habits allows: personal, family, couple, work
    const spaceId = await createSpace({
      name,
      type: 'work',
    });
    // Add hiddenInApps field
    if (hiddenInApps.length > 0) {
      await updateSpace(spaceId, { hiddenInApps });
    }
  }, [user, createSpace, updateSpace]);

  const handleRenameCustomSpace = useCallback(async (spaceId: string, name: string) => {
    await updateSpace(spaceId, { name });
  }, [updateSpace]);

  const handleDeleteCustomSpace = useCallback(async (spaceId: string) => {
    await deleteSpace(spaceId);
  }, [deleteSpace]);

  const handleUpdateSpaceVisibility = useCallback(async (spaceId: string, hiddenInApps: string[]) => {
    await updateSpace(spaceId, { hiddenInApps });
  }, [updateSpace]);

  // Zustand Store for habits/completions
  const {
    getSpaceHabits,
    getSpaceQuests,
    addCompletion,
    removeCompletion,
    addReaction,
    removeReaction,
    completions,
    deleteHabit,
    updateHabit,
  } = useGrowStore();

  const allHabits = currentSpace ? getSpaceHabits(currentSpace.id) : [];
  const quests = currentSpace ? getSpaceQuests(currentSpace.id) : [];

  // Apply filters to habits
  const habits = useFilteredHabits({
    habits: allHabits,
    filters,
    completions,
  });

  // Handler for quick-assign from HabitCard
  const handleQuickAssign = useCallback((habitId: string, assigneeIds: string[]) => {
    useGrowStore.getState().updateHabit(habitId, { assigneeIds });
  }, []);

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
  const [showSpaceManagement, setShowSpaceManagement] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | undefined>(undefined);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);

  // Find the habit and member for the detail modal
  const detailHabit = detailHabitId ? allHabits.find(h => h.id === detailHabitId) || null : null;
  const detailMember = detailMemberId ? currentSpace?.members.find(m => m.uid === detailMemberId) : null;

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

  // Complete habit for a specific member (for family grid view)
  const handleCompleteForMember = (habitId: string, memberId: string) => {
    if (!currentSpace) return;
    addCompletion({
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      habitId,
      spaceId: currentSpace.id,
      userId: memberId,
      date: getTodayDateString(),
      completedAt: new Date().toISOString(),
    });
  };

  const handleUndoComplete = (habitId: string) => {
    removeCompletion(habitId);
  };

  // Undo completion for a specific member (for family grid view)
  const handleUndoCompleteForMember = (habitId: string, memberId: string) => {
    removeCompletion(habitId, memberId);
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
        composer={<HabitComposer onAISuggestClick={() => setShowAISuggester(true)} onManagePeople={handleManagePeople} onManageSpaces={() => setShowSpaceManagement(true)} />}
      >
        {/* Main content with consistent section spacing */}
        <div className="space-y-4">
          {/* Quests Section (Non-personal spaces) - Collapsible */}
          {isTeamSpace && (
            <section className="space-y-2">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setQuestsExpanded(!questsExpanded)}
                onKeyDown={(e) => e.key === 'Enter' && setQuestsExpanded(!questsExpanded)}
                className="w-full flex items-center justify-between py-1 cursor-pointer"
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
              </div>

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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                  <Layout className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                Today&apos;s Focus
                {habits.length !== allHabits.length && (
                  <span className="text-xs text-white/40">
                    ({habits.length} of {allHabits.length})
                  </span>
                )}
              </h2>
              {/* Select Mode Toggle */}
              {allHabits.length > 1 && (
                <button
                  onClick={() => selection.isSelectMode ? selection.exitSelectMode() : selection.enterSelectMode()}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    selection.isSelectMode
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  {selection.isSelectMode ? 'Cancel' : 'Select'}
                </button>
              )}
            </div>

            {/* Habits Toolbar - Search & Filters */}
            {allHabits.length > 0 && (
              <HabitsToolbar
                filters={filters}
                onSearchChange={setSearchQuery}
                onCategoryToggle={toggleCategory}
                onAssigneeToggle={toggleAssignee}
                onStatusChange={setStatus}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                members={currentSpace?.members || []}
              />
            )}

          {allHabits.length === 0 ? (
            <EmptyState
              icon={Rocket}
              title="Ready to grow?"
              description="Start with a few simple habits. Consistency beats intensity - even 5 minutes a day adds up!"
              action={{
                label: 'Get AI Suggestions',
                onClick: () => setShowAISuggester(true),
              }}
            />
          ) : habits.length === 0 && hasActiveFilters ? (
            <div className="text-center py-12">
              <p className="text-white/50 mb-2">No habits match your filters</p>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Clear all filters
              </button>
            </div>
          ) : isTeamSpace && currentSpace ? (
            /* Family/Team Grid View - show all members side by side */
            <FamilyHabitsGrid
              members={currentSpace.members}
              habits={habits}
              completions={completions}
              onComplete={handleCompleteForMember}
              onUndoComplete={handleUndoCompleteForMember}
              currentUserId={user?.uid || ''}
              onHabitClick={(habitId, memberId) => {
                setDetailHabitId(habitId);
                setDetailMemberId(memberId);
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
                      onSwipeRight={() => !isHabitCompleted && !selection.isSelectMode && handleCompleteHabit(habit.id)}
                      onSwipeLeft={() => !selection.isSelectMode && handleEditHabit(habit.id)}
                      isCompleted={isHabitCompleted}
                      disabled={habit.isFrozen || selection.isSelectMode}
                    >
                      <HabitCard
                        habit={habit}
                        completions={completions}
                        allHabits={allHabits}
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
                        isSelectMode={selection.isSelectMode}
                        isSelected={selection.selectedIds.has(habit.id)}
                        onSelect={(id, e) => selection.handleSelect(id, e, habits.map(h => h.id))}
                        members={currentSpace?.members || []}
                        onAssign={handleQuickAssign}
                        onCardClick={(id) => setDetailHabitId(id)}
                      />
                    </SwipeableHabitCard>
                  );
                })}
            </div>
          )}

          {/* Not due today (collapsed section) - only for personal spaces */}
          {!isTeamSpace && allHabits.filter((habit: Habit) => getHabitStatus(habit, completions) === 'not_due').length > 0 && (
            <div className="pt-4 mt-2 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Not scheduled today</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allHabits
                  .filter((habit: Habit) => getHabitStatus(habit, completions) === 'not_due')
                  .map((habit: Habit) => (
                    <SwipeableHabitCard
                      key={habit.id}
                      onSwipeRight={() => !selection.isSelectMode && handleCompleteHabit(habit.id)}
                      onSwipeLeft={() => !selection.isSelectMode && handleEditHabit(habit.id)}
                      isCompleted={false}
                      disabled={habit.isFrozen || selection.isSelectMode}
                    >
                      <HabitCard
                        habit={habit}
                        completions={completions}
                        allHabits={allHabits}
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
                        isSelectMode={selection.isSelectMode}
                        isSelected={selection.selectedIds.has(habit.id)}
                        onSelect={(id, e) => selection.handleSelect(id, e, allHabits.map(h => h.id))}
                        members={currentSpace?.members || []}
                        onAssign={handleQuickAssign}
                        onCardClick={(id) => setDetailHabitId(id)}
                      />
                    </SwipeableHabitCard>
                  ))}
              </div>
            </div>
          )}

          {/* Frozen habits - only for personal spaces */}
          {!isTeamSpace && allHabits.filter((habit: Habit) => habit.isFrozen).length > 0 && (
            <div className="pt-4 mt-2 border-t border-white/5">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Frozen</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allHabits
                  .filter((habit: Habit) => habit.isFrozen)
                  .map((habit: Habit) => (
                    <SwipeableHabitCard
                      key={habit.id}
                      onSwipeLeft={() => !selection.isSelectMode && handleEditHabit(habit.id)}
                      disabled={true}
                    >
                      <HabitCard
                        habit={habit}
                        completions={completions}
                        allHabits={allHabits}
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
                        isSelectMode={selection.isSelectMode}
                        isSelected={selection.selectedIds.has(habit.id)}
                        onSelect={(id, e) => selection.handleSelect(id, e, allHabits.map(h => h.id))}
                        members={currentSpace?.members || []}
                        onAssign={handleQuickAssign}
                        onCardClick={(id) => setDetailHabitId(id)}
                      />
                    </SwipeableHabitCard>
                  ))}
              </div>
            </div>
          )}
          </section>
        </div>
      </WorkspacePageLayout>

      {/* Bulk Action Bar - appears when selecting habits */}
      <BulkActionBar />

      {/* Modals */}
      <HabitEditor
        isOpen={showHabitEditor}
        onClose={() => setShowHabitEditor(false)}
        editHabitId={selectedHabitId}
      />

      <HabitDetailModal
        isOpen={!!detailHabitId}
        onClose={() => {
          setDetailHabitId(null);
          setDetailMemberId(null);
        }}
        habit={detailHabit}
        completions={completions}
        member={detailMember}
        onEdit={(habit) => {
          setDetailHabitId(null);
          setDetailMemberId(null);
          handleEditHabit(habit.id);
        }}
        onDelete={async (habitId) => {
          try {
            await deleteHabit(habitId);
            setDetailHabitId(null);
            setDetailMemberId(null);
          } catch {
            // Handle deletion error silently
          }
        }}
        onToggleFreeze={async (habitId, currentStatus) => {
          await updateHabit(habitId, { isFrozen: !currentStatus });
        }}
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

      {/* Space Management Modal */}
      <SpaceManagementModal
        isOpen={showSpaceManagement}
        onClose={() => setShowSpaceManagement(false)}
        userSpaces={userSpaces}
        onJoinGlobalSpace={handleJoinGlobalSpace}
        onLeaveGlobalSpace={handleLeaveGlobalSpace}
        onCreateCustomSpace={handleCreateCustomSpace}
        onRenameCustomSpace={handleRenameCustomSpace}
        onDeleteCustomSpace={handleDeleteCustomSpace}
        onUpdateSpaceVisibility={handleUpdateSpaceVisibility}
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
