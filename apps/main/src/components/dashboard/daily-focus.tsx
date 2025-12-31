"use client";

import { useMemo } from "react";
import { Check, ChevronRight, Target, Plus } from "lucide-react";
import { clsx } from "clsx";
import type { InsightCardData } from "@/lib/smart-dashboard";

// App colors for styling
const appColors: Record<string, string> = {
  todo: "#8b5cf6",
  notes: "#eab308",
  journal: "#f97316",
  fit: "#3b82f6",
  habits: "#14b8a6",
  health: "#10b981",
  album: "#ec4899",
  display: "#ef4444",
  projects: "#6366f1",
  grow: "#14b8a6",
  pulse: "#ef4444",
  moments: "#ec4899",
};

interface DailyFocusProps {
  insights: InsightCardData[];
  onComplete?: (id: string) => void;
  onItemClick?: (insight: InsightCardData) => void;
  onAddFocus?: () => void;
  maxItems?: number;
}

export function DailyFocus({
  insights,
  onComplete,
  onItemClick,
  onAddFocus,
  maxItems = 3,
}: DailyFocusProps) {
  // Get top priority items (actionable items first, then by priority)
  const focusItems = useMemo(() => {
    return insights
      .filter((i) => i.type === "actionable" || i.priority === "high")
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Then by timestamp (newer first)
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, maxItems);
  }, [insights, maxItems]);

  const completedCount = 0; // Would come from actual completion tracking
  const totalCount = focusItems.length;

  if (focusItems.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-subtle/40 bg-surface-elevated/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <Target className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-900">No focus items</h3>
            <p className="text-sm text-ink-500">
              Your priority items will appear here
            </p>
          </div>
        </div>
        {onAddFocus && (
          <button
            onClick={onAddFocus}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-subtle py-3 text-sm font-medium text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-700"
          >
            <Plus className="h-4 w-4" />
            Add focus item
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-ink-500" />
          <h2 className="font-semibold text-ink-900">Today&apos;s Focus</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <span>
            {completedCount}/{totalCount}
          </span>
          {/* Progress ring */}
          <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeDasharray={`${(completedCount / totalCount) * 50.27} 50.27`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Focus items */}
      <div className="space-y-2">
        {focusItems.map((item) => {
          const color = appColors[item.appSlug] || "#6b7280";
          return (
            <div
              key={item.id}
              className={clsx(
                "group flex items-center gap-3 rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-4 transition-all",
                onItemClick && "cursor-pointer hover:border-outline-subtle hover:bg-surface-elevated"
              )}
              onClick={() => onItemClick?.(item)}
            >
              {/* Complete button */}
              {item.actions?.some((a) => a.type === "complete") && onComplete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(item.id);
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-ink-400 transition-colors hover:border-green-500 hover:bg-green-500 hover:text-white"
                  style={{ borderColor: color }}
                >
                  <Check className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                </button>
              )}

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {item.priority === "high" && (
                    <span className="shrink-0 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-500">
                      Urgent
                    </span>
                  )}
                  <span className="truncate font-medium text-ink-900">
                    {item.title}
                  </span>
                </div>
                {item.subtitle && (
                  <p className="mt-0.5 truncate text-sm text-ink-500">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* App indicator */}
              <div
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                style={{
                  backgroundColor: `${color}15`,
                  color: color,
                }}
              >
                {item.appSlug}
              </div>

              {/* Arrow */}
              {onItemClick && (
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-400 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </div>
          );
        })}
      </div>

      {/* Add focus button */}
      {onAddFocus && focusItems.length < maxItems && (
        <button
          onClick={onAddFocus}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-subtle py-2.5 text-sm font-medium text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-700"
        >
          <Plus className="h-4 w-4" />
          Add focus item
        </button>
      )}
    </div>
  );
}
