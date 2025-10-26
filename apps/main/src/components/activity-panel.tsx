'use client';

import { X, Settings as SettingsIcon, Activity as ActivityIcon, Sparkles, Send } from 'lucide-react';
import { clsx } from 'clsx';

interface ActivityPanelProps {
  isOpen: boolean;
  activeView: 'activity' | 'settings' | 'ai-assistant' | null;
  onClose: () => void;
}

export function ActivityPanel({ isOpen, activeView, onClose }: ActivityPanelProps) {
  return (
    <div
      className={clsx(
        "fixed inset-y-0 right-0 z-40 w-[480px] transform bg-surface-elevated/95 backdrop-blur-2xl border-l border-outline-subtle/60 shadow-2xl rounded-l-3xl transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-outline-subtle/40 px-5 py-4">
          <span className="text-sm font-semibold text-ink-900">
            {activeView === 'activity' ? 'Activity Center' : activeView === 'settings' ? 'Settings' : activeView === 'ai-assistant' ? 'AI Assistant' : ''}
          </span>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted hover:bg-ink-200 transition-colors"
            aria-label="Close panel"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'activity' ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-surface-muted/40 px-5 py-6 text-center">
                <ActivityIcon className="h-8 w-8 mx-auto mb-3 text-ink-500" />
                <p className="font-semibold text-ink-700">
                  You&apos;re all caught up
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Your recent activity will appear here
                </p>
              </div>

              <footer className="rounded-2xl bg-surface-muted px-4 py-3 text-xs text-ink-600">
                <span>Activity feed coming soon</span>
              </footer>
            </div>
          ) : activeView === 'settings' ? (
            <div className="space-y-6">
              <div className="rounded-2xl bg-surface-muted/40 px-5 py-6 text-center">
                <SettingsIcon className="h-8 w-8 mx-auto mb-3 text-ink-500" />
                <p className="font-semibold text-ink-700">
                  Settings
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Preferences and configuration options
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-xl bg-surface-muted/80 px-4 py-3 text-left hover:bg-surface-muted transition-colors"
                >
                  <span className="text-sm font-semibold text-ink-700">Theme</span>
                  <span className="text-xs text-ink-500">System</span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-xl bg-surface-muted/80 px-4 py-3 text-left hover:bg-surface-muted transition-colors"
                >
                  <span className="text-sm font-semibold text-ink-700">Language</span>
                  <span className="text-xs text-ink-500">English</span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-xl bg-surface-muted/80 px-4 py-3 text-left hover:bg-surface-muted transition-colors"
                >
                  <span className="text-sm font-semibold text-ink-700">Notifications</span>
                  <span className="text-xs text-ink-500">Enabled</span>
                </button>
              </div>
            </div>
          ) : activeView === 'ai-assistant' ? (
            <div className="flex h-full flex-col space-y-4">
              <header className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Assistant
                </div>
                <h2 className="text-lg font-semibold text-ink-800">
                  How can I help?
                </h2>
                <p className="text-sm text-ink-600">
                  Ask me anything about your apps, get summaries, or find what you need.
                </p>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-surface-muted/40 p-4">
                <div className="rounded-xl bg-white/60 px-4 py-3 shadow-sm">
                  <p className="text-sm font-medium text-ink-700">
                    💡 Suggested prompts
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-ink-600">
                    <li className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted">
                      Summarize my recent activity
                    </li>
                    <li className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted">
                      Find notes about work projects
                    </li>
                    <li className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted">
                      What tasks do I have today?
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="flex-1 rounded-xl border border-outline-subtle bg-white px-4 py-2 text-sm text-ink-700 shadow-sm focus:border-accent-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white shadow-sm transition hover:bg-accent-400"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <footer className="text-xs text-ink-600">
                  <span>Powered by AI</span>
                </footer>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
