'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import {
  AIInsightsCard,
  AIInsightsBulletList,
  AIInsightsText,
} from '@ainexsuite/ui';
import type { AIInsightsSection } from '@ainexsuite/ui';
import { useSubscriptions } from '@/components/providers/subscription-provider';

interface InsightData {
  spendingTrend: string;
  recommendations: string[];
  projectedYearly: string;
  anomalies: string[];
}

export function SubscriptionInsights() {
  const { subscriptions } = useSubscriptions();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const initialCheckRef = useRef(false);

  const accentColor = '#10b981'; // emerald-500

  const hasEnoughData = subscriptions.length >= 2;
  const STORAGE_KEY = 'ainex-subscription-insights';
  const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

  const generateInsights = async () => {
    if (!hasEnoughData || loading) return;

    setLoading(true);
    setError(null);

    try {
      const payload = subscriptions.map(s => ({
        name: s.name,
        cost: s.cost,
        billingCycle: s.billingCycle,
        category: s.category
      }));

      const response = await fetch('/api/ai/subscription-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptions: payload }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ insights: result, timestamp: Date.now() }));
    } catch (err) {
      console.error(err);
      setError('Could not analyze spending data.');
    } finally {
      setLoading(false);
    }
  };

  // Load from cache
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const { insights, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(insights);
          setLastUpdated(new Date(timestamp));
          return;
        }
      } catch {
        // Invalid cache, ignore
      }
    }

    if (hasEnoughData && !initialCheckRef.current) {
      initialCheckRef.current = true;
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnoughData]);

  const sections: AIInsightsSection[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        label: 'Spending Trend',
        content: <AIInsightsText>{data.spendingTrend}</AIInsightsText>,
      },
      {
        icon: <DollarSign className="h-3.5 w-3.5" />,
        label: 'Projected Yearly',
        content: <AIInsightsText>{data.projectedYearly}</AIInsightsText>,
      },
      {
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
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

  if (!hasEnoughData) return null;

  return (
    <AIInsightsCard
      title="AI Spending Analyst"
      sections={sections}
      accentColor={accentColor}
      variant="sidebar"
      isLoading={loading}
      loadingMessage="Analyzing your subscriptions..."
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={generateInsights}
      refreshDisabled={loading}
    />
  );
}
