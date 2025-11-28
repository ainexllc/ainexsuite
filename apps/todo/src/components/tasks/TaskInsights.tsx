'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, Target, Zap, Trophy } from 'lucide-react';
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsText,
} from '@ainexsuite/ui';
import type { AIInsightsSection } from '@ainexsuite/ui';
import { useTodoStore } from '@/lib/store';
import { Task } from '@/types/models';

interface InsightData {
  productivityTrend: string;
  recommendations: string[];
  focusArea: string;
}

interface TaskInsightsProps {
  variant?: 'default' | 'sidebar' | 'condensed';
  onExpand?: () => void;
}

export function TaskInsights({ variant = 'default', onExpand }: TaskInsightsProps) {
  const { tasks } = useTodoStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [storeReady, setStoreReady] = useState(false);
  const initialCheckRef = useRef(false);

  const accentColor = '#6366f1'; // indigo-500 (Todo app accent)

  // Wait for store to be hydrated (tasks loaded from Firestore)
  useEffect(() => {
    // Give the store time to hydrate from Firestore
    const timer = setTimeout(() => {
      setStoreReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate Productivity Score
  const productivityScore = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0;

    let score = 0;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    tasks.forEach((task: Task) => {
      if (task.status === 'done') {
        const completedAt = new Date(task.updatedAt); // Assuming updatedAt is completion time for completed tasks
        if (completedAt > sevenDaysAgo) {
          score += 10;
          if (task.priority === 'high') score += 5;
        }
      }
      
      // Penalty for overdue incomplete tasks
      if (task.status !== 'done' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < now && dueDate.getDate() !== now.getDate()) {
          score -= 5;
        }
      }
    });

    return Math.max(0, score);
  }, [tasks]);

  // Get recent tasks for analysis
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20); // Last 20 tasks

  const hasEnoughData = recentTasks.length >= 2;
  const STORAGE_KEY = 'ainex-task-insights';
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
      const payload = recentTasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        tags: t.tags,
        subtasks: t.subtasks.map(st => ({ title: st.title, isCompleted: st.isCompleted })),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      const response = await fetch('/api/ai/task-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: payload }),
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
      setError('Could not analyze task data.');
    } finally {
      setLoading(false);
    }
  };

  // Load from cache or auto-generate
  useEffect(() => {
    if (!storeReady) return;

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

    // Generate if we have enough data and haven't already
    if (hasEnoughData && !data && !loading && !error && !initialCheckRef.current) {
      initialCheckRef.current = true;
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeReady, hasEnoughData]);

  const sections: AIInsightsSection[] = useMemo(() => {
    const items: AIInsightsSection[] = [];

    // Always show Score if we have data, even if AI failed
    items.push({
      icon: <Trophy className="h-3.5 w-3.5" />,
      label: 'Productivity Score',
      content: (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-accent-500">{productivityScore}</span>
          <span className="text-xs text-muted">points this week</span>
        </div>
      ),
    });

    if (data) {
      items.push(
        {
          icon: <TrendingUp className="h-3.5 w-3.5" />,
          label: 'Productivity',
          content: <AIInsightsText>{data.productivityTrend}</AIInsightsText>,
        },
        {
          icon: <Target className="h-3.5 w-3.5" />,
          label: 'Focus Area',
          content: <AIInsightsText>{data.focusArea}</AIInsightsText>,
        },
        {
          icon: <Zap className="h-3.5 w-3.5" />,
          label: 'Tips',
          content: (
            <AIInsightsBulletList
              items={data.recommendations}
              accentColor={accentColor}
            />
          ),
        }
      );
    }

    return items;
  }, [data, productivityScore]);

  const condensedSummary = useMemo(() => {
    if (!data) return undefined;
    if (data.productivityTrend) return data.productivityTrend;
    if (data.recommendations.length > 0) return data.recommendations[0];
    return undefined;
  }, [data]);

  // Don't render anything until store is ready
  if (!storeReady) return null;

  const errorMessage = error?.includes('API key')
    ? 'AI features require configuration. Task insights will be available once set up.'
    : error;

  // Show prompt to add more tasks if not enough data
  if (!hasEnoughData) {
    return (
      <div className="rounded-2xl border border-border bg-foreground/5 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Zap className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI Productivity Coach</p>
            <p className="text-xs text-muted-foreground">
              Add at least 2 tasks to unlock AI-powered productivity insights
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AIInsightsCard
      title="AI Productivity Coach"
      sections={sections}
      accentColor={accentColor}
      variant={variant}
      isLoading={loading}
      loadingMessage="Analyzing your tasks..."
      error={errorMessage}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
      onExpand={onExpand}
      condensedSummary={condensedSummary}
    />
  );
}
