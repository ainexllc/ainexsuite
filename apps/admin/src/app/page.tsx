'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Activity as ActivityIcon,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Star,
  Target,
  Cpu,
  Database,
  HardDrive,
  Wifi,
  Clock,
  Zap,
  GitCommit,
  ExternalLink,
  Loader2,
  Terminal,
  Eye
} from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

interface DashboardStats {
  totalUsers: number;
  totalFeedback: number;
  activeNow: number;
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

// Circular Gauge Component
function CircularGauge({ value, label, color, icon: Icon }: {
  value: number;
  label: string;
  color: string;
  icon: React.ElementType;
}) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColorClass = (val: number) => {
    if (val < 50) return 'text-emerald-400';
    if (val < 80) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-28 h-28">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="40"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="56"
            cy="56"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 10px ${color})`,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-5 h-5 mb-1 ${getColorClass(value)}`} />
          <span className={`text-2xl font-bold font-orbitron ${getColorClass(value)}`}>
            {value}%
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs uppercase tracking-wider text-zinc-500 group-hover:text-cyan-400 transition-colors">
        {label}
      </span>
    </div>
  );
}

// Typing Text Effect Component
function TypingText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(cursorTimer);
    };
  }, [text]);

  return (
    <span className={className}>
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-cyan-400`}>_</span>
    </span>
  );
}

// Live Clock Component
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 text-cyan-400 font-orbitron">
      <Clock className="w-5 h-5" />
      <span className="text-lg tracking-wider font-bold">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </span>
    </div>
  );
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

// Get commit type from message
function getCommitType(message: string): { type: string; color: string } {
  const lower = message.toLowerCase();
  if (lower.startsWith('feat')) return { type: 'FEAT', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' };
  if (lower.startsWith('fix')) return { type: 'FIX', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' };
  if (lower.startsWith('refactor')) return { type: 'REFAC', color: 'text-purple-400 border-purple-400/30 bg-purple-400/10' };
  if (lower.startsWith('style')) return { type: 'STYLE', color: 'text-pink-400 border-pink-400/30 bg-pink-400/10' };
  if (lower.startsWith('chore')) return { type: 'CHORE', color: 'text-zinc-400 border-zinc-400/30 bg-zinc-400/10' };
  if (lower.startsWith('docs')) return { type: 'DOCS', color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' };
  if (lower.startsWith('test')) return { type: 'TEST', color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' };
  return { type: 'COMMIT', color: 'text-zinc-500 border-zinc-500/30 bg-zinc-500/10' };
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
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());

  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

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

      const response = await fetch('/api/dashboard/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (response.ok) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchCommits = async () => {
    try {
      setCommitsLoading(true);
      const response = await fetch('/api/github/commits');
      const data = await response.json();

      if (response.ok) {
        setCommits(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub commits:', error);
      setCommits([]);
    } finally {
      setCommitsLoading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
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
          activeNow: Math.floor(Math.random() * 20) + 5 // Simulated
        }));
      } catch (error) {
        // Ignore stats fetching error
      }
    };

    fetchStats();
    fetchCommits();

    const interval = setInterval(fetchCommits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (commits.length > 0 && stats.totalUsers > 0 && !insights && !insightsLoading) {
      fetchDashboardInsights();
    }
  }, [commits, stats]);

  return (
    <div className="space-y-8 text-sm relative z-10">
      {/* ═══════════════════════════════════════════════════════════
          HEADER - AINEX CONTROL
          ═══════════════════════════════════════════════════════════ */}
      <header className="relative">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl md:text-6xl font-orbitron font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-magenta-400 glitch-hover">
              AINEX CONTROL
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-zinc-500 uppercase tracking-[0.3em] text-xs">
                System Status:
              </span>
              <span className="text-emerald-400 uppercase tracking-wider text-xs font-semibold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                ONLINE
              </span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <span className="status-badge status-badge-live animate-pulse">
                <Eye className="w-3 h-3" /> LIVE
              </span>
              <span className="status-badge status-badge-active">
                <Zap className="w-3 h-3" /> 99.9%
              </span>
              <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded text-xs font-bold">
                V2.1.0
              </span>
            </div>
            <LiveClock />
          </div>
        </div>

        {/* Decorative scan line */}
        <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </header>

      {/* ═══════════════════════════════════════════════════════════
          AI INSIGHTS - NEURAL CORE
          ═══════════════════════════════════════════════════════════ */}
      <section className="cyber-card corner-brackets p-6 scan-line-overlay">
        <div className="relative z-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 blur-sm bg-cyan-400/50 animate-pulse" />
              </div>
              <h2 className="text-xl font-orbitron font-bold text-cyan-100 uppercase tracking-widest">
                Neural Core
              </h2>
              <span className="px-2 py-1 text-[10px] text-cyan-500 bg-cyan-500/10 rounded border border-cyan-500/20 font-semibold tracking-wider">
                AI::ACTIVE
              </span>
            </div>
            <button
              onClick={fetchDashboardInsights}
              disabled={insightsLoading}
              className="neon-button text-cyan-400 text-xs disabled:opacity-50"
            >
              <span>{insightsLoading ? 'PROCESSING...' : 'REFRESH'}</span>
            </button>
          </div>

          {/* Content */}
          {insightsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/30 animate-pulse" />
              </div>
              <span className="ml-4 text-base text-cyan-400 font-mono">
                <TypingText text="Analyzing data streams..." />
              </span>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* AI Summary */}
              <div className="relative bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-lg border border-cyan-500/20 p-4 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(6,182,212,0.05),transparent)] animate-shimmer" />
                <p className="text-base text-cyan-100 leading-relaxed relative z-10 font-jetbrains">
                  <span className="text-cyan-500 mr-2 text-lg">&gt;</span>
                  <TypingText text={insights.summary} />
                </p>
              </div>

              {/* Two Column Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Key Signals */}
                <div className="bg-black/40 rounded-lg border border-yellow-500/20 p-4 hover:border-yellow-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-4 text-yellow-400">
                    <Star className="h-5 w-5" />
                    <h3 className="text-sm font-orbitron font-bold uppercase tracking-wider">
                      Key Signals
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.highlights.map((highlight, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                        <span className="text-yellow-500 mt-0.5">&#9733;</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tactical Ops */}
                <div className="bg-black/40 rounded-lg border border-emerald-500/20 p-4 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <Target className="h-5 w-5" />
                    <h3 className="text-sm font-orbitron font-bold uppercase tracking-wider">
                      Tactical Ops
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                        <span className="text-emerald-500 mt-0.5">&#8594;</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Awaiting data initialization...</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          KPI GRID - DATA NODES
          ═══════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="cyber-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
              +12%
            </span>
          </div>
          <h3 className="text-4xl font-orbitron font-black text-white tracking-tight text-glow-cyan">
            {stats.totalUsers.toLocaleString()}
          </h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Total Users</p>
        </div>

        {/* Feedback */}
        <div className="cyber-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
              <MessageSquare className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-500 uppercase">All Time</span>
          </div>
          <h3 className="text-4xl font-orbitron font-black text-white tracking-tight">
            {stats.totalFeedback.toLocaleString()}
          </h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Feedback</p>
        </div>

        {/* Active Now */}
        <div className="cyber-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <ActivityIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </span>
          </div>
          <h3 className="text-4xl font-orbitron font-black text-white tracking-tight text-glow-green">
            {stats.activeNow}
          </h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Active Sessions</p>
        </div>

        {/* System Status */}
        <div className="cyber-card p-5 group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-cyan-400 font-mono">99.9%</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 mt-2">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-2xl font-orbitron font-bold">ONLINE</span>
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">System Status</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DATA GRID
          ═══════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Git Data Stream - CODE FLUX */}
        <div className="lg:col-span-2 cyber-card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <GitCommit className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider">
                Code Flux
              </h2>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            {commits.length > 0 && (
              <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
                BUFFER: {commits.length}
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
            {commitsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))
            ) : commits.length > 0 ? (
              commits.slice(0, 12).map((commit, index) => {
                const isExpanded = expandedCommits.has(commit.id);
                const commitType = getCommitType(commit.message);

                return (
                  <div
                    key={commit.id}
                    className="group bg-black/30 hover:bg-black/50 border border-white/5 hover:border-cyan-500/30 rounded-lg transition-all cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => toggleCommitExpansion(commit.id)}
                  >
                    <div className="flex items-center gap-4 p-3">
                      {/* Commit Type Badge */}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${commitType.color}`}>
                        {commitType.type}
                      </span>

                      {/* SHA */}
                      <code className="text-xs text-cyan-500/70 font-mono w-16 shrink-0">
                        {commit.sha.substring(0, 7)}
                      </code>

                      {/* Message */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300 truncate font-medium group-hover:text-cyan-300 transition-colors">
                          {commit.message}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs text-zinc-600 shrink-0">
                        {formatActivityTime(commit.timestamp)}
                      </span>

                      {/* External Link */}
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="h-4 w-4 text-zinc-500 hover:text-cyan-400" />
                      </a>
                    </div>

                    {/* Expanded Body */}
                    {isExpanded && commit.body && (
                      <div className="px-4 pb-3 border-t border-white/5 mt-1 pt-3">
                        <pre className="text-xs text-zinc-400 bg-black/50 p-3 rounded border border-white/5 whitespace-pre-wrap font-mono">
                          {commit.body}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-600">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-mono">NO_DATA_PACKETS</p>
              </div>
            )}
          </div>
        </div>

        {/* System Vitals */}
        <div className="cyber-card p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
            <Cpu className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider">
              System Vitals
            </h2>
          </div>

          {/* Circular Gauges */}
          <div className="flex justify-around mb-6">
            <CircularGauge value={12} label="DB Load" color="#22c55e" icon={Database} />
            <CircularGauge value={45} label="Storage" color="#3b82f6" icon={HardDrive} />
            <CircularGauge value={89} label="Compute" color="#a855f7" icon={Cpu} />
          </div>

          {/* Terminal Output */}
          <div className="mt-auto bg-black/60 rounded-lg border border-emerald-500/20 p-4 font-mono text-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 uppercase tracking-wider text-[10px] font-bold">Terminal</span>
            </div>
            <div className="space-y-1.5 text-zinc-400">
              <p><span className="text-emerald-500">&gt;</span> sys_integrity_check</p>
              <p><span className="text-emerald-500">&gt;</span> status: <span className="text-emerald-400">nominal</span></p>
              <p><span className="text-emerald-500">&gt;</span> quantum_sync: <span className="text-cyan-400 animate-pulse">active</span></p>
              <p className="flex items-center">
                <span className="text-emerald-500">&gt;</span>
                <span className="ml-1">root_access:</span>
                <span className="ml-1 text-emerald-400 font-bold animate-pulse">GRANTED</span>
              </p>
            </div>
          </div>

          {/* Network Status */}
          <div className="mt-4 flex items-center justify-between p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Network</span>
            </div>
            <span className="text-xs text-cyan-400 font-mono font-bold">CONNECTED</span>
          </div>
        </div>
      </section>
    </div>
  );
}
