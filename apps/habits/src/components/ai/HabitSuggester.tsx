'use client';

import { useState } from 'react';
import { Sparkles, Plus, Loader2, RefreshCw, X } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { useGrowStore } from '@/lib/store';
import { Habit, FrequencyType } from '@/types/models';
import { cn } from '@/lib/utils';

interface SuggestedHabit {
  title: string;
  description: string;
  schedule: {
    type: FrequencyType;
    daysOfWeek?: number[];
    intervalDays?: number;
    timesPerWeek?: number;
  };
  category: string;
  tip: string;
}

interface HabitSuggesterProps {
  isOpen: boolean;
  onClose: () => void;
}

const goalPresets = [
  { id: 'health', label: 'Health & Fitness', icon: '💪', prompt: 'health, fitness, exercise, nutrition' },
  { id: 'productivity', label: 'Productivity', icon: '📈', prompt: 'productivity, focus, work habits, time management' },
  { id: 'mindfulness', label: 'Mental Wellness', icon: '🧘', prompt: 'meditation, mindfulness, stress reduction, mental health' },
  { id: 'learning', label: 'Learning & Growth', icon: '📚', prompt: 'learning, reading, skill development, education' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', prompt: 'relationships, communication, social connections' },
  { id: 'finance', label: 'Finance', icon: '💰', prompt: 'saving money, financial habits, budgeting' },
];

export function HabitSuggester({ isOpen, onClose }: HabitSuggesterProps) {
  const { user } = useAuth();
  const { addHabit, getCurrentSpace, habits } = useGrowStore();
  const currentSpace = getCurrentSpace();

  const [step, setStep] = useState<'goals' | 'suggestions' | 'custom'>('goals');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestedHabit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedHabits, setAddedHabits] = useState<Set<string>>(new Set());

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const generateSuggestions = async () => {
    if (selectedGoals.length === 0 && !customGoal.trim()) {
      setError('Please select at least one goal or enter a custom goal');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedPrompts = selectedGoals
        .map((id) => goalPresets.find((g) => g.id === id)?.prompt)
        .filter(Boolean)
        .join(', ');

      const goalContext = customGoal.trim()
        ? `${selectedPrompts}, ${customGoal}`
        : selectedPrompts;

      // Get existing habit titles to avoid duplicates
      const existingHabits = habits.map((h) => h.title.toLowerCase());

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: 'habits',
          systemPrompt: `You are a habit coach helping users build positive habits.
Given the user's goals, suggest 4-5 specific, actionable habits they can start today.
For each habit, provide:
1. A clear, concise title (max 40 chars)
2. A brief description explaining why it helps
3. A recommended schedule (daily, specific_days with daysOfWeek array 0-6, weekly with timesPerWeek, or interval with intervalDays)
4. A category (Health, Productivity, Mindfulness, Learning, Relationships, Finance, or Other)
5. A practical tip for maintaining the habit

Respond ONLY with valid JSON array. No markdown, no explanation.
Format: [{"title": "...", "description": "...", "schedule": {"type": "daily"|"specific_days"|"weekly"|"interval", "daysOfWeek": [0,2,4], "timesPerWeek": 3, "intervalDays": 2}, "category": "...", "tip": "..."}]

Avoid suggesting habits that are too similar to these existing habits: ${existingHabits.join(', ')}`,
          messages: [
            {
              role: 'user',
              content: `I want to build habits around: ${goalContext}. Please suggest 4-5 specific habits.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.warn('AI service unavailable, using fallback suggestions');
        const fallbacks = getFallbackSuggestions(selectedGoals.length > 0 ? selectedGoals : ['health', 'productivity']);
        setSuggestions(fallbacks);
        setStep('suggestions');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Parse the AI response
      let parsed: SuggestedHabit[] = [];
      try {
        // Handle both direct array and wrapped response
        const content = data.message || data.content || data;
        if (typeof content === 'string') {
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        } else if (Array.isArray(content)) {
          parsed = content;
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Failed to parse habit suggestions');
      }

      if (parsed.length === 0) {
        throw new Error('No suggestions generated');
      }

      setSuggestions(parsed);
      setStep('suggestions');
    } catch (err) {
      console.error('Suggestion error:', err);
      setError('Failed to generate suggestions. Please try again.');
      // Provide fallback suggestions
      setSuggestions(getFallbackSuggestions(selectedGoals));
      setStep('suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackSuggestions = (goals: string[]): SuggestedHabit[] => {
    const fallbacks: Record<string, SuggestedHabit[]> = {
      health: [
        {
          title: 'Morning Stretch Routine',
          description: 'Start your day with 5-10 minutes of stretching to improve flexibility and energy.',
          schedule: { type: 'daily' },
          category: 'Health',
          tip: 'Keep your stretching routine next to your bed so you see it first thing.',
        },
        {
          title: 'Drink 8 Glasses of Water',
          description: 'Stay hydrated throughout the day for better focus and health.',
          schedule: { type: 'daily' },
          category: 'Health',
          tip: 'Use a marked water bottle to track your progress visually.',
        },
      ],
      productivity: [
        {
          title: 'Plan Tomorrow Tonight',
          description: 'Spend 5 minutes each evening planning your top 3 priorities for tomorrow.',
          schedule: { type: 'daily' },
          category: 'Productivity',
          tip: 'Keep a dedicated notebook on your nightstand.',
        },
        {
          title: 'Deep Work Block',
          description: 'Schedule 90 minutes of focused, distraction-free work on your most important task.',
          schedule: { type: 'specific_days', daysOfWeek: [1, 2, 3, 4, 5] },
          category: 'Productivity',
          tip: 'Use airplane mode and close all unnecessary tabs.',
        },
      ],
      mindfulness: [
        {
          title: '5-Minute Morning Meditation',
          description: 'Start your day with a short meditation to center your mind.',
          schedule: { type: 'daily' },
          category: 'Mindfulness',
          tip: 'Use a meditation app with a timer to stay consistent.',
        },
        {
          title: 'Gratitude Journaling',
          description: 'Write down 3 things you are grateful for each day.',
          schedule: { type: 'daily' },
          category: 'Mindfulness',
          tip: 'Do this right before bed to end your day positively.',
        },
      ],
      learning: [
        {
          title: 'Read for 20 Minutes',
          description: 'Dedicate time to reading books that expand your knowledge.',
          schedule: { type: 'daily' },
          category: 'Learning',
          tip: 'Keep your current book visible where you relax.',
        },
      ],
      relationships: [
        {
          title: 'Send a Check-in Message',
          description: 'Reach out to a friend or family member you haven not talked to recently.',
          schedule: { type: 'weekly', timesPerWeek: 2 },
          category: 'Relationships',
          tip: 'Set a recurring reminder and keep a list of people to reach out to.',
        },
      ],
      finance: [
        {
          title: 'Review Daily Spending',
          description: 'Spend 2 minutes reviewing what you spent today.',
          schedule: { type: 'daily' },
          category: 'Finance',
          tip: 'Use a simple notes app or spreadsheet.',
        },
      ],
    };

    const result: SuggestedHabit[] = [];
    goals.forEach((goal) => {
      if (fallbacks[goal]) {
        result.push(...fallbacks[goal]);
      }
    });

    return result.slice(0, 5);
  };

  const addSuggestedHabit = async (suggestion: SuggestedHabit) => {
    if (!user || !currentSpace) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      spaceId: currentSpace.id,
      title: suggestion.title,
      description: suggestion.description,
      schedule: suggestion.schedule,
      assigneeIds: [user.uid],
      currentStreak: 0,
      bestStreak: 0,
      isFrozen: false,
      createdAt: new Date().toISOString(),
    };

    await addHabit(newHabit);
    setAddedHabits((prev) => new Set([...prev, suggestion.title]));
  };

  const handleClose = () => {
    setStep('goals');
    setSelectedGoals([]);
    setCustomGoal('');
    setSuggestions([]);
    setAddedHabits(new Set());
    setError(null);
    onClose();
  };

  const handleBack = () => {
    setStep('goals');
    setSuggestions([]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-foreground border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Get Habit Ideas</h2>
              <p className="text-sm text-muted-foreground">AI will suggest habits based on your goals</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'goals' && (
            <div className="space-y-6">
              {/* Step 1: Choose categories */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500 text-white text-xs font-bold">1</span>
                  <h3 className="text-base font-semibold text-foreground">Choose areas to improve</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 ml-7">Select one or more categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {goalPresets.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                        selectedGoals.includes(goal.id)
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-foreground ring-2 ring-indigo-500/30'
                          : 'bg-foreground/5 border-border text-muted-foreground hover:bg-foreground/10 hover:text-foreground hover:border-foreground/20'
                      )}
                    >
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="text-sm font-medium">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Step 2: Custom goal */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold">2</span>
                  <h3 className="text-base font-semibold text-foreground">Describe your goal</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3 ml-7">Tell us what you want to achieve</p>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g., Learn to play guitar, Sleep better, Be more organized..."
                  className="w-full px-4 py-3.5 rounded-xl bg-foreground/5 border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
              )}
            </div>
          )}

          {step === 'suggestions' && (
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No suggestions available</p>
              ) : (
                suggestions.map((suggestion, index) => {
                  const isAdded = addedHabits.has(suggestion.title);
                  return (
                    <div
                      key={index}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        isAdded
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-foreground/5 border-border hover:bg-foreground/10'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate">
                              {suggestion.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground flex-shrink-0">
                              {suggestion.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                          <p className="text-xs text-indigo-300/70 italic">
                            💡 {suggestion.tip}
                          </p>
                        </div>
                        <button
                          onClick={() => addSuggestedHabit(suggestion)}
                          disabled={isAdded}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0',
                            isAdded
                              ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                          )}
                        >
                          {isAdded ? (
                            <>Added!</>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-foreground/5 flex-shrink-0">
          {step === 'goals' ? (
            <>
              <p className="text-xs text-foreground/40">
                {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={generateSuggestions}
                disabled={isLoading || (selectedGoals.length === 0 && !customGoal.trim())}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  !isLoading && (selectedGoals.length > 0 || customGoal.trim())
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-foreground shadow-lg shadow-purple-500/20'
                    : 'bg-foreground/10 text-foreground/30 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get Suggestions
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Different Goals
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-foreground text-sm font-medium transition-all"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
