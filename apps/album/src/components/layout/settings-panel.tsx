"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Check, Loader2, Settings as SettingsIcon } from "lucide-react";
import type { MomentsPreferences } from "@/lib/types/settings";

type SettingsPanelProps = {
  preferences: MomentsPreferences;
  isLoading: boolean;
  onUpdate: (
    updates: Partial<Omit<MomentsPreferences, "id" | "userId" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  onClose: () => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const VIEW_OPTIONS: Array<{
  value: MomentsPreferences['defaultView'];
  label: string;
  description: string;
}> = [
  {
    value: 'timeline',
    label: 'Timeline',
    description: 'Chronological list view with full details',
  },
  {
    value: 'masonry',
    label: 'Masonry',
    description: 'Grid layout showcasing photos',
  },
  {
    value: 'calendar',
    label: 'Calendar',
    description: 'Activity calendar heatmap',
  },
];

const SORT_OPTIONS: Array<{
  value: MomentsPreferences['defaultSort'];
  label: string;
  description: string;
}> = [
  {
    value: 'date',
    label: 'Date Captured',
    description: 'Sort by when the moment was captured',
  },
  {
    value: 'createdAt',
    label: 'Date Added',
    description: 'Sort by when the moment was added to the app',
  },
  {
    value: 'title',
    label: 'Title',
    description: 'Sort alphabetically by title',
  },
];

export function SettingsPanel({ preferences, isLoading, onUpdate, onClose: _onClose }: SettingsPanelProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (saveState !== "saved") {
      return;
    }
    const timeout = window.setTimeout(() => setSaveState("idle"), 2400);
    return () => window.clearTimeout(timeout);
  }, [saveState]);

  const handleViewChange = useCallback(
    async (view: MomentsPreferences['defaultView']) => {
      setError(null);
      setSaveState("saving");
      try {
        await onUpdate({ defaultView: view });
        setSaveState("saved");
      } catch (err) {
        setSaveState("error");
        setError(err instanceof Error ? err.message : "Unable to update default view");
      }
    },
    [onUpdate]
  );

  const handleSortChange = useCallback(
    async (sort: MomentsPreferences['defaultSort']) => {
      setError(null);
      setSaveState("saving");
      try {
        await onUpdate({ defaultSort: sort });
        setSaveState("saved");
      } catch (err) {
        setSaveState("error");
        setError(err instanceof Error ? err.message : "Unable to update default sort");
      }
    },
    [onUpdate]
  );

  const handleCaptionsToggle = useCallback(
    async (show: boolean) => {
      setError(null);
      setSaveState("saving");
      try {
        await onUpdate({ showCaptions: show });
        setSaveState("saved");
      } catch (err) {
        setSaveState("error");
        setError(err instanceof Error ? err.message : "Unable to update captions setting");
      }
    },
    [onUpdate]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="space-y-1 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
          <SettingsIcon className="h-3.5 w-3.5" />
          Settings
        </div>
        <h2 className="text-lg font-semibold text-ink-800">Moments preferences</h2>
        <p className="text-sm text-muted">
          Customize how you view and organize your memories.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-6 pb-10">
          {/* Default View */}
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/50 p-5 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-500/10 text-accent-600">
                <Camera className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-ink-800">Default View</h3>
                <p className="text-xs text-muted">
                  Choose how moments are displayed when you open the app.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {VIEW_OPTIONS.map(({ value, label, description }) => {
                const isActive = preferences.defaultView === value;
                const isPending = saveState === "saving";
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleViewChange(value)}
                    disabled={isLoading || isPending}
                    aria-pressed={isActive}
                    className={`flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 ${
                      isActive
                        ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                        : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400"
                    }`}
                  >
                    <div className="inline-flex items-center gap-2 text-sm font-semibold">
                      {label}
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wide text-accent-600">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Default Sort */}
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-800">Default Sort Order</h3>
              <p className="text-xs text-muted">
                Choose how moments are sorted by default.
              </p>
            </div>
            <div className="grid gap-3">
              {SORT_OPTIONS.map(({ value, label, description }) => {
                const isActive = preferences.defaultSort === value;
                const isPending = saveState === "saving";
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSortChange(value)}
                    disabled={isLoading || isPending}
                    aria-pressed={isActive}
                    className={`flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 ${
                      isActive
                        ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                        : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400"
                    }`}
                  >
                    <div className="inline-flex items-center gap-2 text-sm font-semibold">
                      {label}
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wide text-accent-600">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Display Options */}
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-800">Display Options</h3>
              <p className="text-xs text-muted">Customize what information is shown.</p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCaptionsToggle(!preferences.showCaptions)}
                disabled={isLoading || saveState === "saving"}
                aria-pressed={preferences.showCaptions}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 ${
                  preferences.showCaptions
                    ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                    : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="inline-flex items-start gap-2 text-sm font-semibold">
                    Show Captions
                    <span
                      className={`text-[10px] uppercase tracking-wide ${
                        preferences.showCaptions ? "text-accent-600" : "text-ink-400"
                      }`}
                    >
                      {saveState === "saving" ? "Updating…" : preferences.showCaptions ? "On" : "Off"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Display captions alongside photos in timeline and masonry views.
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* Save State Indicator */}
          {saveState === "saved" && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-success">
              <Check className="h-4 w-4" />
              Settings saved
            </div>
          )}

          {saveState === "saving" && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}

          {error && (
            <p className="text-xs font-semibold text-danger text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
