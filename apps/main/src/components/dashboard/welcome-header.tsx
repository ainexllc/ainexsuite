"use client";

import { useMemo } from "react";
import { Calendar, CheckSquare, Flame, Bell, CheckCircle2, AlertTriangle } from "lucide-react";

interface WelcomeHeaderProps {
  userName?: string | null;
  tasksDueToday?: number;
  tasksCompletedToday?: number;
  currentStreak?: number;
  habitsAtRisk?: number;
  unreadNotifications?: number;
}

export function WelcomeHeader({
  userName,
  tasksDueToday = 0,
  tasksCompletedToday = 0,
  currentStreak = 0,
  habitsAtRisk = 0,
  unreadNotifications = 0,
}: WelcomeHeaderProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = userName?.split(" ")[0] || "there";

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-ink-500">
          <Calendar className="h-4 w-4" />
          {today}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-3">
        {/* Tasks: show completed/due if there are tasks, otherwise just due */}
        {tasksDueToday > 0 || tasksCompletedToday > 0 ? (
          <QuickStat
            icon={tasksCompletedToday >= tasksDueToday && tasksDueToday > 0
              ? <CheckCircle2 className="h-4 w-4" />
              : <CheckSquare className="h-4 w-4" />}
            label="tasks"
            value={`${tasksCompletedToday}/${tasksDueToday + tasksCompletedToday}`}
            color={tasksCompletedToday >= tasksDueToday && tasksDueToday > 0 ? "#22c55e" : "#8b5cf6"}
          />
        ) : (
          <QuickStat
            icon={<CheckSquare className="h-4 w-4" />}
            label="tasks due"
            value={0}
            color="#8b5cf6"
          />
        )}

        {/* Streak with color coding */}
        <QuickStat
          icon={<Flame className="h-4 w-4" />}
          label="day streak"
          value={currentStreak}
          color={habitsAtRisk > 0 ? "#f59e0b" : currentStreak > 0 ? "#22c55e" : "#f97316"}
        />

        {/* Habits at risk warning */}
        {habitsAtRisk > 0 && (
          <QuickStat
            icon={<AlertTriangle className="h-4 w-4" />}
            label="habits at risk"
            value={habitsAtRisk}
            color="#ef4444"
          />
        )}

        {unreadNotifications > 0 && (
          <QuickStat
            icon={<Bell className="h-4 w-4" />}
            label="notifications"
            value={unreadNotifications}
            color="#ef4444"
          />
        )}
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {icon}
      <span className="text-ink-700">{value}</span>
      <span className="text-ink-500">{label}</span>
    </div>
  );
}
