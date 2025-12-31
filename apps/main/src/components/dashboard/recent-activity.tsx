"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@ainexsuite/auth";
import { clsx } from "clsx";
import { Activity } from "lucide-react";
import { SmartDashboardService, ActivityItem } from "@/lib/smart-dashboard";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";
import {
  NotesStickyIcon,
  JourneyJournalIcon,
  TodoTargetIcon,
  FitDumbbellIcon,
} from "@ainexsuite/ui/components";

interface RecentActivityProps {
  maxItems?: number;
}

const APP_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; isAnimating?: boolean }>> = {
  notes: NotesStickyIcon,
  journal: JourneyJournalIcon,
  todo: TodoTargetIcon,
  fit: FitDumbbellIcon,
};

const APP_COLORS: Record<string, string> = {
  notes: "#eab308",
  journal: "#f97316",
  todo: "#8b5cf6",
  fit: "#3b82f6",
};

const ACTION_VERBS: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  completed: "Completed",
  logged: "Logged",
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecentActivity({ maxItems = 8 }: RecentActivityProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const currentAppSlug = getCurrentAppSlug();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const service = new SmartDashboardService(user.uid);

    const unsubscribe = service.subscribeToRecentActivity((data) => {
      setItems(data.slice(0, maxItems));
      setLoading(false);
    }, maxItems);

    return () => unsubscribe();
  }, [user?.uid, maxItems]);

  const handleItemClick = (item: ActivityItem) => {
    if (item.actionUrl) {
      navigateToApp(item.appSlug, currentAppSlug || "main");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="font-semibold text-ink-900">Recent Activity</h2>
        <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-4">
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-300 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="font-semibold text-ink-900">Recent Activity</h2>
        <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Activity className="h-8 w-8 text-ink-400" />
            <p className="text-sm text-ink-500">No recent activity yet</p>
            <p className="text-xs text-ink-400">
              Your activity across apps will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-ink-900">Recent Activity</h2>

      <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 overflow-hidden">
        <div className="divide-y divide-outline-subtle/30">
          {items.map((item) => {
            const Icon = APP_ICONS[item.appSlug];
            const color = APP_COLORS[item.appSlug] || "#6b7280";
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={clsx(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-surface-muted/50"
                )}
              >
                {/* App icon */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}15` }}
                >
                  {Icon ? (
                    <Icon size={20} color={color} isAnimating={isHovered} />
                  ) : (
                    <Activity className="h-5 w-5" style={{ color }} />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium" style={{ color }}>
                      {ACTION_VERBS[item.action] || item.action}
                    </span>
                    <span className="text-sm text-ink-600">{item.itemType}</span>
                  </div>
                  <p className="truncate text-sm text-ink-900">{item.itemName}</p>
                </div>

                {/* Time ago */}
                <span className="shrink-0 text-xs text-ink-500">
                  {formatTimeAgo(item.timestamp)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
