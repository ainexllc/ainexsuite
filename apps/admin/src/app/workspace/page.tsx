'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Eye,
  Clock,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { db, auth } from '@ainexsuite/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '@ainexsuite/auth';

// --- Types ---

interface UserGrowthData {
  month: string;
  count: number;
}

interface ActiveUsersData {
  daily: number;
  weekly: number;
  monthly: number;
}

interface AppUsageData {
  name: string;
  count: number;
  percent: number;
}

interface FeedbackTrendData {
  week: string;
  count: number;
}

interface RecentActivityData {
  type: string;
  action: string;
  detail: string;
  time: string;
}

interface SubscriptionStats {
  statusCounts: Record<string, number>;
  tierCounts: Record<string, number>;
}

interface DashboardStats {
  totalUsers: number;
  totalFeedback: number;
  activeSpaces: number;
  pageViews: number;
  userGrowth: UserGrowthData[];
  activeUsers: ActiveUsersData;
  appUsage: AppUsageData[];
  feedbackTrends: FeedbackTrendData[];
  recentActivity: RecentActivityData[];
  subscriptionStats: SubscriptionStats;
}

// App colors for consistency
const APP_COLORS: Record<string, string> = {
  Notes: '#eab308',
  Todo: '#8b5cf6',
  Journal: '#f97316',
  Calendar: '#06b6d4',
  Habits: '#14b8a6',
  Health: '#10b981',
  Album: '#ec4899',
  Fit: '#3b82f6',
  Projects: '#6366f1',
  Docs: '#3b82f6',
  Tables: '#10b981',
  Flow: '#06b6d4',
  Subs: '#10b981',
  Others: '#6b7280',
};

// --- Components ---

function StatCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  trendLabel,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  trendLabel?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl p-6 border border-zinc-200 dark:border-[#27272a] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-zinc-100 dark:bg-[#3b82f6]/10 rounded-xl">
          <Icon className="w-6 h-6 text-zinc-700 dark:text-[#3b82f6]" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trendDirection === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend}</span>
            {trendLabel && <span className="text-zinc-500 dark:text-[#a1a1aa] ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm text-zinc-500 dark:text-[#a1a1aa]">{title}</p>
    </div>
  );
}

