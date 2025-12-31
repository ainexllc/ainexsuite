"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@ainexsuite/auth";
import { clsx } from "clsx";
import { Clock, Calendar, CheckSquare } from "lucide-react";
import { SmartDashboardService, ScheduleItem } from "@/lib/smart-dashboard";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";

interface TodaysScheduleProps {
  maxItems?: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TodaysSchedule({ maxItems = 5 }: TodaysScheduleProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const currentAppSlug = getCurrentAppSlug();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const service = new SmartDashboardService(user.uid);

    const unsubscribe = service.subscribeTodaysSchedule((data) => {
      setItems(data.slice(0, maxItems));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, maxItems]);

  const handleItemClick = (item: ScheduleItem) => {
    if (item.actionUrl) {
      navigateToApp(item.appSlug, currentAppSlug || "main");
    }
  };

  // Get today's date formatted
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Today&apos;s Schedule</h2>
          <span className="text-sm text-ink-500">{dateString}</span>
        </div>
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
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Today&apos;s Schedule</h2>
          <span className="text-sm text-ink-500">{dateString}</span>
        </div>
        <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Calendar className="h-8 w-8 text-ink-400" />
            <p className="text-sm text-ink-500">No events or tasks scheduled for today</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-900">Today&apos;s Schedule</h2>
        <span className="text-sm text-ink-500">{dateString}</span>
      </div>

      <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 overflow-hidden">
        <div className="divide-y divide-outline-subtle/30">
          {items.map((item) => {
            const Icon = item.type === "task" ? CheckSquare : Clock;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={clsx(
                  "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors",
                  "hover:bg-surface-muted/50"
                )}
              >
                {/* Time column */}
                <div className="w-16 shrink-0 text-right">
                  <span className="text-sm font-medium text-ink-600">
                    {formatTime(item.startTime)}
                  </span>
                </div>

                {/* Color indicator */}
                <div
                  className="h-10 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: item.color }}
                    />
                    <span className="truncate font-medium text-ink-900">
                      {item.title}
                    </span>
                  </div>
                  {item.endTime && (
                    <span className="text-xs text-ink-500">
                      Until {formatTime(item.endTime)}
                    </span>
                  )}
                </div>

                {/* Type badge */}
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  {item.type === "task" ? "Task" : "Event"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
