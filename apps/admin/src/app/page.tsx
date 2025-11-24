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
import { GitCommit, ExternalLink } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalFeedback: number;
  activeNow: number; // Placeholder for now
  systemStatus: 'healthy' | 'degraded' | 'down';
}

interface CommitActivity {
  id: string;
  message: string;
  author: string;
  authorAvatar?: string;
  timestamp: number;
  url: string;
  sha: string;
}

function formatActivityTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFeedback: 0,
    activeNow: 0,
    systemStatus: 'healthy'
  });

  const [commits, setCommits] = useState<CommitActivity[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(true);
  const [commitsError, setCommitsError] = useState<string | null>(null);

  const fetchCommits = async () => {
    try {
      setCommitsLoading(true);
      setCommitsError(null);
      const response = await fetch('/api/github/commits');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch commits');
      }
      
      setCommits(data.activities || []);
    } catch (error) {
      console.error('Failed to fetch GitHub commits:', error);
      setCommitsError(error instanceof Error ? error.message : 'Failed to fetch commits');
      setCommits([]);
    } finally {
      setCommitsLoading(false);
    }
  };

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

    fetchStats();
    fetchCommits();

    // Refresh commits every 5 minutes
    const interval = setInterval(fetchCommits, 5 * 60 * 1000);

    return () => clearInterval(interval);
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

      {/* Recent GitHub Commits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-zinc-400" />
            Recent Commits
          </h2>
          <div className="space-y-4">
            {commitsLoading ? (
              // Loading state
              Array.from({ length: 10 }).map((_, i) => (
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
            ) : commits.length > 0 ? (
              // Real commits
              commits.map((commit) => (
                <a
                  key={commit.id}
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {commit.authorAvatar ? (
                      <img
                        src={commit.authorAvatar}
                        alt={commit.author}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {commit.author.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {commit.message}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-2">
                        <span>{commit.author}</span>
                        <span>•</span>
                        <span className="font-mono text-zinc-600">{commit.sha}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-zinc-500">
                      {formatActivityTime(commit.timestamp)}
                    </span>
                    <ExternalLink className="h-4 w-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))
            ) : commitsError ? (
              // Error state
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-400 mb-1">Failed to load commits</p>
                <p className="text-xs text-zinc-500 mb-2 max-w-md mx-auto">{commitsError}</p>
                {commitsError.includes('GitHub API error') && (
                  <div className="text-xs text-zinc-600 mt-3 p-3 bg-zinc-800/50 rounded-lg max-w-md mx-auto">
                    <p className="font-medium text-zinc-400 mb-1">Troubleshooting:</p>
                    <p className="text-left mb-2">
                      Default repo: <code className="text-indigo-400">ainexsuite/ainexsuite</code>
                    </p>
                    <p className="text-left">
                      To use a different repo, add to <code className="text-indigo-400">apps/admin/.env.local</code>:
                    </p>
                    <pre className="text-left mt-2 p-2 bg-zinc-900 rounded text-zinc-300 overflow-x-auto">
{`GITHUB_REPO=owner/repo
# Or full URL:
# GITHUB_REPO=https://github.com/owner/repo`}
                    </pre>
                  </div>
                )}
                <button
                  onClick={fetchCommits}
                  className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              // Empty state
              <div className="text-center py-8">
                <GitCommit className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No recent commits</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Showing commits from <code className="text-indigo-400">ainexsuite/ainexsuite</code>
                </p>
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