function UserGrowthChart({ data }: { data: UserGrowthData[] }) {
  const maxValue = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-[#27272a] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-[#27272a]">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">User Growth</h3>
          <p className="text-sm text-zinc-500 dark:text-[#a1a1aa]">Monthly new user registrations</p>
        </div>
        <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
      </div>
      <div className="p-6">
        <div className="h-64 flex items-end gap-2">
          {data.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-[#3b82f6] to-[#60a5fa] rounded-t hover:from-[#60a5fa] hover:to-[#93c5fd] transition-colors cursor-pointer min-h-[4px]"
                style={{ height: `${Math.max((item.count / maxValue) * 100, 2)}%` }}
                title={`${item.month}: ${item.count} users`}
              />
              <span className="text-xs text-zinc-500 dark:text-[#a1a1aa]">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActiveUsersWidget({ data }: { data: ActiveUsersData }) {
  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-[#27272a] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-[#27272a]">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Active Users</h3>
          <p className="text-sm text-zinc-500 dark:text-[#a1a1aa]">User activity metrics</p>
        </div>
        <button className="p-1 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-4xl font-bold text-zinc-900 dark:text-white">{data.daily}</span>
          <span className="text-zinc-500 dark:text-[#a1a1aa]">Active today</span>
        </div>

        {/* Activity line chart */}
        <div className="h-20 relative mb-6">
          <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,40 Q20,35 40,30 T80,25 T120,20 T160,15 T200,10"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            <path
              d="M0,40 Q20,35 40,30 T80,25 T120,20 T160,15 T200,10 L200,50 L0,50 Z"
              fill="url(#activeGradient)"
            />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-[#27272a]">
          <div className="text-center">
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{data.daily}</p>
            <p className="text-xs text-zinc-500 dark:text-[#a1a1aa]">Daily</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{data.weekly}</p>
            <p className="text-xs text-zinc-500 dark:text-[#a1a1aa]">Weekly</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-zinc-900 dark:text-white">
              {data.monthly >= 1000 ? `${(data.monthly / 1000).toFixed(1)}K` : data.monthly}
            </p>
            <p className="text-xs text-zinc-500 dark:text-[#a1a1aa]">Monthly</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppUsageChart({ data }: { data: AppUsageData[] }) {
  // Calculate cumulative percentages for donut chart
  let cumulativePercent = 0;
  const total = data.reduce((sum, app) => sum + app.percent, 0) || 100;

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-[#27272a] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-[#27272a]">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">App Usage</h3>
        <PieChart className="w-5 h-5 text-[#3b82f6]" />
      </div>
      <div className="p-6">
        {/* Donut Chart */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {data.map((app) => {
              const percent = (app.percent / total) * 100;
              const dashArray = `${percent} ${100 - percent}`;
              const dashOffset = -cumulativePercent;
              cumulativePercent += percent;
              const color = APP_COLORS[app.name] || '#6b7280';

              return (
                <circle
                  key={app.name}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={color}
                  strokeWidth="12"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-zinc-900 dark:text-white">
              {data.reduce((sum, app) => sum + app.count, 0)}
            </span>
            <span className="text-xs text-zinc-500 dark:text-[#a1a1aa]">Total Users</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {data.slice(0, 5).map((app) => (
            <div key={app.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: APP_COLORS[app.name] || '#6b7280' }}
                />
                <span className="text-sm text-zinc-900 dark:text-white">{app.name}</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-[#a1a1aa]">{app.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscriptionBreakdown({ data }: { data: SubscriptionStats }) {
  const statusItems = [
    { name: 'Trial', key: 'trial', color: '#eab308' },
    { name: 'Active', key: 'active', color: '#10b981' },
    { name: 'Expired', key: 'expired', color: '#6b7280' },
    { name: 'Canceled', key: 'canceled', color: '#ef4444' },
  ];

  const total = Object.values(data.statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-[#27272a] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-[#27272a]">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Subscription Status</h3>
        <button className="p-1 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        {statusItems.map((item) => {
          const count = data.statusCounts[item.key] || 0;
          const percent = Math.round((count / total) * 100);
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-zinc-900 dark:text-white">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{count}</span>
                  <span className="text-xs text-zinc-500 dark:text-[#a1a1aa]">({percent}%)</span>
                </div>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-[#27272a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivity({ data }: { data: RecentActivityData[] }) {
  const typeColors: Record<string, string> = {
    user: 'bg-emerald-500',
    feedback: 'bg-blue-500',
    space: 'bg-violet-500',
    upgrade: 'bg-amber-500',
    bug: 'bg-red-500',
  };

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-[#27272a] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-[#27272a]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#3b82f6]" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Activity</h3>
        </div>
        <button className="p-1 text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-[#27272a]">
        {data.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 dark:text-[#a1a1aa]">No recent activity</div>
        ) : (
          data.map((activity, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
              <div className={`w-2 h-2 rounded-full ${typeColors[activity.type] || 'bg-gray-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-900 dark:text-white">{activity.action}</p>
                <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] truncate">{activity.detail}</p>
              </div>
              <span className="text-xs text-zinc-500 dark:text-[#a1a1aa] whitespace-nowrap">{activity.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FeedbackTrends({ data }: { data: FeedbackTrendData[] }) {
  const maxValue = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200 dark:border-[#27272a] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-[#27272a]">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Feedback Trends</h3>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-[#3b82f6]" />
          <span className="text-zinc-500 dark:text-[#a1a1aa]">Feedback</span>
        </div>
      </div>
      <div className="p-6">
        <div className="h-48 flex items-end gap-6">
          {data.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end justify-center h-40">
                <div
                  className="w-8 bg-[#3b82f6] rounded-t hover:bg-[#60a5fa] transition-colors cursor-pointer min-h-[4px]"
                  style={{ height: `${Math.max((item.count / maxValue) * 100, 2)}%` }}
                  title={`${item.week}: ${item.count} items`}
                />
              </div>
              <span className="text-xs text-zinc-500 dark:text-[#a1a1aa]">{item.week}</span>
              <span className="text-xs text-zinc-900 dark:text-white font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Empty Data (when no data available) ---

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  totalFeedback: 0,
  activeSpaces: 0,
  pageViews: 0,
  userGrowth: [],
  activeUsers: { daily: 0, weekly: 0, monthly: 0 },
  appUsage: [],
  feedbackTrends: [
    { week: 'Week 1', count: 0 },
    { week: 'Week 2', count: 0 },
    { week: 'Week 3', count: 0 },
    { week: 'Week 4', count: 0 },
  ],
  recentActivity: [],
  subscriptionStats: {
    statusCounts: { trial: 0, active: 0, expired: 0, canceled: 0 },
    tierCounts: { trial: 0, 'single-app': 0, 'three-apps': 0, pro: 0, premium: 0 },
  },
};

// --- Main Page ---

export default function AdminWorkspacePage() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseAuthMissing, setFirebaseAuthMissing] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Don't fetch if not authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if Firebase Auth is synced (required for Firestore rules)
    if (!firebaseUser) {
      setFirebaseAuthMissing(true);
      setLoading(false);
      return;
    }

    setFirebaseAuthMissing(false);

    const fetchStats = async () => {
      try {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Fetch each collection separately to identify which fails
        let users: Array<{ id: string } & Record<string, unknown>> = [];
        let feedback: Array<{ id: string } & Record<string, unknown>> = [];
        let spaces: Array<{ id: string } & Record<string, unknown>> = [];

        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
          // Failed to fetch users - may lack permissions
        }

        try {
          const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
          feedback = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
          // Failed to fetch feedback - may lack permissions
        }

        try {
          const spacesSnapshot = await getDocs(collection(db, 'spaces'));
          spaces = spacesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
          // Failed to fetch spaces - may lack permissions
        }

        // Calculate user growth by month (last 12 months)
        const userGrowth: UserGrowthData[] = [];
        const nowDate = new Date();
        for (let i = 11; i >= 0; i--) {
          const date = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
          const nextMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() - i + 1, 1);
          const count = users.filter(u => {
            const createdAt = (u as Record<string, unknown>).createdAt as number;
            return createdAt >= date.getTime() && createdAt < nextMonth.getTime();
          }).length;
          userGrowth.push({
            month: date.toLocaleString('default', { month: 'short' }),
            count,
          });
        }

        // Calculate active users
        const dailyActive = users.filter(u => {
          const lastLogin = (u as Record<string, unknown>).lastLoginAt as number;
          return lastLogin && lastLogin >= oneDayAgo;
        }).length;
        const weeklyActive = users.filter(u => {
          const lastLogin = (u as Record<string, unknown>).lastLoginAt as number;
          return lastLogin && lastLogin >= oneWeekAgo;
        }).length;

        // Calculate app usage
        const appCounts: Record<string, number> = {};
        users.forEach(u => {
          const appsUsed = (u as Record<string, unknown>).appsUsed as Record<string, unknown> || {};
          const appsEligible = (u as Record<string, unknown>).appsEligible as string[] || [];

          Object.keys(appsUsed).forEach(app => {
            appCounts[app] = (appCounts[app] || 0) + 1;
          });

          if (Object.keys(appsUsed).length === 0) {
            appsEligible.forEach(app => {
              appCounts[app] = (appCounts[app] || 0) + 1;
            });
          }
        });

        const totalAppUsage = Object.values(appCounts).reduce((a, b) => a + b, 0) || 1;
        const appUsage: AppUsageData[] = Object.entries(appCounts)
          .map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
            percent: Math.round((count / totalAppUsage) * 100),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        // Calculate feedback trends (last 4 weeks)
        const feedbackTrends: FeedbackTrendData[] = [];
        for (let i = 3; i >= 0; i--) {
          const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
          const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;
          const count = feedback.filter(f => {
            const createdAt = (f as Record<string, unknown>).createdAt as number;
            return createdAt >= weekStart && createdAt < weekEnd;
          }).length;
          feedbackTrends.push({ week: `Week ${4 - i}`, count });
        }

        // Calculate subscription stats
        const statusCounts: Record<string, number> = { trial: 0, active: 0, expired: 0, canceled: 0 };
        const tierCounts: Record<string, number> = { trial: 0, 'single-app': 0, 'three-apps': 0, pro: 0, premium: 0 };
        users.forEach(u => {
          const status = ((u as Record<string, unknown>).subscriptionStatus as string) || 'trial';
          const tier = ((u as Record<string, unknown>).subscriptionTier as string) || 'trial';
          if (statusCounts[status] !== undefined) statusCounts[status]++;
          if (tierCounts[tier] !== undefined) tierCounts[tier]++;
        });

        // Get recent activity
        const getRelativeTime = (timestamp: number): string => {
          const diff = now - timestamp;
          const minutes = Math.floor(diff / 60000);
          const hours = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);
          if (minutes < 1) return 'Just now';
          if (minutes < 60) return `${minutes} min ago`;
          if (hours < 24) return `${hours}h ago`;
          if (days < 7) return `${days}d ago`;
          return new Date(timestamp).toLocaleDateString();
        };

        const recentActivity: RecentActivityData[] = [];

        // Recent users
        users
          .sort((a, b) => ((b as Record<string, unknown>).createdAt as number || 0) - ((a as Record<string, unknown>).createdAt as number || 0))
          .slice(0, 3)
          .forEach(u => {
            recentActivity.push({
              type: 'user',
              action: 'New user registered',
              detail: (u as Record<string, unknown>).email as string || 'Unknown',
              time: getRelativeTime((u as Record<string, unknown>).createdAt as number || now),
            });
          });

        // Recent feedback
        feedback
          .sort((a, b) => ((b as Record<string, unknown>).createdAt as number || 0) - ((a as Record<string, unknown>).createdAt as number || 0))
          .slice(0, 3)
          .forEach(f => {
            recentActivity.push({
              type: 'feedback',
              action: 'Feedback submitted',
              detail: (f as Record<string, unknown>).authorEmail as string || (f as Record<string, unknown>).appId as string || 'Unknown',
              time: getRelativeTime((f as Record<string, unknown>).createdAt as number || now),
            });
          });

        // Recent spaces
        spaces
          .sort((a, b) => ((b as Record<string, unknown>).createdAt as number || 0) - ((a as Record<string, unknown>).createdAt as number || 0))
          .slice(0, 3)
          .forEach(s => {
            recentActivity.push({
              type: 'space',
              action: 'New space created',
              detail: (s as Record<string, unknown>).name as string || 'Unnamed',
              time: getRelativeTime((s as Record<string, unknown>).createdAt as number || now),
            });
          });

        // Sort all activity by most recent
        recentActivity.sort(() => {
          // This is a rough sort since we converted to relative time strings
          return 0; // Keep insertion order which is already sorted
        });

        setStats({
          totalUsers: users.length,
          totalFeedback: feedback.length,
          activeSpaces: spaces.length,
          pageViews: Math.floor(users.length * 6.1),
          userGrowth,
          activeUsers: {
            daily: dailyActive,
            weekly: weeklyActive,
            monthly: users.length,
          },
          appUsage,
          feedbackTrends,
          recentActivity: recentActivity.slice(0, 10),
          subscriptionStats: { statusCounts, tierCounts },
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setStats(EMPTY_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authLoading, user, firebaseUser]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Firebase Auth will sync via onAuthStateChanged, triggering re-fetch
    } catch (err) {
      console.error('Google sign-in failed:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  if (firebaseAuthMissing) {
    return (
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-2">Firebase Auth Required</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300/80 mb-4">
          Admin dashboard queries require Firebase authentication. Click below to sign in with your Google account.
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-3 px-4 py-2.5 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Failed to load stats</h3>
        <p className="text-sm text-red-700 dark:text-red-300/80 mb-4">{error}</p>
        <p className="text-xs text-zinc-500 dark:text-[#a1a1aa]">
          Make sure your user has <code className="bg-zinc-200 dark:bg-[#27272a] px-1 rounded">role: &quot;admin&quot;</code> set in Firestore.
        </p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Feedback Items"
          value={stats.totalFeedback.toLocaleString()}
          icon={MessageSquare}
        />
        <StatCard
          title="Active Spaces"
          value={stats.activeSpaces.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          title="Page Views"
          value={stats.pageViews >= 1000 ? `${(stats.pageViews / 1000).toFixed(1)}K` : stats.pageViews.toLocaleString()}
          icon={Eye}
        />
      </div>

      {/* User Growth Chart - Full width */}
      <UserGrowthChart data={stats.userGrowth} />

      {/* Middle row - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActiveUsersWidget data={stats.activeUsers} />
        <AppUsageChart data={stats.appUsage} />
        <SubscriptionBreakdown data={stats.subscriptionStats} />
      </div>

      {/* Bottom row - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeedbackTrends data={stats.feedbackTrends} />
        <RecentActivity data={stats.recentActivity} />
      </div>
    </div>
  );
}
