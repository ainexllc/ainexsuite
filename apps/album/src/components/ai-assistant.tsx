'use client';

import { useState } from 'react';
import { useGrokAssistant } from '@ainexsuite/ai';
import { useAppColors } from '@ainexsuite/theme';
import { Sparkles, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { primary: primaryColor, secondary: secondaryColor } = useAppColors();

  const { messages, sendMessage, loading } = useGrokAssistant({
    appName: 'album',
    systemPrompt: `You are a creative photography and memory-keeping AI assistant.

Your role is to help users:
- Organize and categorize their photo collections
- Suggest meaningful captions and descriptions
- Create thematic photo albums and collections
- Find patterns and themes in their memories
- Suggest creative ways to preserve moments
- Provide photography tips and composition advice
- Help tell stories through their photos

Be creative, nostalgic, and help users cherish their precious memories.`,
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
          'fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50',
          isOpen && 'rotate-180'
        )}
        style={{
          background: `linear-gradient(to bottom right, ${secondaryColor}, ${primaryColor})`
        }}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] surface-elevated border border-surface-hover rounded-lg shadow-2xl flex flex-col z-50">
          <div className="p-4 border-b border-surface-hover">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, ${secondaryColor}, ${primaryColor})`
                }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Memory Keeper</h3>
                <p className="text-xs text-ink-600">Powered by Grok</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-ink-600 py-8 space-y-2 text-sm">
                <p>I&#39;m here to help you organize and cherish your moments!</p>
                <p>Ask me about:</p>
                <p>• Photo captions</p>
                <p>• Organization ideas</p>
                <p>• Photography tips</p>
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
                        ? 'text-white'
                        : 'surface-card'
                    )}
                    style={message.role === 'user' ? { backgroundColor: primaryColor } : undefined}
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
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: primaryColor }} />
                    <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: primaryColor }} />
                    <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: primaryColor }} />
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
                className="flex-1 px-3 py-2 surface-card rounded-lg border border-surface-hover focus:outline-none disabled:opacity-50"
                style={{ '--tw-border-opacity': '1', borderColor: primaryColor } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = primaryColor}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => !input.trim() || loading ? null : e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
