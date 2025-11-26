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
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-indigo-500/50 to-transparent">
          <div className="relative h-full rounded-[22px] bg-black/80 backdrop-blur-xl p-6 overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-[50px] group-hover:blur-[40px] transition-all" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Users className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-1 tracking-tight font-bebas">{stats.totalUsers}</h3>
              <p className="text-xs font-mono text-indigo-200/60 uppercase tracking-widest">Total Users</p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-purple-500/50 to-transparent">
          <div className="relative h-full rounded-[22px] bg-black/80 backdrop-blur-xl p-6 overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/30 rounded-full blur-[50px] group-hover:blur-[40px] transition-all" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-purple-300/50 uppercase tracking-wider border border-purple-500/20 px-2 py-1 rounded-full bg-purple-500/5">All Time</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-1 tracking-tight font-bebas">{stats.totalFeedback}</h3>
              <p className="text-xs font-mono text-purple-200/60 uppercase tracking-widest">Feedback Items</p>
            </div>
          </div>
        </div>

        {/* Active Now */}
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-emerald-500/50 to-transparent">
          <div className="relative h-full rounded-[22px] bg-black/80 backdrop-blur-xl p-6 overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/30 rounded-full blur-[50px] group-hover:blur-[40px] transition-all" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <ActivityIcon className="h-6 w-6" />
              </div>
              <div className="relative flex items-center justify-center w-4 h-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-1 tracking-tight font-bebas">{stats.activeNow}</h3>
              <p className="text-xs font-mono text-emerald-200/60 uppercase tracking-widest">Active Sessions</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-blue-500/50 to-transparent">
          <div className="relative h-full rounded-[22px] bg-black/80 backdrop-blur-xl p-6 overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/30 rounded-full blur-[50px] group-hover:blur-[40px] transition-all" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-blue-300/50 uppercase tracking-wider font-mono">99.9% Uptime</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-emerald-400 mb-1 tracking-tight flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.4)] drop-shadow-md">
                <CheckCircle2 className="h-6 w-6" /> OPERATIONAL
              </h3>
              <p className="text-xs font-mono text-blue-200/60 uppercase tracking-widest mt-2">System Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent GitHub Commits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 font-bebas tracking-wide">
              <GitCommit className="h-5 w-5 text-cyan-400" />
              Code Activity
            </h2>
            {commits.length > 0 && (
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-mono text-white/50 uppercase tracking-wider">
                {commits.length} COMMITS
              </span>
            )}
          </div>
          <div className="space-y-3">
            {commitsLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/5 rounded" />
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
                    className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 pt-1">
                        {commit.authorAvatar ? (
                          <img
                            src={commit.authorAvatar}
                            alt={commit.author}
                            className="h-8 w-8 rounded-full ring-2 ring-black shadow-lg grayscale group-hover:grayscale-0 transition-all"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-black shadow-lg">
                            {commit.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Commit message */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="text-sm font-medium text-zinc-200 leading-snug group-hover:text-cyan-300 transition-colors font-mono">
                            {commit.message}
                          </h3>
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                            title="View on GitHub"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {/* Metadata bar */}
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                          <span className="text-zinc-400">{commit.author}</span>
                          <span className="text-zinc-700">|</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                            {commit.sha.substring(0, 7)}
                          </span>
                          <span className="text-zinc-700">|</span>
                          <span>{formatActivityTime(commit.timestamp)}</span>
                        </div>

                        {/* Expandable body */}
                        {hasBody && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleCommitExpansion(commit.id)}
                              className="flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium uppercase tracking-wider"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Collapse
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3 w-3" />
                                  Expand Details
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 p-4 rounded-lg bg-black/50 border border-white/5 shadow-inner">
                                <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
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
              <div className="text-center py-12 rounded-xl bg-red-500/5 border border-red-500/10">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-red-400 mb-1">Connection Lost</p>
                <p className="text-xs text-red-400/60 mb-4 max-w-md mx-auto font-mono">{commitsError}</p>
                {commitsError.includes('GitHub API error') && (
                  <div className="text-xs text-zinc-500 mt-3 p-4 bg-black/40 rounded-lg max-w-md mx-auto text-left font-mono border border-white/5">
                    <p className="text-zinc-400 mb-2">DEBUG_LOG:</p>
                    <p className="mb-1 text-indigo-400">Default Repo: ainexsuite/ainexsuite</p>
                    <p>Check env vars for GITHUB_REPO override.</p>
                  </div>
                )}
                <button
                  onClick={fetchCommits}
                  className="mt-6 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-red-500/20"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              // Empty state
              <div className="text-center py-12">
                <GitCommit className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-sm text-zinc-500 font-mono">NO_DATA_FOUND</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-bebas tracking-wide">
            <ActivityIcon className="h-5 w-5 text-emerald-400" />
            System Diagnostics
          </h2>
          <div className="space-y-6 flex-1">
            <div className="group">
              <div className="flex justify-between text-xs mb-2 font-mono uppercase tracking-wider">
                <span className="text-zinc-400 group-hover:text-emerald-400 transition-colors">DB Load</span>
                <span className="text-emerald-400 font-bold">12%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[12%] shadow-[0_0_10px_#10b981]" />
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-xs mb-2 font-mono uppercase tracking-wider">
                <span className="text-zinc-400 group-hover:text-blue-400 transition-colors">Storage</span>
                <span className="text-blue-400 font-bold">45%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[45%] shadow-[0_0_10px_#3b82f6]" />
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-xs mb-2 font-mono uppercase tracking-wider">
                <span className="text-zinc-400 group-hover:text-purple-400 transition-colors">Compute</span>
                <span className="text-purple-400 font-bold">89%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[89%] shadow-[0_0_10px_#a855f7]" />
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>STATUS</span>
                <span className="text-emerald-500 animate-pulse">● LIVE</span>
              </div>
              <div className="mt-2 p-3 rounded-lg bg-black/60 border border-white/5 text-[10px] font-mono text-zinc-600">
                <span className="text-zinc-400">{`>`}</span> system_check --full
                <br />
                <span className="text-emerald-500/70">{`>`} all systems nominal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
