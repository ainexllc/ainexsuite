"use client";

import { useCallback, useState } from "react";
import {
  CheckSquare,
  Loader2,
  Check,
  Settings,
  Bell,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import { clsx } from "clsx";

// Simple preferences for Todo app
interface TodoPreferences {
  defaultView?: 'list' | 'masonry' | 'board' | 'my-day' | 'matrix' | 'calendar';
  showCompletedTasks?: boolean;
  enableDueDateReminders?: boolean;
  taskSortOrder?: 'manual' | 'dueDate' | 'priority' | 'createdAt';
}

type SettingsPanelProps = {
  preferences: TodoPreferences;
  isLoading: boolean;
  onUpdate: (updates: Partial<TodoPreferences>) => Promise<void>;
  onClose: () => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const VIEW_OPTIONS: Array<{
  value: TodoPreferences['defaultView'];
  label: string;
}> = [
  { value: 'list', label: 'List View' },
  { value: 'masonry', label: 'Masonry View' },
  { value: 'board', label: 'Board View' },
  { value: 'my-day', label: 'My Day' },
  { value: 'matrix', label: 'Eisenhower Matrix' },
  { value: 'calendar', label: 'Calendar View' },
];

const SORT_OPTIONS: Array<{
  value: TodoPreferences['taskSortOrder'];
  label: string;
  description: string;
}> = [
  { value: 'manual', label: 'Manual', description: 'Drag and drop to reorder' },
  { value: 'dueDate', label: 'Due Date', description: 'Sort by when tasks are due' },
  { value: 'priority', label: 'Priority', description: 'Sort by task priority' },
  { value: 'createdAt', label: 'Created Date', description: 'Sort by creation date' },
];

export function SettingsPanel({
  preferences,
  isLoading,
  onUpdate,
  onClose: _onClose,
}: SettingsPanelProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (key: keyof TodoPreferences, value: boolean) => {
      setError(null);
      setSaveState("saving");
      try {
        await onUpdate({ [key]: value });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch (err) {
        setSaveState("error");
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update that preference."
        );
      }
    },
    [onUpdate]
  );

  const handleSelect = useCallback(
    async (key: keyof TodoPreferences, value: string) => {
      setError(null);
      setSaveState("saving");
      try {
        await onUpdate({ [key]: value });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch (err) {
        setSaveState("error");
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update that preference."
        );
      }
    },
    [onUpdate]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="space-y-1 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </div>
        <h2 className="text-lg font-semibold text-ink-800">Task preferences</h2>
        <p className="text-sm text-muted">
          Customize how you view and manage your tasks.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-6 pb-10">
          {/* Default View */}
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/50 p-5 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-500/10 text-accent-600">
                <List className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-ink-800">Default view</h3>
                <p className="text-xs text-muted">
                  Choose which view opens when you navigate to your workspace.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <select
                value={preferences.defaultView || 'list'}
                onChange={(e) => handleSelect('defaultView', e.target.value)}
                disabled={isLoading || saveState === "saving"}
                className="w-full rounded-xl border border-outline-subtle/60 bg-white/90 px-3 py-2 text-sm text-ink-700 shadow-sm transition focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated/80 dark:text-ink-200"
              >
                {VIEW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Task Sort Order */}
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-800">Default sort order</h3>
              <p className="text-xs text-muted">
                How tasks should be ordered in list views.
              </p>
            </div>
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => {
                const isSelected = (preferences.taskSortOrder || 'manual') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect('taskSortOrder', option.value!)}
                    disabled={isLoading || saveState === "saving"}
                    className={clsx(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                      isSelected
                        ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                        : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400"
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        {option.label}
                        {isSelected && (
                          <span className="text-[10px] uppercase tracking-wide text-accent-600">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Task Display Options */}
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-800">Display options</h3>
              <p className="text-xs text-muted">
                Control what tasks are shown in your workspace.
              </p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    "showCompletedTasks",
                    !preferences.showCompletedTasks
                  )
                }
                disabled={isLoading || saveState === "saving"}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                  preferences.showCompletedTasks
                    ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                    : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400"
                )}
              >
                <CheckSquare className="h-5 w-5 mt-0.5" />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold">
                    Show completed tasks
                    <span
                      className={clsx(
                        "text-[10px] uppercase tracking-wide",
                        preferences.showCompletedTasks
                          ? "text-accent-600"
                          : "text-ink-400"
                      )}
                    >
                      {preferences.showCompletedTasks ? "On" : "Off"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Display completed tasks alongside active tasks in all views.
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-500/10 text-indigo-600">
                <Bell className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-ink-800">Reminders</h3>
                <p className="text-xs text-muted">
                  Get notified when tasks are due or approaching their deadline.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    "enableDueDateReminders",
                    !preferences.enableDueDateReminders
                  )
                }
                disabled={isLoading || saveState === "saving"}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                  preferences.enableDueDateReminders
                    ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                    : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400"
                )}
              >
                <CalendarIcon className="h-5 w-5 mt-0.5" />
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold">
                    Due date reminders
                    <span
                      className={clsx(
                        "text-[10px] uppercase tracking-wide",
                        preferences.enableDueDateReminders
                          ? "text-accent-600"
                          : "text-ink-400"
                      )}
                    >
                      {preferences.enableDueDateReminders ? "On" : "Off"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Receive notifications when tasks are approaching their due date.
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* Save state indicator */}
          {saveState === "saved" && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-success">
              <Check className="h-4 w-4" />
              Settings saved
            </div>
          )}

          {saveState === "saving" && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}

          {error && (
            <p className="text-center text-xs font-semibold text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
