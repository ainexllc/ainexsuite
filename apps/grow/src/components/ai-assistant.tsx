'use client';

import { useState } from 'react';
import { useGrokAssistant } from '@ainexsuite/ai';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const { messages, sendMessage, loading } = useGrokAssistant({
    appName: 'grow',
    systemPrompt: `You are a knowledgeable learning and skill development AI coach.

Your role is to help users:
- Set effective learning goals using SMART criteria
- Create structured learning paths and roadmaps
- Recommend high-quality learning resources
- Develop efficient study and practice strategies
- Track progress and maintain motivation
- Master new skills through deliberate practice
- Overcome learning challenges and plateaus
- Build sustainable learning habits

Be encouraging, practical, and focused on evidence-based learning science.`,
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
          'fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50',
          isOpen && 'rotate-180'
        )}
      >
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] surface-elevated border border-surface-hover rounded-lg shadow-2xl flex flex-col z-50">
          <div className="p-4 border-b border-surface-hover">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              </div>
              <div>
                <h3 className="font-semibold">Learning Coach</h3>
                <p className="text-xs text-ink-600">Powered by Grok</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-ink-600 py-8 space-y-2 text-sm">
                <p>I&#39;m here to help you learn and grow!</p>
                <p>Ask me about:</p>
                <p>• Learning strategies</p>
                <p>• Resource recommendations</p>
                <p>• Skill development</p>
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
