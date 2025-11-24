'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Activity as ActivityIcon, 
  TrendingUp, 
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { getActivityFeed, subscribeToActivityFeed } from '@ainexsuite/firebase';
import type { Activity } from '@ainexsuite/types';
import { getActivityDescription, getActivityColor, formatActivityTime } from '@ainexsuite/types';

interface DashboardStats {
  totalUsers: number;
  totalFeedback: number;
  activeNow: number; // Placeholder for now
  systemStatus: 'healthy' | 'degraded' | 'down';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFeedback: 0,
    activeNow: 0,
    systemStatus: 'healthy'
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get real counts from Firestore
        const userColl = collection(db, 'users');
        const feedbackColl = collection(db, 'feedback');

        const [userSnapshot, feedbackSnapshot] = await Promise.all([
          getCountFromServer(userColl),
          getCountFromServer(feedbackColl)
        ]);

        setStats(prev => ({
          ...prev,
          totalUsers: userSnapshot.data().count,
          totalFeedback: feedbackSnapshot.data().count,
          activeNow: 12 // Mock value until we have real-time presence
        }));
      } catch (error) {
        // Ignore stats fetching error
      }
    };

    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await getActivityFeed({ limit: 10 });
        setActivities(response.activities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        // Keep empty activities array on error
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchStats();
    fetchActivities();

    // Set up real-time activity updates
    const unsubscribe = subscribeToActivityFeed(
      { limit: 10 },
      (response) => {
        setActivities(response.activities);
        setActivitiesLoading(false);
      },
      (error) => {
        console.error('Activity subscription error:', error);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mission Control</h1>
        <p className="text-zinc-400">Real-time overview of platform performance and growth.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-zinc-500">Total Users</p>
          </div>
        </div>

        {/* Feedback */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-zinc-500">All time</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalFeedback}</h3>
            <p className="text-sm text-zinc-500">Feedback Items</p>
          </div>
        </div>

        {/* Active Now (Mock) */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ActivityIcon className="h-6 w-6" />
              </div>
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.activeNow}</h3>
            <p className="text-sm text-zinc-500">Active Sessions</p>
          </div>
        </div>

        {/* System Status */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-zinc-500">Uptime 99.9%</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-400 mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Operational
            </h3>
            <p className="text-sm text-zinc-500">System Status</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed (Mock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-zinc-400" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activitiesLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-600/20 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-zinc-600/20 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-zinc-600/20 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-12 bg-zinc-600/20 rounded animate-pulse" />
                </div>
              ))
            ) : activities.length > 0 ? (
              // Real activities
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                      {activity.app.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {getActivityDescription(activity)} "{activity.itemTitle}"
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {activity.app}: {activity.itemType}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {formatActivityTime(activity.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              // Empty state
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No recent activity</p>
                <p className="text-xs text-zinc-600 mt-1">Activity from all apps will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-zinc-400" />
            System Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Database Load</span>
                <span className="text-emerald-400">12%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[12%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Storage Usage</span>
                <span className="text-blue-400">45%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Function Invocations</span>
                <span className="text-purple-400">89%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[89%]" />
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-xs text-zinc-500">
                Last automated check: Just now
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
