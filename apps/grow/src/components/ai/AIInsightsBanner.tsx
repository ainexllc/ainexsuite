'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Flame, TrendingUp, AlertTriangle, Trophy, Lightbulb, Target, Zap } from 'lucide-react';
import { useGrowStore } from '@/lib/store';
import { useAuth } from '@ainexsuite/auth';
import { useAppColors } from '@ainexsuite/theme';
import { Habit, Completion } from '@/types/models';
import { cn } from '@/lib/utils';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import {
  AIInsightsCard,
  AIInsightsText,
  type AIInsightsSection,
} from '@ainexsuite/ui';

interface HabitInsight {
  type: 'streak_risk' | 'momentum' | 'suggestion' | 'achievement' | 'encouragement';
  title: string;
  message: string;
  habitId?: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIInsightsBannerProps {
  className?: string;
}

export function AIInsightsBanner({ className }: AIInsightsBannerProps) {
  const { user } = useAuth();
  const { habits, completions, getCurrentSpace } = useGrowStore();
  const currentSpace = getCurrentSpace();
  const { primary: primaryColor } = useAppColors();

  const [insight, setInsight] = useState<HabitInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Calculate habit analytics for AI context
  const getHabitAnalytics = useCallback(() => {
    if (!habits.length || !currentSpace) return null;

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const weekAgo = subDays(today, 7);

    // Get active habits (not frozen)
    const activeHabits = habits.filter((h: Habit) => !h.isFrozen);

    // Calculate completion stats
    const weeklyCompletions = completions.filter(
      (c: Completion) => new Date(c.date) >= weekAgo
    );

    // Find habits at risk (no completion in last 2+ days)
    const habitsAtRisk = activeHabits.filter((habit: Habit) => {
      const habitCompletions = completions
        .filter((c: Completion) => c.habitId === habit.id)
        .sort((a: Completion, b: Completion) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (habitCompletions.length === 0) return true;

      const lastCompletion = habitCompletions[0];
      const daysSinceLast = differenceInDays(today, parseISO(lastCompletion.date));
      return daysSinceLast >= 2;
    });

    // Find habits with active streaks
    const habitsWithStreaks = activeHabits.filter((h: Habit) => h.currentStreak >= 3);

    // Today's progress
    const todayCompletions = completions.filter((c: Completion) => c.date === todayStr);
    const todayProgress = activeHabits.length > 0
      ? Math.round((todayCompletions.length / activeHabits.length) * 100)
      : 0;

    // Calculate weekly consistency
    const weeklyConsistency = activeHabits.length > 0
      ? Math.round((weeklyCompletions.length / (activeHabits.length * 7)) * 100)
      : 0;

    // Find best performing habit
    const habitPerformance = activeHabits.map((habit: Habit) => ({
      habit,
      completions: completions.filter((c: Completion) => c.habitId === habit.id && new Date(c.date) >= weekAgo).length
    })).sort((a, b) => b.completions - a.completions);

    return {
      totalHabits: activeHabits.length,
      habitsAtRisk,
      habitsWithStreaks,
      todayProgress,
      weeklyConsistency,
      weeklyCompletions: weeklyCompletions.length,
      bestHabit: habitPerformance[0]?.habit,
      worstHabit: habitPerformance[habitPerformance.length - 1]?.habit,
      spaceType: currentSpace.type
    };
  }, [habits, completions, currentSpace]);

  // Generate insight from analytics (local fallback)
  const generateLocalInsight = useCallback((): HabitInsight | null => {
    const analytics = getHabitAnalytics();
    if (!analytics || analytics.totalHabits === 0) return null;

    // Priority 1: Streaks at risk
    if (analytics.habitsAtRisk.length > 0) {
      const atRisk = analytics.habitsAtRisk[0];
      return {
        type: 'streak_risk',
        title: 'Streak at Risk',
        message: `"${atRisk.title}" hasn't been completed in a while. A quick win today keeps your momentum going!`,
        habitId: atRisk.id,
        priority: 'high'
      };
    }

    // Priority 2: Celebrate achievements
    if (analytics.habitsWithStreaks.length > 0) {
      const bestStreak = analytics.habitsWithStreaks.sort((a: Habit, b: Habit) => b.currentStreak - a.currentStreak)[0];
      if (bestStreak.currentStreak >= 7) {
        return {
          type: 'achievement',
          title: 'Streak Champion!',
          message: `Amazing! You're on a ${bestStreak.currentStreak}-day streak with "${bestStreak.title}". Keep the fire alive!`,
          habitId: bestStreak.id,
          priority: 'medium'
        };
      }
    }

    // Priority 3: Today's progress encouragement
    if (analytics.todayProgress === 100) {
      return {
        type: 'achievement',
        title: 'Perfect Day!',
        message: "You've completed all your habits today. Consistency like this compounds over time!",
        priority: 'low'
      };
    }

    if (analytics.todayProgress >= 50) {
      return {
        type: 'momentum',
        title: 'Great Progress',
        message: `You're ${analytics.todayProgress}% done today. Finish strong - you're closer than you think!`,
        priority: 'medium'
      };
    }

    // Priority 4: General encouragement based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        type: 'encouragement',
        title: 'Fresh Start',
        message: "Morning is prime time for habits. Which one will you tackle first?",
        priority: 'low'
      };
    } else if (hour < 17) {
      return {
        type: 'suggestion',
        title: 'Afternoon Check-in',
        message: analytics.todayProgress > 0
          ? `${100 - analytics.todayProgress}% of today's habits remaining. Perfect time for a quick win!`
          : "Your habits are waiting! Even one completion keeps momentum alive.",
        priority: 'medium'
      };
    } else {
      return {
        type: 'encouragement',
        title: 'Evening Reflection',
        message: analytics.weeklyConsistency >= 70
          ? `Strong week with ${analytics.weeklyConsistency}% consistency! Rest well and keep it up tomorrow.`
          : "Tomorrow is a fresh start. What small habit will you prioritize?",
        priority: 'low'
      };
    }
  }, [getHabitAnalytics]);

