'use client';

// Admin workspace dashboard - uses shared AppNavigationSidebar via WorkspaceLayout
import { useEffect, useState } from 'react';
import {
  Users,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Clock,
  LayoutGrid,
  FolderKanban,
  Palette,
  RefreshCw,
  Settings,
  ChevronRight,
  Image
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _StatCard({
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
        <div className="p-2.5 rounded-lg bg-foreground/5 border border-border text-muted-foreground group-hover:text-foreground group-hover:bg-foreground/10 transition-colors">
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
        <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
      </div>

      {trendLabel && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">{trendLabel}</p>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _Gauge({ value, label, icon: Icon, colorClass }: { value: number; label: string; icon: React.ElementType; colorClass: string }) {
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
            className="text-muted"
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

        <div className="absolute inset-0 flex items-center justify-center text-foreground">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-foreground leading-none">{value}%</div>
        <div className="text-xs text-muted-foreground font-medium mt-1">{label}</div>
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
  { href: '/workspace/backgrounds', label: 'Backgrounds', icon: Image, description: 'Manage background images', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { href: '/workspace/theme', label: 'Theme', icon: Palette, description: 'Theme & appearance', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { href: '/workspace/updates', label: 'Updates', icon: RefreshCw, description: 'Platform updates & changelog', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { href: '/workspace/settings', label: 'Settings', icon: Settings, description: 'System configuration', color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border/50' },
];

function AdminNavCard({ href, label, icon: Icon, description, color, bg, border }: typeof adminPages[0]) {
  return (
    <Link
      href={href}
      className={`group bg-surface-elevated/80 p-4 rounded-xl border ${border} hover:bg-surface-elevated hover:border-border transition-all hover:scale-[1.02] active:scale-[0.98]`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground/90 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _CommitRow({ commit, onClick, expanded }: { commit: CommitActivity; onClick: () => void; expanded: boolean }) {
  const lower = commit.message.toLowerCase();
  let type = 'chore';
  let color = 'bg-muted/10 text-muted-foreground border-border/50';

  if (lower.startsWith('feat')) { type = 'feat'; color = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; }
  else if (lower.startsWith('fix')) { type = 'fix'; color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; }
  else if (lower.startsWith('refactor')) { type = 'refactor'; color = 'bg-purple-500/10 text-purple-400 border-purple-500/20'; }

  return (
    <div
      onClick={onClick}
      className={`group p-3 rounded-lg border border-transparent hover:bg-foreground/5 hover:border-border transition-all cursor-pointer ${expanded ? 'bg-foreground/5 border-border' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${color}`}>
          {type}
        </div>
        <p className="text-sm text-foreground/90 font-medium truncate flex-1 group-hover:text-foreground transition-colors">
          {commit.message}
        </p>
        <span className="text-xs font-mono text-muted-foreground group-hover:text-muted-foreground">
          {commit.sha.substring(0, 7)}
        </span>
      </div>

      {expanded && commit.body && (
        <div className="mt-3 pl-2 border-l-2 border-border ml-1">
          <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
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
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{new Date(commit.timestamp).toLocaleString()}</span>
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [commitsLoading, setCommitsLoading] = useState(true);
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Platform metrics and system health</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-muted-foreground">
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

      {/* Admin Pages Navigation */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Admin Pages</h2>
          <span className="text-xs text-muted-foreground bg-surface-elevated/50 px-2 py-0.5 rounded-full">{adminPages.length} sections</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {adminPages.map((page) => (
            <AdminNavCard key={page.href} {...page} />
          ))}
        </div>
      </section>
    </div>
  );
}
