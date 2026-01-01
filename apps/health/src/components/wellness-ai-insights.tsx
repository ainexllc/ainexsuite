'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { generateWellnessInsights, type WellnessInsight } from '@/lib/wellness-ai';
import { cn } from '@/lib/utils';

interface WellnessAIInsightsProps {
  compact?: boolean;
}

export function WellnessAIInsights({ compact = false }: WellnessAIInsightsProps) {
  const [insights, setInsights] = useState<WellnessInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const data = await generateWellnessInsights();
      setInsights(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setError('Unable to generate insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getInsightIcon = (type: WellnessInsight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'correlation':
        return <TrendingDown className="h-4 w-4 text-purple-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-purple-500" />;
    }
  };

  const getInsightBg = (type: WellnessInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-emerald-500/5 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/5 border-amber-500/20';
      case 'suggestion':
        return 'bg-blue-500/5 border-blue-500/20';
      case 'correlation':
        return 'bg-purple-500/5 border-purple-500/20';
      default:
        return 'bg-ink-500/5 border-ink-500/20';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "bg-surface-elevated rounded-xl border border-outline-subtle",
        compact ? "p-3" : "p-4"
      )}>
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          <span className="text-sm text-ink-500">Analyzing your wellness data...</span>
        </div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return (
      <div className={cn(
        "bg-surface-elevated rounded-xl border border-outline-subtle",
        compact ? "p-3" : "p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-ink-500">
              {error || 'Log more data to unlock AI insights'}
            </span>
          </div>
          <button
            onClick={() => loadInsights(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4 text-ink-400", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact horizontal scroll view for mobile
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-ink-500">
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => loadInsights(true)}
            disabled={refreshing}
            className="p-1 rounded-lg hover:bg-ink-100 transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-ink-400", refreshing && "animate-spin")} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border flex-shrink-0 min-w-[200px] max-w-[280px]",
                getInsightBg(insight.type)
              )}
            >
              {getInsightIcon(insight.type)}
              <p className="text-xs text-ink-700 line-clamp-2">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-xl border border-outline-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h3 className="font-semibold text-ink-900 text-sm">AI Insights</h3>
          <span className="text-xs text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">
            {insights.length}
          </span>
        </div>
        <button
          onClick={() => loadInsights(true)}
          disabled={refreshing}
          className="p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
        >
          <RefreshCw className={cn("h-4 w-4 text-ink-400", refreshing && "animate-spin")} />
        </button>
      </div>

      <div className="space-y-2">
        {insights.slice(0, 4).map((insight, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-colors",
              getInsightBg(insight.type)
            )}
          >
            <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink-800">{insight.message}</p>
              {insight.action && (
                <button className="flex items-center gap-1 mt-1.5 text-xs font-medium text-purple-600 hover:text-purple-700">
                  {insight.action}
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
