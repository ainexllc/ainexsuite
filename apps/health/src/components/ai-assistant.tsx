'use client';

import { useState } from 'react';
import { useGrokAssistant } from '@ainexsuite/ai';
import { Sparkles, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const { messages, sendMessage, loading } = useGrokAssistant({
    appName: 'health',
    systemPrompt: `You are a supportive health and wellness AI assistant.

Your role is to help users:
- Track and understand their body metrics (weight, sleep, hydration, vitals)
- Identify patterns and correlations in their health data
- Provide science-backed wellness tips
- Offer gentle guidance on improving sleep, hydration, and energy
- Celebrate progress and encourage consistency
- Suggest when to consult healthcare professionals

Important: You are NOT a medical professional. Always recommend consulting doctors for medical concerns.

Be supportive, encouraging, and focused on holistic wellness.`,
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
        type="button"
        className={cn(
          'fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50',
          isOpen && 'rotate-180'
        )}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-surface-elevated border border-outline-subtle rounded-2xl shadow-2xl flex flex-col z-50">
          <div className="p-4 border-b border-outline-subtle">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900">Health Coach</h3>
                <p className="text-xs text-ink-500">Powered by Grok</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-ink-500 py-8 space-y-2 text-sm">
                <p>I&apos;m here to help with your wellness journey!</p>
                <p>Ask me about:</p>
                <p> Improving sleep quality</p>
                <p> Staying hydrated</p>
                <p> Understanding your trends</p>
                <p> Energy optimization tips</p>
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
                      'max-w-[80%] px-4 py-2 rounded-xl',
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-surface-muted text-ink-900'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-muted px-4 py-2 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-outline-subtle">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about your health..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-surface-muted rounded-xl border border-outline-subtle focus:border-primary focus:outline-none disabled:opacity-50 text-ink-900"
              />
              <button
                onClick={handleSend}
                type="button"
                disabled={!input.trim() || loading}
                className="p-2 bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 text-white"
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
