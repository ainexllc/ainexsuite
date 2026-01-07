"use client";

import { useCallback, useState } from "react";
import { clsx } from "clsx";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";
import {
  NotesStickyIcon,
  JourneyJournalIcon,
  TodoTargetIcon,
  FitDumbbellIcon,
  GrowHabitIcon,
  HealthHeartIcon,
  MomentsCameraIcon,
  PulseMonitorIcon,
  ProjectsKanbanIcon,
  WorkflowProcessIcon,
  CalendarWeekIcon,
} from "@ainexsuite/ui/components";

const apps = [
  { slug: "notes", icon: NotesStickyIcon, label: "Notes", color: "#eab308" },
  { slug: "journal", icon: JourneyJournalIcon, label: "Journal", color: "#f97316" },
  { slug: "todo", icon: TodoTargetIcon, label: "Tasks", color: "#8b5cf6" },
  { slug: "fit", icon: FitDumbbellIcon, label: "Fit", color: "#3b82f6" },
  { slug: "habits", icon: GrowHabitIcon, label: "Habits", color: "#14b8a6" },
  { slug: "health", icon: HealthHeartIcon, label: "Health", color: "#10b981" },
  { slug: "album", icon: MomentsCameraIcon, label: "Album", color: "#ec4899" },
  { slug: "hub", icon: PulseMonitorIcon, label: "Hub", color: "#ef4444" },
  { slug: "projects", icon: ProjectsKanbanIcon, label: "Projects", color: "#6366f1" },
  { slug: "workflow", icon: WorkflowProcessIcon, label: "Workflow", color: "#06b6d4" },
  { slug: "calendar", icon: CalendarWeekIcon, label: "Calendar", color: "#06b6d4" },
];

interface AppStats {
  [appSlug: string]: {
    count?: number;
    streak?: number;
    badge?: string;
  };
}

interface AppsQuickAccessProps {
  stats?: AppStats;
}

export function AppsQuickAccess({ stats = {} }: AppsQuickAccessProps) {
  const currentAppSlug = getCurrentAppSlug();
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const handleAppClick = useCallback(
    (slug: string) => {
      navigateToApp(slug, currentAppSlug || "main");
    },
    [currentAppSlug]
  );

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-ink-900">Your Apps</h2>

      {/* Horizontal scrollable container */}
      <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {apps.map(({ slug, icon: Icon, label, color }) => {
            const appStats = stats[slug];
            const hasActivity = appStats?.count !== undefined && appStats.count > 0;
            const hasStreak = appStats?.streak !== undefined && appStats.streak > 0;
            const isHovered = hoveredApp === slug;

            return (
              <button
                key={slug}
                onClick={() => handleAppClick(slug)}
                onMouseEnter={() => setHoveredApp(slug)}
                onMouseLeave={() => setHoveredApp(null)}
                className={clsx(
                  "group flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-outline-subtle/40 bg-surface-elevated/50 p-4 transition-all",
                  "hover:border-outline-subtle hover:bg-surface-elevated hover:shadow-lg hover:-translate-y-0.5",
                  "min-w-[100px] sm:min-w-[110px]"
                )}
              >
                {/* Icon with color - now animated */}
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${color}15`,
                    backgroundImage: isHovered ? `linear-gradient(135deg, ${color}20, ${color}10)` : undefined,
                  }}
                >
                  <Icon size={28} color={color} isAnimating={isHovered} />

                  {/* Badge indicator */}
                  {(hasActivity || hasStreak || appStats?.badge) && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {appStats?.badge ||
                        (hasStreak ? `${appStats.streak}🔥` : appStats?.count)}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="text-sm font-medium text-ink-700 group-hover:text-ink-900">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fade edges for scroll indication */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent sm:left-2 lg:left-4" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-background to-transparent sm:right-2 lg:right-4" />
      </div>
    </div>
  );
}
