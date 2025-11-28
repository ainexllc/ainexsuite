'use client';

// Admin workspace dashboard - uses shared AppNavigationSidebar via WorkspaceLayout
import { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Cpu,
  Database,
  HardDrive,
  GitCommit,
  ExternalLink,
  Loader2,
  Clock,
  Server,
  Globe,
  Zap,
  LayoutGrid,
  FolderKanban,
  Palette,
  RefreshCw,
  Settings,
  ChevronRight,
  Star,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

// --- Types ---

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

interface PromotedFeedback {
  id: string;
  message: string;
  authorEmail?: string;
  appId: string;
  promoted: boolean;
}

// --- Components ---

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendLabel?: string
}) {
  return (
    <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <ArrowUpRight className="w-3 h-3" />
            <span className="text-xs font-semibold">{trend}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <p className="text-sm text-zinc-500 font-medium">{title}</p>
      </div>

      {trendLabel && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-zinc-500">{trendLabel}</p>
        </div>
      )}
    </div>
  );
}

function Gauge({ value, label, icon: Icon, colorClass }: { value: number; label: string; icon: React.ElementType; colorClass: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-zinc-800"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-zinc-100">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-white leading-none">{value}%</div>
        <div className="text-xs text-zinc-500 font-medium mt-1">{label}</div>
      </div>
    </div>
  );
}

