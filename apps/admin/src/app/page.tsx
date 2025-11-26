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
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-bebas tracking-widest leading-none">MISSION CONTROL</h1>
          <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] mt-1">System Status: Online</p>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[10px] font-bold animate-pulse">LIVE</span>
          <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded text-[10px] font-bold">V2.0.4</span>
        </div>
      </div>

      {/* AI Insights - Holographic HUD */}
      <div className="relative group overflow-hidden rounded-xl border border-cyan-500/30 bg-black/60 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* HUD Lines */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-3">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-spin-slow" />
            <h2 className="text-sm font-bold text-cyan-100 uppercase tracking-widest">Platform Intelligence</h2>
            <span className="ml-auto text-[10px] text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              AI_ACTIVE
            </span>
            <button
              onClick={fetchDashboardInsights}
              disabled={insightsLoading}
              className="text-[10px] text-cyan-400 hover:text-white transition-colors disabled:opacity-50 border border-cyan-500/30 px-2 py-0.5 rounded hover:bg-cyan-500/20"
            >
              {insightsLoading ? 'PROCESSING...' : 'REFRESH'}
            </button>
          </div>

          {insightsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="ml-2 text-xs text-cyan-500/70 font-mono animate-pulse">Analyzing data stream...</span>
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="bg-cyan-900/10 rounded border border-cyan-500/20 p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(6,182,212,0.1),transparent)] -skew-x-12 animate-shimmer" />
                <p className="text-xs text-cyan-100 leading-relaxed relative z-10 font-mono">
                  <span className="text-cyan-500 mr-2">{`>`}</span>
                  {insights.summary}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/40 rounded border border-white/10 p-3">
                  <div className="flex items-center gap-2 mb-2 text-yellow-400">
                    <Star className="h-3 w-3" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider">Key Signals</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {insights.highlights.map((highlight, i) => (
                      <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-2 font-mono">
                        <span className="text-yellow-500/50 mt-0.5">★</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/40 rounded border border-white/10 p-3">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <Target className="h-3 w-3" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider">Tactical Ops</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-2 font-mono">
                        <span className="text-emerald-500/50 mt-0.5">→</span>
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

      {/* KPI Grid - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="group relative overflow-hidden rounded-xl bg-zinc-900/80 border border-white/10 p-4 hover:border-indigo-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">+12%</span>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter font-bebas">{stats.totalUsers}</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Total Users</p>
        </div>

        {/* Feedback */}
        <div className="group relative overflow-hidden rounded-xl bg-zinc-900/80 border border-white/10 p-4 hover:border-purple-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">All Time</span>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter font-bebas">{stats.totalFeedback}</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Feedback</p>
        </div>

        {/* Active Now */}
        <div className="group relative overflow-hidden rounded-xl bg-zinc-900/80 border border-white/10 p-4 hover:border-emerald-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <ActivityIcon className="h-5 w-5 text-emerald-400" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </span>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter font-bebas">{stats.activeNow}</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Active Sessions</p>
        </div>

        {/* System Status */}
        <div className="group relative overflow-hidden rounded-xl bg-zinc-900/80 border border-white/10 p-4 hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 font-mono">99.9%</span>
          </div>
          <h3 className="text-xl font-black text-emerald-400 tracking-tight flex items-center gap-2 mt-1">
            <CheckCircle2 className="h-4 w-4" /> ONLINE
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">System Status</p>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Commits Feed - Dense */}
        <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <GitCommit className="h-4 w-4 text-zinc-500" />
              Git Data Stream
            </h2>
            {commits.length > 0 && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                BUFFER: {commits.length}
              </span>
            )}
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {commitsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
              ))
            ) : commits.length > 0 ? (
              commits.slice(0, 10).map((commit) => {
                const isExpanded = expandedCommits.has(commit.id);
                return (
                  <div
                    key={commit.id}
                    className="group flex flex-col bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/10 rounded transition-all cursor-pointer"
                    onClick={() => toggleCommitExpansion(commit.id)}
                  >
                    <div className="flex items-center gap-3 p-2">
                      <div className="font-mono text-[10px] text-zinc-600 w-16 truncate shrink-0">{commit.sha.substring(0, 7)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-zinc-300 truncate font-medium group-hover:text-cyan-300 transition-colors">
                          {commit.message}
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-500 shrink-0">{formatActivityTime(commit.timestamp)}</div>
                      <ExternalLink className="h-3 w-3 text-zinc-700 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                    {isExpanded && commit.body && (
                      <div className="px-2 pb-2 pl-20">
                        <pre className="text-[10px] text-zinc-400 bg-black/50 p-2 rounded border border-white/5 whitespace-pre-wrap">
                          {commit.body}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-zinc-600 text-xs">NO_DATA_PACKETS</div>
            )}
          </div>
        </div>

        {/* System Diagnostics - HUD Style */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-white/5 pb-2">
            <ActivityIcon className="h-4 w-4 text-emerald-500" />
            Diagnostics
          </h2>
          <div className="space-y-4 flex-1">
            {[
              { label: 'DB Load', value: 12, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Storage', value: 45, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Compute', value: 89, color: 'bg-purple-500', text: 'text-purple-400' }
            ].map((metric) => (
              <div key={metric.label} className="group">
                <div className="flex justify-between text-[10px] mb-1 font-mono uppercase tracking-wider">
                  <span className="text-zinc-500 group-hover:text-white transition-colors">{metric.label}</span>
                  <span className={`font-bold ${metric.text}`}>{metric.value}%</span>
                </div>
                <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className={`h-full ${metric.color} shadow-[0_0_10px_currentColor] transition-all duration-1000`} 
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="p-3 rounded bg-black/80 border border-white/5 text-[10px] font-mono text-zinc-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-400">ROOT_ACCESS</span>
                  <span className="text-emerald-500 font-bold animate-pulse">GRANTED</span>
                </div>
                <div className="opacity-60">
                  {`> sys_integrity_check`}<br/>
                  {`> status: nominal`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}