'use client';

import { X, Settings as SettingsIcon, Activity as ActivityIcon, Send, Mic, MicOff } from 'lucide-react';
import { clsx } from 'clsx';
import { useEnhancedAssistant, useVoiceInput } from '@ainexsuite/ai';
import { useRef, useEffect } from 'react';

interface ActivityPanelProps {
  isOpen: boolean;
  activeView: 'activity' | 'settings' | 'ai-assistant' | null;
  onClose: () => void;
}

export function ActivityPanel({ isOpen, activeView, onClose }: ActivityPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize enhanced AI assistant
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    appContext,
    contextLoading
  } = useEnhancedAssistant({
    includeFullContext: true, // Enable smart cross-app context
    systemPrompt: `You are the intelligent assistant for AINexSuite. 
    You have access to the user's data across Notes, Tasks, Journal, Habits, Health, and Fitness apps.
    Use this context to provide personalized, actionable, and insightful responses.
    Be concise, encouraging, and proactive.`,
  });

  // Initialize Voice Input
  const {
    isListening,
    transcript,
    isSupported,
    toggleListening
  } = useVoiceInput({
    onResult: (text) => {
       // When speech is finalized, update the chat input
       if (text) {
         setInput((prev: string) => {
            const separator = prev ? ' ' : '';
            return prev + separator + text;
         });
       }
    },
    onError: (err) => console.error("Voice Error:", err)
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

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
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                    AI Assistant
                  </div>
                  {contextLoading && (
                    <span className="text-xs text-ink-400 animate-pulse">Loading context...</span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-ink-800">
                  How can I help?
                </h2>
                <p className="text-sm text-ink-600">
                  I have access to your notes, tasks, and activity. Ask me anything!
                </p>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-surface-muted/40 p-4 min-h-[300px]">
                {messages.length === 0 ? (
                  <div className="rounded-xl bg-white/60 px-4 py-3 shadow-sm">
                    <p className="text-sm font-medium text-ink-700">
                      💡 Suggested prompts
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-ink-600">
                      <li
                        className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted"
                        onClick={() => handleInputChange({ target: { value: 'Summarize my tasks due today' } } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        Summarize my tasks due today
                      </li>
                      <li
                        className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted"
                        onClick={() => handleInputChange({ target: { value: 'How has my workout consistency been this week?' } } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        How has my workout consistency been?
                      </li>
                      <li
                        className="cursor-pointer rounded-lg bg-surface-muted/60 px-3 py-2 transition hover:bg-surface-muted"
                        onClick={() => handleInputChange({ target: { value: 'Find notes about project planning' } } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        Find notes about project planning
                      </li>
                    </ul>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={clsx(
                        "flex w-full flex-col gap-1 rounded-xl px-4 py-3 text-sm shadow-sm",
                        msg.role === 'user'
                          ? "ml-auto max-w-[85%] bg-accent-500 text-white"
                          : "mr-auto max-w-[90%] bg-white text-ink-800"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-ink-400 px-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-ink-400" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={isListening ? (input + (transcript ? ' ' + transcript : '')) : input}
                    onChange={handleInputChange}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    className={clsx(
                      "flex-1 rounded-xl border bg-white px-4 py-2 text-sm text-ink-700 shadow-sm focus:border-accent-500 focus:outline-none disabled:opacity-50 pr-10",
                      isListening ? "border-red-400 ring-2 ring-red-100" : "border-outline-subtle"
                    )}
                    disabled={isLoading}
                  />
                  
                  {/* Voice Button */}
                  {isSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={clsx(
                        "absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors",
                        isListening ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-ink-400 hover:text-ink-600 hover:bg-surface-muted"
                      )}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (!input.trim() && !transcript)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white shadow-sm transition hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <footer className="text-xs text-ink-600 flex justify-between items-center px-1">
                  <span>Powered by AINex AI</span>
                  <div className="flex items-center gap-3">
                    {isListening && (
                        <span className="text-[10px] text-red-500 font-medium animate-pulse">
                          ● Recording
                        </span>
                    )}
                    {appContext && (
                      <span className="text-[10px] text-green-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Context Active
                      </span>
                    )}
                  </div>
                </footer>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
