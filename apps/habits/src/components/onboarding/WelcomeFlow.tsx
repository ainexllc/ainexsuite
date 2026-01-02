'use client';

import { useState } from 'react';
import {
  Sparkles,
  Target,
  Users,
  Flame,
  ArrowRight,
  Check,
  Heart,
  User,
  Zap,
  Home,
} from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { useSpaces } from '@/components/providers/spaces-provider';
import { useGrowStore } from '@/lib/store';
import { SpaceType, Habit } from '@/types/models';
import { cn } from '@/lib/utils';

interface WelcomeFlowProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'goal' | 'space' | 'habits' | 'done';

const goalOptions = [
  { id: 'health', label: 'Get Healthier', icon: '💪', habits: ['Morning stretch', 'Drink 8 glasses of water', 'Take a 10-minute walk'] },
  { id: 'productivity', label: 'Be More Productive', icon: '📈', habits: ['Plan tomorrow tonight', 'Deep work session', 'Inbox zero'] },
  { id: 'mindfulness', label: 'Find Balance', icon: '🧘', habits: ['5-minute meditation', 'Gratitude journaling', 'Digital sunset'] },
  { id: 'learning', label: 'Keep Learning', icon: '📚', habits: ['Read for 20 minutes', 'Practice a skill', 'Take notes'] },
];