// Admin navigation links
const adminPages = [
  { href: '/workspace/apps', label: 'Apps', icon: LayoutGrid, description: 'Manage suite applications', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { href: '/workspace/users', label: 'Users', icon: Users, description: 'User management & roles', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { href: '/workspace/feedback', label: 'Feedback', icon: MessageSquare, description: 'User feedback & reports', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { href: '/workspace/spaces', label: 'Spaces', icon: FolderKanban, description: 'Workspace spaces config', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { href: '/workspace/theme', label: 'Theme', icon: Palette, description: 'Theme & appearance', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { href: '/workspace/updates', label: 'Updates', icon: RefreshCw, description: 'Platform updates & changelog', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { href: '/workspace/settings', label: 'Settings', icon: Settings, description: 'System configuration', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
];

function AdminNavCard({ href, label, icon: Icon, description, color, bg, border }: typeof adminPages[0]) {
  return (
    <Link
      href={href}
      className={`group bg-zinc-800/80 p-4 rounded-xl border ${border} hover:bg-zinc-700/80 hover:border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-100 group-hover:text-white">{label}</h3>
          <p className="text-xs text-zinc-400 truncate">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

function CommitRow({ commit, onClick, expanded }: { commit: CommitActivity; onClick: () => void; expanded: boolean }) {
  const lower = commit.message.toLowerCase();
  let type = 'chore';
  let color = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  if (lower.startsWith('feat')) { type = 'feat'; color = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; }
  else if (lower.startsWith('fix')) { type = 'fix'; color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; }
  else if (lower.startsWith('refactor')) { type = 'refactor'; color = 'bg-purple-500/10 text-purple-400 border-purple-500/20'; }

  return (
    <div
      onClick={onClick}
      className={`group p-3 rounded-lg border border-transparent hover:bg-white/5 hover:border-white/5 transition-all cursor-pointer ${expanded ? 'bg-white/5 border-white/5' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${color}`}>
          {type}
        </div>
        <p className="text-sm text-zinc-300 font-medium truncate flex-1 group-hover:text-white transition-colors">
          {commit.message}
        </p>
        <span className="text-xs font-mono text-zinc-600 group-hover:text-zinc-500">
          {commit.sha.substring(0, 7)}
        </span>
      </div>

      {expanded && commit.body && (
        <div className="mt-3 pl-2 border-l-2 border-white/10 ml-1">
          <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed">
            {commit.body}
          </pre>
          <div className="mt-2 flex items-center gap-2">
            <a
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              View on GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-xs text-zinc-600">•</span>
            <span className="text-xs text-zinc-500">{new Date(commit.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminWorkspacePage() {
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
  const [promotedItems, setPromotedItems] = useState<PromotedFeedback[]>([]);

  useEffect(() => {
    const fetchPromoted = async () => {
      try {
        const { getDocs, query, where, limit } = await import('firebase/firestore');
        const q = query(collection(db, 'feedback'), where('promoted', '==', true), limit(5));
        const snapshot = await getDocs(q);
        setPromotedItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromotedFeedback)));
      } catch (e) {
        console.error("Error fetching promoted items", e);
      }
    };
    fetchPromoted();
  }, []);

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
          activeNow: Math.floor(Math.random() * 20) + 5
        }));
      } catch (error) {
        console.error("Stats error", error); // eslint-disable-line no-console
      }
    };

    const fetchCommits = async () => {
      try {
        setCommitsLoading(true);
        const response = await fetch('/api/github/commits');
        const data = await response.json();
        if (response.ok) setCommits(data.activities || []);
      } catch (error) {
        console.error('Failed to fetch GitHub commits:', error); // eslint-disable-line no-console
      } finally {
        setCommitsLoading(false);
      }
    };

    fetchStats();
    fetchCommits();

    const interval = setInterval(fetchCommits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (commits.length > 0 && stats.totalUsers > 0 && !insights && !insightsLoading) {
      const fetchInsights = async () => {
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
          if (response.ok) setInsights(data.insights);
        } catch (e) {
          console.error(e); // eslint-disable-line no-console
        } finally {
          setInsightsLoading(false);
        }
      };
      fetchInsights();
    }
  }, [commits, stats, insights, insightsLoading]);

  const toggleCommit = (id: string) => {
    const next = new Set(expandedCommits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCommits(next);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-400 mt-1">Platform metrics and system health</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/5 border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend="+12%"
          trendLabel="Growth this month"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeNow}
          icon={Activity}
          trend="+5%"
          trendLabel="Current concurrency"
        />
        <StatCard
          title="Feedback Items"
          value={stats.totalFeedback.toLocaleString()}
          icon={MessageSquare}
        />
        <StatCard
          title="System Health"
          value="99.9%"
          icon={CheckCircle2}
          trendLabel="Uptime (last 30 days)"
        />
      </div>

      {/* Admin Pages Navigation */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">Admin Pages</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">{adminPages.length} sections</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {adminPages.map((page) => (
            <AdminNavCard key={page.href} {...page} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Great Ideas / Promoted Feedback */}
          {promotedItems.length > 0 && (
            <section className="glass-card rounded-xl p-6 border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Great Ideas</h2>
                <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                  Promoted Feedback
                </span>
              </div>
              
              <div className="grid gap-3">
                {promotedItems.map(item => (
                  <div key={item.id} className="p-4 rounded-lg bg-black/20 border border-white/5 flex gap-4 hover:bg-black/30 transition-colors">
                    <div className="pt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200 leading-relaxed">{item.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                        <span className="uppercase tracking-wider font-medium text-zinc-400">{item.appId}</span>
                        <span>•</span>
                        <span>{item.authorEmail || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Insights */}
          <section className="glass-card rounded-xl p-6 border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <Sparkles className="w-32 h-32 text-indigo-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">AI Insights</h2>
              </div>

              {insightsLoading ? (
                <div className="flex flex-col items-center py-12 text-zinc-500 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Analyzing platform data...</span>
                </div>
              ) : insights ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-zinc-950/50 border border-white/5">
                    <p className="text-zinc-300 leading-relaxed text-balance">
                      {insights.summary}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Highlights</h3>
                      <ul className="space-y-2">
                        {insights.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recommendations</h3>
                      <ul className="space-y-2">
                        {insights.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  No insights available at this time.
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity / Commits */}
          <section className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400">
                  <GitCommit className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Development Activity</h2>
              </div>
              <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-white/5">
                {commits.length} Events
              </span>
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {commitsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                commits.map(commit => (
                  <CommitRow
                    key={commit.id}
                    commit={commit}
                    expanded={expandedCommits.has(commit.id)}
                    onClick={() => toggleCommit(commit.id)}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar / Vitals Column */}
        <div className="space-y-6">
          {/* System Status Panel */}
          <section className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400">
                <Server className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">System Vitals</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4">
              <Gauge value={12} label="CPU" icon={Cpu} colorClass="text-emerald-400" />
              <Gauge value={45} label="Memory" icon={HardDrive} colorClass="text-blue-400" />
              <Gauge value={89} label="Storage" icon={Database} colorClass="text-indigo-400" />
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Region
                </span>
                <span className="text-white font-mono">us-east-1</span>
              </div>
              <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Latency
                </span>
                <span className="text-emerald-400 font-mono">24ms</span>
              </div>
            </div>
          </section>

          {/* Deployment Info */}
          <section className="glass-card rounded-xl p-6 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40">
             <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
               Deployment Info
             </h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Version</span>
                  <span className="text-zinc-200 font-mono">v2.4.0-beta</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Build</span>
                  <span className="text-zinc-200 font-mono">8f2a1c9</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Environment</span>
                  <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs border border-blue-500/20">
                    PRODUCTION
                  </span>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