  // Fetch AI-generated insight
  const fetchAIInsight = useCallback(async () => {
    const analytics = getHabitAnalytics();
    if (!analytics || analytics.totalHabits === 0) {
      setInsight(null);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: 'grow',
          systemPrompt: `You are a supportive habit coach providing brief, personalized insights.
Based on the user's habit data, provide ONE short insight (max 2 sentences).
Be encouraging but honest. Focus on actionable advice.
Respond with ONLY valid JSON: {"type": "streak_risk"|"momentum"|"suggestion"|"achievement"|"encouragement", "title": "Short Title (max 20 chars)", "message": "Your insight message (max 120 chars)"}`,
          messages: [{
            role: 'user',
            content: `My habit data:
- ${analytics.totalHabits} active habits
- Today's progress: ${analytics.todayProgress}%
- Weekly consistency: ${analytics.weeklyConsistency}%
- Habits at risk (2+ days missed): ${analytics.habitsAtRisk.map((h: Habit) => h.title).join(', ') || 'None'}
- Current streaks: ${analytics.habitsWithStreaks.map((h: Habit) => `${h.title} (${h.currentStreak} days)`).join(', ') || 'None'}
- Space type: ${analytics.spaceType}
- Time: ${format(new Date(), 'h:mm a')}

Give me one personalized insight.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      const content = data.message || data.content || data;

      if (typeof content === 'string') {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setInsight({
            ...parsed,
            priority: parsed.priority || 'medium'
          });
          setLastRefresh(Date.now());
          setLastUpdated(new Date());
          return;
        }
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.warn('AI insight failed, using local fallback:', error);
      setInsight(generateLocalInsight());
      setLastRefresh(Date.now());
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [getHabitAnalytics, generateLocalInsight]);

  // Initial load and periodic refresh
  useEffect(() => {
    if (user && currentSpace && habits.length > 0 && !isDismissed) {
      // Only fetch if we haven't recently (5 min cooldown)
      const timeSinceRefresh = Date.now() - lastRefresh;
      if (timeSinceRefresh > 5 * 60 * 1000 || lastRefresh === 0) {
        fetchAIInsight();
      }
    }
  }, [user, currentSpace, habits.length, isDismissed, fetchAIInsight, lastRefresh]);

  // Auto-refresh insight on habit completion
  useEffect(() => {
    if (completions.length > 0 && !isDismissed) {
      // Debounce: only refresh if last completion was recent
      const lastCompletion = completions[completions.length - 1];
      const timeSinceCompletion = Date.now() - new Date(lastCompletion.completedAt).getTime();
      if (timeSinceCompletion < 5000) {
        // Use local insight for immediate feedback
        setInsight(generateLocalInsight());
        setLastUpdated(new Date());
      }
    }
  }, [completions.length, isDismissed, generateLocalInsight, completions]);

  const handleRefresh = () => {
    setIsDismissed(false);
    fetchAIInsight();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setInsight(null);
  };

  // Get insight icon based on type
  const getInsightIcon = useCallback(() => {
    switch (insight?.type) {
      case 'streak_risk': return <AlertTriangle className="h-3.5 w-3.5" />;
      case 'momentum': return <TrendingUp className="h-3.5 w-3.5" />;
      case 'achievement': return <Trophy className="h-3.5 w-3.5" />;
      case 'suggestion': return <Lightbulb className="h-3.5 w-3.5" />;
      case 'encouragement': return <Flame className="h-3.5 w-3.5" />;
      default: return <Target className="h-3.5 w-3.5" />;
    }
  }, [insight?.type]);

  // Build sections for the shared component
  const sections: AIInsightsSection[] = useMemo(() => {
    if (!insight) return [];

    return [
      // Insight Type & Title
      {
        icon: getInsightIcon(),
        label: insight.type.replace('_', ' '),
        content: (
          <p className="text-lg font-semibold text-white">
            {insight.title}
          </p>
        ),
      },
      // Recommendation
      {
        icon: <Zap className="h-3.5 w-3.5" />,
        label: "Recommendation",
        content: (
          <div className="space-y-2">
            <AIInsightsText>{insight.message}</AIInsightsText>
            {/* Quick action for at-risk habits */}
            {insight.type === 'streak_risk' && insight.habitId && (
              <button
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: primaryColor }}
                onClick={() => {
                  const habitElement = document.getElementById(`habit-${insight.habitId}`);
                  habitElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <Target className="h-3 w-3" />
                Go to habit
              </button>
            )}
          </div>
        ),
      },
    ];
  }, [insight, primaryColor, getInsightIcon]);

  // Don't render if no habits
  if (!currentSpace || habits.length === 0) {
    return null;
  }

  // Show minimal refresh button if dismissed
  if (isDismissed) {
    return (
      <div className={cn("mb-6", className)}>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-full border bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          style={{ borderColor: `${primaryColor}33` }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} />
          Show AI Insights
        </button>
      </div>
    );
  }

  return (
    <AIInsightsCard
      title="AI Habit Insights"
      sections={sections}
      accentColor={primaryColor}
      variant="default"
      isLoading={isLoading}
      loadingMessage="Analyzing your habits..."
      error={null}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      onDismiss={handleDismiss}
      refreshDisabled={isLoading}
      className={className}
    />
  );
}
