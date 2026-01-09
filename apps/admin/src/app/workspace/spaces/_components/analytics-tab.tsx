'use client';

import { useMemo } from 'react';
import {
  Layers,
  Users,
  Activity,
  TrendingUp,
  User,
  Heart,
  Briefcase,
  Folder,
  Sparkles,
} from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';

interface SpaceData {
  id: string;
  app: string;
  name: string;
  type: SpaceType;
  memberCount: number;
  createdBy: string;
  createdAt: string;
  lastActive?: string;
}

interface AppConfig {
  id: string;
  name: string;
  color: string;
}

interface AnalyticsTabProps {
  spaces: SpaceData[];
  appConfigs: AppConfig[];
}

const SPACE_TYPE_COLORS: Record<string, string> = {
  personal: '#06b6d4',
  family: '#a855f7',
  work: '#3b82f6',
  couple: '#ec4899',
  buddy: '#f97316',
  squad: '#10b981',
  project: '#6366f1',
};

const SPACE_TYPE_ICONS: Record<string, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Sparkles,
  squad: Users,
  project: Folder,
};

export function AnalyticsTab({ spaces, appConfigs }: AnalyticsTabProps) {
  const analytics = useMemo(() => {
    // Overview stats
    const totalSpaces = spaces.length;
    const totalMembers = spaces.reduce((acc, s) => acc + s.memberCount, 0);
    const avgMembersPerSpace = totalSpaces > 0 ? (totalMembers / totalSpaces).toFixed(1) : '0';

    // Active spaces (activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeSpaces = spaces.filter((s) => {
      const lastActive = s.lastActive ? new Date(s.lastActive) : new Date(s.createdAt);
      return lastActive >= thirtyDaysAgo;
    }).length;

    // Spaces by type
    const spacesByType: Record<string, number> = {};
    spaces.forEach((space) => {
      spacesByType[space.type] = (spacesByType[space.type] || 0) + 1;
    });

    // Spaces by app
    const spacesByApp: Record<string, number> = {};
    spaces.forEach((space) => {
      spacesByApp[space.app] = (spacesByApp[space.app] || 0) + 1;
    });

    // Spaces created over time (last 6 months)
    const now = new Date();
    const monthsData: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = spaces.filter((s) => {
        const created = new Date(s.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;

      monthsData.push({ month: monthKey, count });
    }

    return {
      totalSpaces,
      activeSpaces,
      totalMembers,
      avgMembersPerSpace,
      spacesByType,
      spacesByApp,
      monthsData,
    };
  }, [spaces]);

  // Calculate max values for chart scaling
  const maxAppCount = Math.max(...Object.values(analytics.spacesByApp), 1);
  const maxMonthCount = Math.max(...analytics.monthsData.map((m) => m.count), 1);

  // Calculate pie chart segments
  const typeEntries = Object.entries(analytics.spacesByType);
  const total = typeEntries.reduce((sum, [, count]) => sum + count, 0);
  let cumulativePercent = 0;
  const pieSegments = typeEntries.map(([type, count]) => {
    const percent = total > 0 ? (count / total) * 100 : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { type, count, percent, startPercent };
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spaces"
          value={analytics.totalSpaces}
          icon={<Layers className="h-5 w-5" />}
          color="#6366f1"
        />
        <StatCard
          title="Active (30d)"
          value={analytics.activeSpaces}
          icon={<Activity className="h-5 w-5" />}
          color="#10b981"
          subtitle={`${((analytics.activeSpaces / Math.max(analytics.totalSpaces, 1)) * 100).toFixed(0)}% of total`}
        />
        <StatCard
          title="Total Members"
          value={analytics.totalMembers}
          icon={<Users className="h-5 w-5" />}
          color="#3b82f6"
        />
        <StatCard
          title="Avg Members/Space"
          value={analytics.avgMembersPerSpace}
          icon={<TrendingUp className="h-5 w-5" />}
          color="#f97316"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spaces by Type - Donut Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-6">Spaces by Type</h3>
          <div className="flex items-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {pieSegments.map((segment) => {
                  const radius = 35;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDasharray = `${(segment.percent / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -(segment.startPercent / 100) * circumference;

                  return (
                    <circle
                      key={segment.type}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={SPACE_TYPE_COLORS[segment.type] || '#6366f1'}
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                      style={{ transformOrigin: 'center' }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{total}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {pieSegments.map((segment) => {
                const Icon = SPACE_TYPE_ICONS[segment.type] || User;
                return (
                  <div key={segment.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SPACE_TYPE_COLORS[segment.type] }}
                      />
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: SPACE_TYPE_COLORS[segment.type] }}
                      />
                      <span className="text-sm text-foreground/80 capitalize">{segment.type}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{segment.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Spaces Created Over Time - Line/Bar Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-6">Spaces Created (Last 6 Months)</h3>
          <div className="h-48 flex items-end gap-3">
            {analytics.monthsData.map((month) => {
              const height = maxMonthCount > 0 ? (month.count / maxMonthCount) * 100 : 0;
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs font-medium text-foreground mb-1">{month.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity by App - Horizontal Bar Chart */}
        <div className="glass-card rounded-xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-6">Spaces by App</h3>
          <div className="space-y-4">
            {appConfigs
              .filter((app) => analytics.spacesByApp[app.id] > 0)
              .sort((a, b) => (analytics.spacesByApp[b.id] || 0) - (analytics.spacesByApp[a.id] || 0))
              .map((app) => {
                const count = analytics.spacesByApp[app.id] || 0;
                const percentage = (count / maxAppCount) * 100;
                return (
                  <div key={app.id} className="flex items-center gap-4">
                    <div className="w-24 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: app.color }}
                      />
                      <span className="text-sm text-foreground/80">{app.name}</span>
                    </div>
                    <div className="flex-1 h-8 bg-surface-elevated/50 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center px-3"
                        style={{
                          width: `${Math.max(percentage, 5)}%`,
                          backgroundColor: app.color,
                        }}
                      >
                        {percentage > 20 && (
                          <span className="text-xs font-medium text-white">{count}</span>
                        )}
                      </div>
                    </div>
                    {percentage <= 20 && (
                      <span className="text-sm font-medium text-foreground w-8">{count}</span>
                    )}
                  </div>
                );
              })}
            {appConfigs.filter((app) => analytics.spacesByApp[app.id] > 0).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No space data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
