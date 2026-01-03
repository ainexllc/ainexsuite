"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Calendar, Repeat, Clock, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { generateUUID, InlineSpacePicker } from "@ainexsuite/ui";
import { useGrowStore } from "@/lib/store";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useWorkspaceAuth } from "@ainexsuite/auth";
import { useHabits } from "@/components/providers/habits-provider";
import { Hint, HINTS } from "@/components/hints";
import type { Habit, FrequencyType } from "@/types/models";

const SCHEDULE_OPTIONS: { type: FrequencyType; label: string; icon: typeof Calendar }[] = [
  { type: "daily", label: "Daily", icon: Calendar },
  { type: "weekly", label: "Weekly", icon: Repeat },
  { type: "specific_days", label: "Specific Days", icon: Clock },
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface HabitComposerProps {
  onAISuggestClick?: () => void;
  /** Callback to open member manager for current space */
  onManagePeople?: () => void;
  /** Callback to open space management modal */
  onManageSpaces?: () => void;
}

export function HabitComposer({ onAISuggestClick, onManagePeople, onManageSpaces }: HabitComposerProps) {
  const { user } = useWorkspaceAuth();
  const { spaces, currentSpace, setCurrentSpace } = useSpaces();
  const { addHabit } = useGrowStore();
  const { totalHabits } = useHabits();

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduleType, setScheduleType] = useState<FrequencyType>("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [isSubmitting, setIsSubmitting] = useState(false);

  const composerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const hasContent = useMemo(() => {
    return Boolean(title.trim());
  }, [title]);

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle("");
    setScheduleType("daily");
    setSelectedDays([1, 2, 3, 4, 5]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !user || !currentSpace || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // For team spaces, assign to all members by default
      // For personal space, only assign to the current user
      const assigneeIds = currentSpace.type !== 'personal' && currentSpace.memberUids?.length > 0
        ? currentSpace.memberUids
        : [user.uid];

      const newHabit: Habit = {
        id: generateUUID(),
        spaceId: currentSpace.id,
        title: title.trim(),
        schedule: {
          type: scheduleType,
          daysOfWeek: scheduleType === "specific_days" ? selectedDays : undefined,
        },
        assigneeIds,
        currentStreak: 0,
        bestStreak: 0,
        isFrozen: false,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };

      await addHabit(newHabit);
      resetState();
    } finally {
      setIsSubmitting(false);
    }
  }, [title, user, currentSpace, scheduleType, selectedDays, addHabit, isSubmitting, resetState]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  // Handle click outside to collapse/submit
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;
      if (isSubmitting) return;

      if (hasContent) {
        void handleSubmit();
      } else {
        resetState();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [expanded, hasContent, handleSubmit, resetState, isSubmitting]);

  return (
    <section className="w-full">
      {!expanded ? (
        // Collapsed state with space picker
        <Hint hint={HINTS.FIRST_HABIT} showWhen={totalHabits === 0}>
          <div className="flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
            <button
              type="button"
              className="flex-1 min-w-0 text-left text-sm text-zinc-400 dark:text-zinc-500 focus-visible:outline-none"
              onClick={() => setExpanded(true)}
            >
              <span>Add a new habit...</span>
            </button>
          {/* Compact space selector */}
          <InlineSpacePicker
            spaces={spaces}
            currentSpace={currentSpace}
            onSpaceChange={setCurrentSpace}
            onManagePeople={onManagePeople}
            onManageSpaces={onManageSpaces}
          />
          </div>
        </Hint>
      ) : (
        <div
          ref={composerRef}
          className="w-full rounded-2xl shadow-lg border transition-all bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex flex-col gap-3 px-5 py-4">
            {/* Title Input */}
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What habit do you want to build?"
              className="w-full bg-transparent text-lg font-semibold focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
            />

            {/* Schedule Type Selector */}
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = scheduleType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setScheduleType(option.type)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-transparent"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Day Selector (for specific days) */}
            {scheduleType === "specific_days" && (
              <div className="flex gap-1.5">
                {DAY_LABELS.map((label, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={clsx(
                      "w-8 h-8 rounded-full text-xs font-medium transition-colors",
                      selectedDays.includes(index)
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              {onAISuggestClick && (
                <button
                  type="button"
                  onClick={onAISuggestClick}
                  className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="AI Suggestions"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasContent || isSubmitting}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                hasContent && !isSubmitting
                  ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Adding..." : "Add Habit"}
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
