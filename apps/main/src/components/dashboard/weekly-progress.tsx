"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@ainexsuite/auth";
import { SmartDashboardService, WeeklyProgress as WeeklyProgressData } from "@/lib/smart-dashboard";
import { CheckSquare, Dumbbell, BookOpen, Target } from "lucide-react";

interface ProgressItemProps {
  label: string;
  current: number;
  target: number;
  color: string;
  icon: React.ReactNode;
}

function ProgressItem({ label, current, target, color, icon }: ProgressItemProps) {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Progress Ring */}
      <div className="relative">
        <svg width="64" height="64" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-outline-subtle/30"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 4px ${color}60)`,
            }}
          />
        </svg>
        {/* Icon in center */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color }}
        >
          {icon}
        </div>
      </div>

      {/* Label and count */}
      <div className="text-center">
        <div className="text-sm font-medium text-ink-900">
          {current}/{target}
        </div>
        <div className="text-xs text-ink-500">{label}</div>
      </div>
    </div>
  );
}

export function WeeklyProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<WeeklyProgressData>({
    tasksCompleted: 0,
    tasksTarget: 10,
    workoutsLogged: 0,
    workoutsTarget: 3,
    journalEntries: 0,
    journalTarget: 5,
    habitsCompleted: 0,
    habitsTarget: 21,
    overallPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const service = new SmartDashboardService(user.uid);

    const unsubscribe = service.subscribeToWeeklyProgress((data) => {
      setProgress(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="font-semibold text-ink-900">Weekly Progress</h2>
        <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-4">
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-300 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-900">Weekly Progress</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-700">
            {progress.overallPercentage}%
          </span>
          <div className="h-2 w-24 rounded-full bg-outline-subtle/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress.overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-outline-subtle/40 bg-surface-elevated/50 p-6">
        <div className="grid grid-cols-4 gap-4">
          <ProgressItem
            label="Tasks"
            current={progress.tasksCompleted}
            target={progress.tasksTarget}
            color="#8b5cf6"
            icon={<CheckSquare className="h-5 w-5" />}
          />
          <ProgressItem
            label="Workouts"
            current={progress.workoutsLogged}
            target={progress.workoutsTarget}
            color="#3b82f6"
            icon={<Dumbbell className="h-5 w-5" />}
          />
          <ProgressItem
            label="Journal"
            current={progress.journalEntries}
            target={progress.journalTarget}
            color="#f97316"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <ProgressItem
            label="Habits"
            current={progress.habitsCompleted}
            target={progress.habitsTarget}
            color="#14b8a6"
            icon={<Target className="h-5 w-5" />}
          />
        </div>
      </div>
    </div>
  );
}
