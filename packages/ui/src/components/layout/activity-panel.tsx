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
        "fixed inset-y-0 right-0 z-40 w-[480px] transform bg-black/60 backdrop-blur-xl border-l border-white/10 shadow-2xl rounded-l-3xl transition-transform duration-300 ease-out overflow-hidden",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      {/* Glow Effects */}
      <div className="absolute -top-32 -left-32 h-80 w-80 bg-purple-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-50" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-sm font-semibold text-white">
            {activeView === 'activity' ? 'Activity Center' : activeView === 'settings' ? 'Settings' : activeView === 'ai-assistant' ? 'AI Assistant' : ''}
          </span>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            aria-label="Close panel"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-white">
          {activeView === 'activity' ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 px-5 py-6 text-center border border-white/5">
                <ActivityIcon className="h-8 w-8 mx-auto mb-3 text-white/50" />
                <p className="font-semibold text-white">
                  You&apos;re all caught up
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Your recent activity will appear here
                </p>
              </div>

              <footer className="rounded-2xl bg-white/5 px-4 py-3 text-xs text-white/50 border border-white/5">
                <span>Activity feed coming soon</span>
              </footer>
            </div>
          ) : activeView === 'settings' ? (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white/5 px-5 py-6 text-center border border-white/5">
                <SettingsIcon className="h-8 w-8 mx-auto mb-3 text-white/50" />
                <p className="font-semibold text-white">
                  Settings
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Preferences and configuration options
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition-colors border border-white/5"
                >
                  <span className="text-sm font-semibold text-white">Theme</span>
                  <span className="text-xs text-white/50">System</span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition-colors border border-white/5"
                >
                  <span className="text-sm font-semibold text-white">Language</span>
                  <span className="text-xs text-white/50">English</span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition-colors border border-white/5"
                >
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs text-white/50">Enabled</span>
                </button>
              </div>
            </div>
          ) : activeView === 'ai-assistant' ? (
            <div className="flex h-full flex-col space-y-4">
              <header className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300 border border-purple-500/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Assistant
                </div>
                <h2 className="text-lg font-semibold text-white">
                  How can I help?
                </h2>
                <p className="text-sm text-white/60">
                  Ask me anything about your apps, get summaries, or find what you need.
                </p>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white/5 p-4 border border-white/5">
                <div className="rounded-xl bg-white/5 px-4 py-3 shadow-sm border border-white/5">
                  <p className="text-sm font-medium text-white">
                    💡 Suggested prompts
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-white/60">
                    <li className="cursor-pointer rounded-lg bg-white/5 px-3 py-2 transition hover:bg-white/10 hover:text-white">
                      Summarize my recent activity
                    </li>
                    <li className="cursor-pointer rounded-lg bg-white/5 px-3 py-2 transition hover:bg-white/10 hover:text-white">
                      Find notes about work projects
                    </li>
                    <li className="cursor-pointer rounded-lg bg-white/5 px-3 py-2 transition hover:bg-white/10 hover:text-white">
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
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white shadow-sm focus:border-purple-500 focus:outline-none placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm transition hover:bg-white/20 border border-white/10"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <footer className="text-xs text-white/40">
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
