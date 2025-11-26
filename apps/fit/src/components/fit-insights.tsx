'use client';

import { useState, useEffect, useMemo } from 'react';
import { Zap, Target, TrendingUp } from 'lucide-react';
import { useFitStore } from '@/lib/store';
import { useAuth } from '@ainexsuite/auth';
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsText,
} from '@ainexsuite/ui';
import type { AIInsightsSection } from '@ainexsuite/ui';

interface InsightData {
  weeklyProgress: string;
  recommendations: string[];
  nextWorkoutSuggestion: string;
}

interface FitInsightsProps {
  variant?: 'default' | 'sidebar' | 'condensed';
  onExpand?: () => void;
}

export function FitInsights({ variant = 'default', onExpand }: FitInsightsProps) {
  const { user } = useAuth();
  const { workouts } = useFitStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const accentColor = '#f97316'; // orange-500

  // Only analyze user's own workouts
  const userWorkouts = workouts.filter(w => w.userId === user?.uid);
  const recentWorkouts = userWorkouts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const hasEnoughData = recentWorkouts.length >= 2;
  const STORAGE_KEY = 'ainex-fit-workspace-insights';
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  const saveToCache = (insights: InsightData) => {
    const cacheData = {
      insights,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    setLastUpdated(new Date());
  };

  const generateInsights = async () => {
    if (!hasEnoughData || loading) return;

    setLoading(true);
    setError(null);

    try {
      const payload = recentWorkouts.map(w => ({
        title: w.title,
        date: w.date,
        duration: w.duration,
        exercises: w.exercises.map(e => ({
          name: e.name,
          sets: e.sets.length,
          totalReps: e.sets.reduce((sum, s) => sum + (s.reps || 0), 0),
          totalWeight: e.sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0),
        })),
        feeling: w.feeling,
      }));

      const response = await fetch('/api/ai/fit-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workouts: payload }),
      });

      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({ error: 'Server error' }));
          if (errorData.error?.includes('API key') || errorData.error?.includes('configuration missing')) {
            throw new Error('AI features require API key configuration.');
          }
        }
        throw new Error('Failed to generate insights');
      }

      const result = await response.json();
      setData(result);
      saveToCache(result);
    } catch (err) {
      console.error(err);
      setError('Could not analyze workouts.');
    } finally {
      setLoading(false);
    }
  };

  // Load from cache or auto-generate
  useEffect(() => {
    if (!user) return;

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const { insights, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION) {
          setData(insights);
          setLastUpdated(new Date(timestamp));
          return;
        }
      } catch {
        // Invalid cache, ignore
      }
    }

    if (hasEnoughData && !data && !loading && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasEnoughData]);

  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        label: 'Weekly Progress',
        content: <AIInsightsText>{data.weeklyProgress}</AIInsightsText>,
      },
      {
        icon: <Target className="h-3.5 w-3.5" />,
        label: 'Next Workout',
        content: <AIInsightsText>{data.nextWorkoutSuggestion}</AIInsightsText>,
      },
      {
        icon: <Zap className="h-3.5 w-3.5" />,
        label: 'Recommendations',
        content: (
          <AIInsightsBulletList
            items={data.recommendations}
            accentColor={accentColor}
          />
        ),
      },
    ];
  }, [data]);

  const condensedSummary = useMemo(() => {
    if (!data) return undefined;
    if (data.weeklyProgress) return data.weeklyProgress;
    if (data.recommendations.length > 0) return data.recommendations[0];
    return undefined;
  }, [data]);

  if (!user || !hasEnoughData) return null;

  const errorMessage = error?.includes('API key')
    ? 'AI features require configuration.'
    : error;

  return (
    <AIInsightsCard
      title="AI Coach"
      sections={sections}
      accentColor={accentColor}
      variant={variant}
      isLoading={loading}
      loadingMessage="Analyzing your workouts..."
      error={errorMessage}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
      onExpand={onExpand}
      condensedSummary={condensedSummary}
    />
  );
}
