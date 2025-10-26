"use client";

import { useState } from "react";
import { useGrokAssistant } from "@ainexsuite/ai";
import { Sparkles, Send, X } from "lucide-react";

export function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, loading } = useGrokAssistant("{{APP_NAME}}");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    await sendMessage(input);
    setInput("");
  };

  return (
    <>
      {/* Floating AI button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="AI Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* AI Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-96 flex-col rounded-xl surface-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-outline-subtle p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10">
              <Sparkles className="h-5 w-5 text-accent-500" />
            </div>
            <div>
              <h3 className="font-semibold text-ink-900">AI Assistant</h3>
              <p className="text-xs text-ink-600">Powered by Grok 4</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <Sparkles className="mx-auto h-12 w-12 text-ink-400 mb-3" />
                  <p className="text-sm text-ink-600">
                    Ask me anything about your {{APP_NAME}}!
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-accent-500 text-white"
                      : "surface-card-muted text-ink-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="surface-card-muted max-w-[80%] rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-accent-500" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-accent-500" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-accent-500" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-outline-subtle p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI..."
                className="flex-1 rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-900 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500 text-white transition-opacity disabled:opacity-50 hover:bg-accent-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
