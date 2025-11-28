'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Target, Zap } from 'lucide-react';
import type { HealthMetric } from '@ainexsuite/types';
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsText,
} from '@ainexsuite/ui';
import type { AIInsightsSection } from '@ainexsuite/ui';

interface InsightData {
  weeklyTrend: string;
  recommendations: string[];
  focusArea: string;
}

interface HealthInsightsProps {
  metrics: HealthMetric[];
  variant?: 'default' | 'sidebar' | 'condensed';
  onExpand?: () => void;
}

export function HealthInsights({ metrics, variant = 'default', onExpand }: HealthInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const accentColor = '#10b981'; // emerald-500

  // Get recent metrics for analysis
  const recentMetrics = metrics
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 14); // Last 2 weeks

  const hasEnoughData = recentMetrics.length >= 2;
  const STORAGE_KEY = 'ainex-health-insights';
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
      const payload = recentMetrics.map(m => ({
        date: m.date,
        weight: m.weight,
        sleep: m.sleep,
        water: m.water,
        energy: m.energy,
        mood: m.mood,
        heartRate: m.heartRate,
        notes: m.notes,
      }));

      const response = await fetch('/api/ai/health-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: payload }),
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
      setError('Could not analyze health data.');
    } finally {
      setLoading(false);
    }
  };

  // Load from cache or auto-generate
  useEffect(() => {
    if (!hasEnoughData) return;

    const cached = localStorage.getItem(STORAGE_KEY);
    let loadedFromCache = false;

    if (cached) {
      try {
        const { insights, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_DURATION) {
          setData(insights);
          setLastUpdated(new Date(timestamp));
          loadedFromCache = true;
        }
      } catch {
        // Invalid cache, ignore
      }
    }

    if (!loadedFromCache && !data && !loading && !error) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnoughData]);

  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        label: 'Weekly Trend',
        content: <AIInsightsText>{data.weeklyTrend}</AIInsightsText>,
      },
      {
        icon: <Target className="h-3.5 w-3.5" />,
        label: 'Focus Area',
        content: <AIInsightsText>{data.focusArea}</AIInsightsText>,
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
    if (data.weeklyTrend) return data.weeklyTrend;
    if (data.recommendations.length > 0) return data.recommendations[0];
    return undefined;
  }, [data]);

  const errorMessage = error?.includes('API key')
    ? 'AI features require configuration. Health insights will be available once set up.'
    : error;

  // Show prompt to add more data if not enough
  if (!hasEnoughData) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Zap className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">AI Wellness Coach</p>
            <p className="text-xs text-white/50">
              Log at least 2 health check-ins to unlock AI-powered wellness insights
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AIInsightsCard
      title="AI Wellness Coach"
      sections={sections}
      accentColor={accentColor}
      variant={variant}
      isLoading={loading}
      loadingMessage="Analyzing your health data..."
      error={errorMessage}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
      onExpand={onExpand}
      condensedSummary={condensedSummary}
    />
  );
}
