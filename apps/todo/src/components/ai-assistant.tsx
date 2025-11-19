'use client';

import { useState } from 'react';
import { useGrokAssistant } from '@ainexsuite/ai';
import { Sparkles, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const { messages, sendMessage, loading } = useGrokAssistant({
    appName: 'todo',
    systemPrompt: `You are a productive AI task management assistant.

Your role is to help users:
- Break down large projects into actionable tasks
- Prioritize tasks effectively
- Suggest time estimates for tasks
- Create subtasks for complex tasks
- Organize tasks into logical projects
- Provide productivity tips and strategies

Be concise, actionable, and focused on helping users get things done.`,
  });

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-accent-500 to-accent-400 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50',
          isOpen && 'rotate-180'
        )}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] surface-elevated border border-surface-hover rounded-lg shadow-2xl flex flex-col z-50">
          <div className="p-4 border-b border-surface-hover">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Task Assistant</h3>
                <p className="text-xs text-ink-600">Powered by Grok</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-ink-600 py-8 space-y-2 text-sm">
                <p>I can help you stay organized!</p>
                <p>Ask me to:</p>
                <p>• Break down big tasks</p>
                <p>• Prioritize your work</p>
                <p>• Organize projects</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2 rounded-lg',
                      message.role === 'user'
                        ? 'bg-accent-500 text-white'
                        : 'surface-card'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="surface-card px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-surface-hover">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                className="flex-1 px-3 py-2 surface-card rounded-lg border border-surface-hover focus:border-accent-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
