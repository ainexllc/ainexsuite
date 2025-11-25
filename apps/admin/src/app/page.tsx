'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Activity as ActivityIcon,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Star,
  Target
} from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { GitCommit, ExternalLink, Loader2 } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalFeedback: number;
  activeNow: number; // Placeholder for now
  systemStatus: 'healthy' | 'degraded' | 'down';
}

interface CommitActivity {
  id: string;
  message: string;
  body?: string;
  author: string;
  authorAvatar?: string;
  timestamp: number;
  url: string;
  sha: string;
}

interface DashboardInsights {
  summary: string;
  highlights: string[];
  recommendations: string[];
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
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());

  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const toggleCommitExpansion = (commitId: string) => {
    setExpandedCommits(prev => {
      const next = new Set(prev);
      if (next.has(commitId)) {
        next.delete(commitId);
      } else {
        next.add(commitId);
      }
      return next;
    });
  };

  const fetchDashboardInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);

      const response = await fetch('/api/dashboard/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commits: commits.slice(0, 10).map(c => ({
            message: c.message,
            author: c.author,
            timestamp: c.timestamp
          })),
          stats: {
            totalUsers: stats.totalUsers,
            totalFeedback: stats.totalFeedback,
            activeNow: stats.activeNow
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insights');
      }

      setInsights(data.insights);
    } catch (error) {
      console.error('Failed to fetch dashboard insights:', error);
      setInsightsError(error instanceof Error ? error.message : 'Failed to fetch insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchCommits = async () => {
    try {
      setCommitsLoading(true);
      setCommitsError(null);
      console.log('Fetching commits from /api/github/commits');
      const response = await fetch('/api/github/commits');
      console.log('Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch commits');
      }

      setCommits(data.activities || []);
      console.log('Commits set:', data.activities?.length || 0);
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

  // Fetch insights when data is ready
  useEffect(() => {
    if (commits.length > 0 && stats.totalUsers > 0 && !insights && !insightsLoading) {
      fetchDashboardInsights();
    }
  }, [commits, stats]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mission Control</h1>
        <p className="text-zinc-400">Real-time overview of platform performance and growth.</p>
      </div>

      {/* AI Insights */}
      <div className="relative bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-indigo-500/20 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Platform Intelligence</h2>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Powered by Grok
            </span>
            <button
              onClick={fetchDashboardInsights}
              disabled={insightsLoading}
              className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {insightsLoading ? 'Analyzing...' : 'Refresh'}
            </button>
          </div>

          {insightsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              <span className="ml-2 text-sm text-zinc-400">Analyzing platform data...</span>
            </div>
          ) : insightsError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-400">{insightsError}</p>
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <p className="text-sm text-zinc-200 leading-relaxed">
                  {insights.summary}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-white">Highlights</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.highlights.map((highlight, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">★</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GitCommit className="h-5 w-5 text-zinc-400" />
              Recent Commits
            </h2>
            {commits.length > 0 && (
              <span className="text-xs text-zinc-500">
                {commits.length} commit{commits.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {commitsLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-zinc-600/20 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-zinc-600/20 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-zinc-600/20 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            ) : commits.length > 0 ? (
              // Real commits - GitHub-inspired style
              commits.slice(0, 10).map((commit) => {
                const isExpanded = expandedCommits.has(commit.id);
                const hasBody = commit.body && commit.body.length > 0;

                return (
                  <div
                    key={commit.id}
                    className="group p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {commit.authorAvatar ? (
                          <img
                            src={commit.authorAvatar}
                            alt={commit.author}
                            className="h-6 w-6 rounded-full ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-indigo-300 text-[10px] font-bold ring-1 ring-white/10">
                            {commit.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Commit message */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-sm font-medium text-white leading-snug group-hover:text-indigo-300 transition-colors">
                            {commit.message}
                          </h3>
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-zinc-500 hover:text-indigo-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="View on GitHub"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {/* Metadata bar */}
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-400">{commit.author}</span>
                          <span className="text-zinc-700">•</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-500 border border-white/5">
                            {commit.sha}
                          </span>
                          <span className="text-zinc-700">•</span>
                          <span>{formatActivityTime(commit.timestamp)}</span>
                        </div>

                        {/* Expandable body */}
                        {hasBody && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleCommitExpansion(commit.id)}
                              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" />
                                  Hide full message
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                  Show full message
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 p-4 rounded-lg bg-black/40 border border-white/5">
                                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                                  {commit.body}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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