const spaceOptions = [
  {
    type: 'personal' as SpaceType,
    icon: User,
    title: 'Just Me',
    description: 'Track your habits solo',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    type: 'couple' as SpaceType,
    icon: Heart,
    title: 'With Partner',
    description: 'Share goals with your partner',
    color: 'from-pink-500 to-rose-500',
  },
  {
    type: 'family' as SpaceType,
    icon: Home,
    title: 'With Family',
    description: 'Build healthy habits together',
    color: 'from-amber-500 to-orange-500',
  },
  {
    type: 'squad' as SpaceType,
    icon: Users,
    title: 'With Friends',
    description: 'Team accountability',
    color: 'from-emerald-500 to-teal-500',
  },
];

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const { user } = useAuth();
  const { spaces, createSpace } = useSpaces();
  const { addHabit } = useGrowStore();

  const [step, setStep] = useState<Step>('welcome');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedSpaces, setSelectedSpaces] = useState<SpaceType[]>(['personal']);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const currentGoal = goalOptions.find((g) => g.id === selectedGoal);

  const toggleSpace = (spaceType: SpaceType) => {
    setSelectedSpaces((prev) => {
      if (prev.includes(spaceType)) {
        // Don't allow deselecting if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== spaceType);
      }
      return [...prev, spaceType];
    });
  };

  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const getSpaceName = (type: SpaceType): string => {
    switch (type) {
      case 'personal': return 'My Growth';
      case 'couple': return 'Our Journey';
      case 'family': return 'Family Habits';
      case 'squad': return 'Team Goals';
      default: return 'My Space';
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsCreating(true);

    try {
      // Create spaces if none exist
      if (spaces.length === 0 && selectedSpaces.length > 0) {
        let primarySpaceId: string | null = null;

        // Create each selected space
        for (let i = 0; i < selectedSpaces.length; i++) {
          const spaceType = selectedSpaces[i];

          // Create space with basic info - the provider generates the rest
          const spaceId = await createSpace({
            name: getSpaceName(spaceType),
            type: spaceType,
          });

          // First space (or personal if selected) gets the habits
          if (!primarySpaceId) {
            primarySpaceId = spaceId;
          }
          // Prefer personal space for habits
          if (spaceType === 'personal') {
            primarySpaceId = spaceId;
          }

          // Small delay between space creation
          await new Promise((r) => setTimeout(r, 50));
        }

        // Create selected habits in the primary space
        if (primarySpaceId) {
          for (const habitTitle of selectedHabits) {
            const newHabit: Habit = {
              id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              spaceId: primarySpaceId,
              title: habitTitle,
              description: '',
              schedule: { type: 'daily' },
              assigneeIds: [user.uid],
              currentStreak: 0,
              bestStreak: 0,
              isFrozen: false,
              createdAt: new Date().toISOString(),
            };

            await addHabit(newHabit);
            // Small delay to ensure unique IDs
            await new Promise((r) => setTimeout(r, 50));
          }
        }
      }

      setStep('done');
      setTimeout(onComplete, 1500);
    } catch (error) {
      console.error('Onboarding error:', error);
      onComplete();
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome to Grow
              </h1>
              <p className="text-white/60 max-w-sm mx-auto">
                Build unbreakable habits with streaks, gamification, and optional
                accountability partners.
              </p>
            </div>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-white/5">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-white/70">
                  Track streaks to stay motivated
                </span>
              </div>
              <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-white/5">
                <Target className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-white/70">
                  Set goals and complete quests
                </span>
              </div>
              <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-white/5">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-white/70">
                  Optional partner/team accountability
                </span>
              </div>
            </div>
            <button
              onClick={() => setStep('goal')}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        );

      case 'goal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                What&apos;s your main goal?
              </h2>
              <p className="text-sm text-white/50">
                We&apos;ll suggest habits based on your focus
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all',
                    selectedGoal === goal.id
                      ? 'bg-indigo-500/20 border-indigo-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  )}
                >
                  <span className="text-2xl">{goal.icon}</span>
                  <p className="text-sm font-medium text-white mt-2">
                    {goal.label}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep('welcome')}
                className="px-4 py-2 text-sm text-white/50 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep('space')}
                disabled={!selectedGoal}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  selectedGoal
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'space':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Where do you want to track habits?
              </h2>
              <p className="text-sm text-white/50">
                Select all that apply — you can add more later
              </p>
            </div>
            <div className="space-y-3">
              {spaceOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedSpaces.includes(option.type);
                return (
                  <button
                    key={option.type}
                    onClick={() => toggleSpace(option.type)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    )}
                  >
                    <div
                      className={cn(
                        'h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-white/30'
                      )}
                    >
                      {isSelected && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                        option.color
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {option.title}
                      </p>
                      <p className="text-xs text-white/50">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-white/40">
              {selectedSpaces.length} space{selectedSpaces.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setStep('goal')}
                className="px-4 py-2 text-sm text-white/50 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep('habits')}
                disabled={selectedSpaces.length === 0}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  selectedSpaces.length > 0
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 'habits':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Pick your starter habits
              </h2>
              <p className="text-sm text-white/50">
                Select 1-3 habits to begin. You can add more later.
              </p>
            </div>
            <div className="space-y-2">
              {currentGoal?.habits.map((habit) => (
                <button
                  key={habit}
                  onClick={() => toggleHabit(habit)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                    selectedHabits.includes(habit)
                      ? 'bg-indigo-500/20 border-indigo-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all',
                      selectedHabits.includes(habit)
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-white/30'
                    )}
                  >
                    {selectedHabits.includes(habit) && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-white">{habit}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-white/30">
              {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''}{' '}
              selected
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setStep('space')}
                className="px-4 py-2 text-sm text-white/50 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={selectedHabits.length === 0 || isCreating}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  selectedHabits.length > 0 && !isCreating
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                )}
              >
                {isCreating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Start Growing
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'done':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse">
              <Check className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-sm text-white/50">
                Your habits are ready. Let&apos;s start building streaks!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        {step !== 'welcome' && step !== 'done' && (
          <div className="flex gap-1.5 mb-6 justify-center">
            {['goal', 'space', 'habits'].map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 w-8 rounded-full transition-all',
                  ['goal', 'space', 'habits'].indexOf(step) >= i
                    ? 'bg-indigo-500'
                    : 'bg-white/10'
                )}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl">
          {renderStep()}
        </div>

        {/* Skip option */}
        {step !== 'done' && (
          <button
            onClick={onComplete}
            className="w-full mt-4 text-center text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Skip setup and explore on my own
          </button>
        )}
      </div>
    </div>
  );
}
