'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  Dumbbell,
  Target,
  Heart,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import type { WellnessActivityItem } from '@ainexsuite/types';
import { buildActivityFeed } from '@/lib/wellness-hub';

const FIT_APP_URL = process.env.NEXT_PUBLIC_FIT_APP_URL || 'https://fit.ainexsuite.com';
const HABITS_APP_URL = process.env.NEXT_PUBLIC_HABITS_APP_URL || 'https://habits.ainexsuite.com';

function getAppUrl(source: string): string {
  switch (source) {
    case 'fit':
      return FIT_APP_URL;
    case 'habits':
      return HABITS_APP_URL;
    default:
      return '/workspace';
  }
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'fit':
      return <Dumbbell className="h-4 w-4" />;
    case 'habits':
      return <Target className="h-4 w-4" />;
    case 'health':
      return <Heart className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getSourceColor(source: string) {
  switch (source) {
    case 'fit':
      return 'text-blue-500 bg-blue-500/10';
    case 'habits':
      return 'text-teal-500 bg-teal-500/10';
    case 'health':
      return 'text-emerald-500 bg-emerald-500/10';
    default:
      return 'text-ink-500 bg-ink-500/10';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

interface WellnessActivityFeedProps {
  compact?: boolean;
}

export function WellnessActivityFeed({ compact = false }: WellnessActivityFeedProps) {
  const [activities, setActivities] = useState<WellnessActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        // Need to export buildActivityFeed from wellness-hub
        const feed = await buildActivityFeed(compact ? 5 : 15);
        setActivities(feed);
      } catch (err) {
        console.error('Failed to load activity feed:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadActivities();
  }, [compact]);

  if (loading) {
    return (
      <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-3' : 'p-6'}`}>
        <div className={`flex items-center gap-2 ${compact ? 'mb-2' : 'mb-4'}`}>
          <Activity className={compact ? 'h-4 w-4 text-ink-500' : 'h-5 w-5 text-ink-500'} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>Recent Activity</h3>
        </div>
        <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-8'}`}>
          <Loader2 className={`animate-spin text-ink-400 ${compact ? 'h-4 w-4' : 'h-6 w-6'}`} />
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-3' : 'p-6'}`}>
        <div className={`flex items-center gap-2 ${compact ? 'mb-2' : 'mb-4'}`}>
          <Activity className={compact ? 'h-4 w-4 text-ink-500' : 'h-5 w-5 text-ink-500'} />
          <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>Recent Activity</h3>
        </div>
        <div className={`text-center ${compact ? 'py-4' : 'py-8'}`}>
          <Activity className={`mx-auto mb-3 text-ink-300 ${compact ? 'h-6 w-6' : 'h-10 w-10'}`} />
          <p className={`text-ink-500 ${compact ? 'text-xs' : 'text-sm'}`}>No recent activity</p>
          {!compact && (
            <p className="text-xs text-ink-400 mt-1">
              Start tracking your health, workouts, and habits
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-elevated rounded-2xl border border-outline-subtle ${compact ? 'p-3' : 'p-6'}`}>
      <div className={`flex items-center gap-2 ${compact ? 'mb-2' : 'mb-4'}`}>
        <Activity className={compact ? 'h-4 w-4 text-ink-500' : 'h-5 w-5 text-ink-500'} />
        <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : ''}`}>Recent Activity</h3>
      </div>

      <div className={compact ? 'flex gap-2 overflow-x-auto pb-1' : 'space-y-3'}>
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={
              compact
                ? 'flex-shrink-0 flex items-center gap-2 p-2 rounded-lg bg-surface-muted hover:bg-surface-muted/80 transition-colors group min-w-[180px]'
                : 'flex items-start gap-3 p-3 rounded-xl bg-surface-muted hover:bg-surface-muted/80 transition-colors group'
            }
          >
            {/* Icon */}
            <div
              className={`rounded-lg flex items-center justify-center shrink-0 ${getSourceColor(activity.source)} ${compact ? 'h-6 w-6' : 'h-9 w-9'}`}
            >
              {activity.icon ? (
                <span className={compact ? 'text-xs' : 'text-lg'}>{activity.icon}</span>
              ) : (
                compact ? (
                  <span className="[&>svg]:h-3 [&>svg]:w-3">{getSourceIcon(activity.source)}</span>
                ) : (
                  getSourceIcon(activity.source)
                )
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-ink-900 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                {activity.title}
              </p>
              {!compact && activity.subtitle && (
                <p className="text-xs text-ink-500 truncate">{activity.subtitle}</p>
              )}
              <div className={`flex items-center gap-1 ${compact ? 'mt-0.5' : 'mt-1 gap-2'}`}>
                <Clock className={compact ? 'h-2.5 w-2.5 text-ink-400' : 'h-3 w-3 text-ink-400'} />
                <span className={`text-ink-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                  {formatTimestamp(activity.timestamp)}
                </span>
                {!compact && (
                  <>
                    <span className="text-xs text-ink-300">•</span>
                    <span className="text-xs text-ink-400 capitalize">{activity.source}</span>
                  </>
                )}
              </div>
            </div>

            {/* Link - hidden in compact mode */}
            {!compact && activity.appUrl && (
              <a
                href={`${getAppUrl(activity.source)}${activity.appUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-ink-100"
              >
                <ExternalLink className="h-4 w-4 text-ink-400" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
