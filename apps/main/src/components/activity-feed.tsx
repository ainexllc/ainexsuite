'use client';

import { useEffect, useState } from 'react';
import { subscribeToActivityFeed } from '@ainexsuite/firebase';
import {
  Activity,
  ActivityFeedResponse,
  SearchableApp,
  getActivityDescription,
  getActivityColor,
  formatActivityTime,
} from '@ainexsuite/types';
import {
  FileText,
  CheckSquare,
  Image as ImageIcon,
  BookOpen,
  Activity as ActivityIcon,
  Dumbbell,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Archive,
  Pin,
  Filter,
} from 'lucide-react';

const APP_ICONS: Record<SearchableApp, React.ReactNode> = {
  notes: <FileText className="h-4 w-4" />,
  journey: <BookOpen className="h-4 w-4" />,
  todo: <CheckSquare className="h-4 w-4" />,
  health: <ActivityIcon className="h-4 w-4" />,
  moments: <ImageIcon className="h-4 w-4" />,
  grow: <BookOpen className="h-4 w-4" />,
  pulse: <ActivityIcon className="h-4 w-4" />,
  fit: <Dumbbell className="h-4 w-4" />,
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <Plus className="h-3 w-3" />,
  updated: <Edit className="h-3 w-3" />,
  deleted: <Trash2 className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />,
  pinned: <Pin className="h-3 w-3" />,
};

const APP_COLORS: Record<SearchableApp, string> = {
  notes: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  journey: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  todo: 'bg-green-500/10 text-green-500 border-green-500/20',
  health: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  moments: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  grow: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  pulse: 'bg-red-500/10 text-red-500 border-red-500/20',
  fit: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

interface ActivityFeedProps {
  limit?: number;
}

export default function ActivityFeed({ limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterApp, setFilterApp] = useState<SearchableApp | 'all'>('all');

  useEffect(() => {
    const unsubscribe = subscribeToActivityFeed(
      {
        limit,
        apps: filterApp !== 'all' ? [filterApp] : undefined,
      },
      (response: ActivityFeedResponse) => {
        setActivities(response.activities);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limit, filterApp]);

  if (loading) {
    return (
      <div className="surface-card rounded-xl p-8 text-center">
        <div className="h-6 w-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-ink-600">Loading activity...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="surface-card rounded-xl p-8 text-center">
        <ActivityIcon className="h-12 w-12 text-ink-500 mx-auto mb-3" />
        <p className="text-ink-600">No recent activity</p>
        <p className="text-sm text-ink-500 mt-2">
          Start using your apps to see activity here
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-xl overflow-hidden">
      {/* Header with Filter */}
      <div className="border-b border-outline-base p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          Recent Activity
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-ink-500" />
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value as SearchableApp | 'all')}
            className="px-3 py-1.5 rounded-lg bg-surface-muted text-ink-900 text-sm border border-outline-base focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="all">All Apps</option>
            <option value="notes">Notes</option>
            <option value="journey">Journey</option>
            <option value="todo">Todo</option>
            <option value="health">Health</option>
            <option value="moments">Moments</option>
            <option value="grow">Grow</option>
            <option value="pulse">Pulse</option>
            <option value="fit">Fit</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-outline-base max-h-[600px] overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className={`p-2 rounded-lg border ${APP_COLORS[activity.app]}`}>
                {APP_ICONS[activity.app]}
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Action Icon */}
                  <div className={`${getActivityColor(activity)}`}>
                    {ACTION_ICONS[activity.action] || (
                      <ActivityIcon className="h-3 w-3" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-ink-900">
                    <span className="capitalize">{getActivityDescription(activity)}</span>
                    {': '}
                    <span className="font-medium">{activity.itemTitle}</span>
                  </p>
                </div>

                {/* Metadata */}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="text-xs text-ink-500 mb-1">
                    {Object.entries(activity.metadata)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-ink-500">
                  {formatActivityTime(activity.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {activities.length >= limit && (
        <div className="border-t border-outline-base p-4 text-center">
          <p className="text-sm text-ink-600">
            Showing last {limit} activities
          </p>
        </div>
      )}
    </div>
  );
}
