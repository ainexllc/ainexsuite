"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { NavigationPanel } from "./navigation-panel";
import { TopNav } from "./top-nav";
import { useNotes } from "@/components/providers/notes-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { formatRelativeTime } from "@/lib/utils/datetime";
import {
  CheckCircle2,
  ListChecks,
  MessageSquarePlus,
  Sparkles,
  Send,
  X,
} from "lucide-react";
import { SettingsPanel } from "./settings-panel";

type AppShellProps = {
  children: React.ReactNode;
};

type ActivePanel = "notifications" | "settings" | "ai-assistant" | null;

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { allNotes, pinned, others, loading } = useNotes();
  const {
    preferences,
    updatePreferences,
    loading: preferencesLoading,
  } = usePreferences();
  const [isNavOpen, setNavOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  useEffect(() => {
    if (!activePanel) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [activePanel]);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const togglePanel = useCallback((panel: Exclude<ActivePanel, null>) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }, []);

  const activityFeed = useMemo(() => {
    if (!allNotes.length) {
      return [];
    }

    return allNotes
      .slice(0, 5)
      .map((note) => ({
        id: note.id,
        title: note.title || (note.body ? note.body.slice(0, 48) : "Untitled note"),
        timestamp: note.updatedAt,
        pinned: note.pinned,
        type: note.type,
      }));
  }, [allNotes]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-base">
      <div className="relative z-10 flex min-h-screen flex-col text-ink-900">
        <TopNav
          onMenuClick={() => setNavOpen((prev) => !prev)}
          onRefresh={handleRefresh}
          onOpenSettings={() => togglePanel("settings")}
          onOpenAiAssistant={() => togglePanel("ai-assistant")}
          onOpenActivity={() => togglePanel("notifications")}
        />
        <div className="pointer-events-none fixed inset-x-0 top-16 z-20 h-3 bg-gradient-to-b from-orange-400/45 via-orange-400/15 to-transparent blur-md" />

        <main className="flex-1 overflow-x-hidden pt-16">
          <div className="centered-shell">
            {children}
          </div>
        </main>

        <Link
          href="/workspace/feedback"
          className="fixed bottom-6 left-6 z-30 inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-50 shadow-floating transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
          aria-label="Share feedback"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Feedback
        </Link>

        {/* Navigation overlay panel */}
        {isNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
        )}
        <NavigationPanel isOpen={isNavOpen} onClose={() => setNavOpen(false)} />

        {/* Right panel overlay */}
        {activePanel && (
          <div
            className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
            onClick={() => setActivePanel(null)}
          />
        )}

        {/* Right sliding panel */}
        <div
          className={clsx(
            "fixed inset-y-0 right-0 z-40 w-[480px] transform bg-surface-elevated/95 backdrop-blur-2xl border-l border-outline-subtle/60 shadow-2xl rounded-l-3xl transition-transform duration-300 ease-out",
            activePanel ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-outline-subtle/40 px-5 py-4">
              <span className="text-sm font-semibold text-ink-900">
                {activePanel === "notifications"
                  ? "Activity Center"
                  : activePanel === "settings"
                    ? "Settings"
                    : activePanel === "ai-assistant"
                      ? "AI Assistant"
                      : ""}
              </span>
              <button
                type="button"
                className="icon-button h-8 w-8 rounded-full bg-surface-muted hover:bg-ink-200"
                aria-label="Close panel"
                onClick={() => setActivePanel(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-6`}>
              {activePanel === "notifications" ? (
                <div className="space-y-4">

                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-14 animate-pulse rounded-2xl bg-surface-muted/80"
                        />
                      ))}
                    </div>
                  ) : activityFeed.length ? (
                    <ul className="space-y-2">
                      {activityFeed.map((activity) => (
                        <li
                          key={activity.id}
                          className="flex items-center justify-between rounded-2xl bg-surface-muted/80 px-4 py-3 shadow-sm"
                        >
                          <div>
                            <p className="text-sm font-semibold text-ink-800">
                              {activity.title}
                            </p>
                            <p className="text-xs text-muted">
                              Updated {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                              activity.pinned
                                ? "bg-accent-100 text-accent-600"
                                : activity.type === "checklist"
                                  ? "bg-ink-100 text-ink-700"
                                  : "bg-surface-muted text-ink-500",
                            )}
                          >
                            {activity.pinned ? (
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            ) : (
                              <ListChecks className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {activity.pinned ? "Pinned" : activity.type === "checklist"
                              ? "Checklist"
                              : "Note"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-2xl bg-surface-muted/40 px-5 py-6 text-center">
                      <p className="font-semibold text-ink-700">
                        You&apos;re all caught up
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Capture a new idea and it will appear here instantly.
                      </p>
                    </div>
                  )}

                  <footer className="rounded-2xl bg-surface-muted px-4 py-3 text-xs text-muted">
                    <span>
                      {pinned.length} pinned · {others.length} in progress
                    </span>
                  </footer>
                </div>
              ) : activePanel === "settings" ? (
                <SettingsPanel
                  preferences={preferences}
                  isLoading={preferencesLoading}
                  onUpdate={updatePreferences}
                  onClose={() => setActivePanel(null)}
                />
              ) : activePanel === "ai-assistant" ? (
                <div className="flex h-full flex-col space-y-4">
                  <header className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Assistant
                    </div>
                    <h2 className="text-lg font-semibold text-ink-800">
                      How can I help?
                    </h2>
                    <p className="text-sm text-muted">
                      Ask me anything about your notes, get summaries, or find what you need.
                    </p>
                  </header>

                  <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-surface-muted/40 p-4">
                    <div className="rounded-xl bg-white/60 px-4 py-3 shadow-sm dark:bg-surface-elevated/60">
                      <p className="text-sm font-medium text-ink-700">
                        💡 Suggested prompts
                      </p>
                      <ul className="mt-2 space-y-2 text-sm text-muted">
                        <li className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted">
                          Summarize my recent notes
                        </li>
                        <li className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted">
                          Find notes about work projects
                        </li>
                        <li className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted">
                          What reminders do I have today?
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask me anything..."
                        className="flex-1 rounded-xl border border-outline-subtle bg-white px-4 py-2 text-sm text-ink-700 shadow-sm focus:border-accent-500 focus:outline-none dark:bg-surface-elevated"
                      />
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white shadow-sm transition hover:bg-accent-400"
                        aria-label="Send message"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    <footer className="text-xs text-muted">
                      <span>Powered by AI</span>
                    </footer>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
