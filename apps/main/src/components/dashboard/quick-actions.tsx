"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";
import {
  NotesStickyIcon,
  JourneyJournalIcon,
  TodoTargetIcon,
  FitDumbbellIcon,
} from "@ainexsuite/ui/components";

const quickActions = [
  {
    id: "new-task",
    label: "New Task",
    appSlug: "todo",
    icon: TodoTargetIcon,
    color: "#8b5cf6",
  },
  {
    id: "journal-entry",
    label: "Journal Entry",
    appSlug: "journal",
    icon: JourneyJournalIcon,
    color: "#f97316",
  },
  {
    id: "log-workout",
    label: "Log Workout",
    appSlug: "fit",
    icon: FitDumbbellIcon,
    color: "#3b82f6",
  },
  {
    id: "new-note",
    label: "New Note",
    appSlug: "notes",
    icon: NotesStickyIcon,
    color: "#eab308",
  },
];

export function QuickActions() {
  const currentAppSlug = getCurrentAppSlug();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleActionClick = (appSlug: string) => {
    navigateToApp(appSlug, currentAppSlug || "main", { action: 'create' });
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-ink-900">Quick Actions</h2>

      <div className="flex flex-wrap gap-3">
        {quickActions.map(({ id, label, appSlug, icon: Icon, color }) => {
          const isHovered = hoveredAction === id;

          return (
            <button
              key={id}
              onClick={() => handleActionClick(appSlug)}
              onMouseEnter={() => setHoveredAction(id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={clsx(
                "group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                "bg-surface-elevated/50 border-outline-subtle/40",
                "hover:border-transparent hover:shadow-lg hover:-translate-y-0.5"
              )}
              style={{
                backgroundImage: isHovered
                  ? `linear-gradient(135deg, ${color}15, ${color}08)`
                  : undefined,
                borderColor: isHovered ? `${color}40` : undefined,
              }}
            >
              {/* Icon container with gradient */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `${color}15`,
                  backgroundImage: isHovered
                    ? `linear-gradient(135deg, ${color}25, ${color}15)`
                    : undefined,
                }}
              >
                <Icon size={24} color={color} isAnimating={isHovered} />
              </div>

              {/* Label */}
              <span
                className="font-medium text-ink-700 transition-colors group-hover:text-ink-900"
                style={{ color: isHovered ? color : undefined }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
